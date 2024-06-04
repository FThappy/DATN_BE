import admin from "../config/firebase.js";
import User from "../models/User.js";
import { changeFile, deleteFile, uploadFile } from "../utils/file.js";
import Post from "./../models/Post.js";

const bucket = admin.storage().bucket();

const NUMBER_POST = 5;

export const createPost = async (req, res) => {
  const documention = req.body.documention;
  const privacy = req.body.privacy;
  const type = req.body.type;
  const organizationId = req.body.organizationId;
  const file = req.files;
  const time = new Date().getTime();
  try {
    const user = await User.findOne({ _id: req.userId.id });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const promises = file.map(async (file, index) => {
      const url = await uploadFile(file, index, time, req.userId.id ,"post");
      return url;
    });
    const urlFile = await Promise.all(promises);
    const newPost = new Post({
      userId: req.userId.id,
      document: documention,
      img: urlFile,
      privacy: privacy,
      filePath: `post-${req.userId.id}-${time}`,
    });
    if(organizationId){
      newPost.organizationId = organizationId;
    }
    if(type){
      newPost.type = type;
    }
    await newPost.save();
    return res
      .status(200)
      .json({ message: "Success post", code: 0, post: newPost });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const updatePost = async (req, res) => {
  const documention = req.body.documention;
  const privacy = req.body.privacy;
  const newFile = req.files;
  const imageRemove = req.body.imageRemove;
  const userId = req.query.userId;
  const postId = req.query.postId;

  try {
    const post = await Post.findOne({ _id: postId, userId: req.userId.id });
    if (!post) {
      return res.status(404).json({ msg: "Not found post", code: 3 });
    }
    if (privacy) {
      post.privacy = privacy;
    }
    if (documention) {
      post.document = documention;
    }
    if (imageRemove) {
      const listRemove = JSON.parse(imageRemove);
      const promise = listRemove.map(async (urlImageRemove, index) => {
        const fileUrl = urlImageRemove.split("/");
        const originalName = fileUrl[5].split("?")[0];
        const path = fileUrl[4] + "/" + originalName;
        await deleteFile(path);
      });
      await Promise.all(promise);

      post.img = post.img.filter((item) => !listRemove.includes(item));
    }
    if (newFile) {
      const promises = newFile.map(async (file, index) => {
        const url = await changeFile(file, index, post.filePath, post.__v + 1);
        return url;
      });
      const urlFile = await Promise.all(promises);
      post.img = [...post.img, ...urlFile];
    }
    await post.save();
    return res
      .status(200)
      .json({ message: "Success register", code: 0, post: post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getPost = async (req, res) => {
  const page = req.query.page;
  try {
    const skipPost = page * NUMBER_POST;
    const listPost = await Post.find({ isDelete: false, isLock: false })
      .sort({ _id: -1 })
      .skip(skipPost)
      .limit(5);
    return res
      .status(200)
      .json({ message: "Success", data: listPost, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getPostPublic = async (req, res) => {
  const page = req.query.page;
  try {
    const skipPost = page * NUMBER_POST;
    const listPost = await Post.find({ privacy: "global", isDelete: false, isLock: false })
      .sort({ _id: -1 })
      .skip(skipPost)
      .limit(5);
    return res
      .status(200)
      .json({ message: "Success", data: listPost, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getPostByUser = async (req, res) => {
  const userId = req.params.userId;
  const page = req.query.page;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const skipPost = page * NUMBER_POST;
    const listPost = await Post.find({ userId: userId, isDelete: false })
      .sort({ _id: -1 })
      .skip(skipPost)
      .limit(5);
    return res
      .status(200)
      .json({ message: "Success", data: listPost, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const deletePost = async (req, res) => {
  const userId = req.query.userId;
  const postId = req.query.postId;
  try {
    const post = await Post.findOne({ _id: postId, userId: userId });
    if (!post) {
      return res.status(404).json({ msg: "Not found post", code: 3 });
    } else {
      post.isDelete = true;
      await post.save();
      return res.status(200).json({ message: "Success delete", code: 0 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getPostByEvent = async (req, res) => {
  const page = req.query.page;
  const organizationId = req.query.organizationId;
  try {
    const skipPost = page * NUMBER_POST;
    const listPost = await Post.find({
      isDelete: false,
      isLock: false,
      organizationId: organizationId,
    })
      .sort({ _id: -1 })
      .skip(skipPost)
      .limit(5);
    return res
      .status(200)
      .json({ message: "Success", data: listPost, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};