import User from "../models/User.js";
import Project from "../models/Project.js";
import admin from "../config/firebase.js";
import { changeFile, deleteFile, uploadFile } from "../utils/file.js";
import { checkValidCard } from "../utils/utilsCard.js";
import Like from "../models/Like.js";

const bucket = admin.storage().bucket();

const NUMBER_PROJECT = 8;

export const createProject = async (req, res) => {
  const projectName = req.body.projectName;
  const date = new Date(req.body.date);
  const goal = Number(req.body.goal);
  const city = req.body.city;
  const type = req.body.type;
  const listType = JSON.parse(type);
  const cardNumber = req.body.cardNumber;
  const description = req.body.description;
  const file = req.files.file ? req.files.file : [];
  const fileContent = req.files.fileContent;
  const content = req.body.content;
  const contentJSON = JSON.parse(content);
  const tmpImgJSON = req.body.tmpImg;
  const tmpImg = JSON.parse(tmpImgJSON);
  const time = new Date().getTime();

  try {
    const user = await User.findOne({ _id: req.userId.id });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (
      !projectName ||
      !description ||
      !date ||
      !city ||
      !listType ||
      !content
    ) {
      return res
        .status(400)
        .json({ message: "Không đầy đủ thông tin", code: 2 });
    }
    const promises = file.map(async (file, index) => {
      const url = await uploadFile(file, index, time, req.userId.id, "project");
      return url;
    });
    const urlFile = await Promise.all(promises);

    if (fileContent && fileContent.length > 0) {
      const promisesContent = fileContent.map(async (file, index) => {
        const url = await uploadFile(
          file,
          index,
          time,
          req.userId.id,
          "project"
        );
        contentJSON.content
          .filter((item) => item.type === "image")
          .map((item) => {
            if (item.attrs.src === tmpImg[index].attrs.src) {
              item.attrs.src = url;
            }
          });
      });
      const urlFileContent = await Promise.all(promisesContent);
    }

    const newProject = new Project({
      userId: req.userId.id,
      projectName: projectName,
      timeEnd: date,
      description: description,
      city: city,
      content: contentJSON,
      image: urlFile,
      type: listType,
      filePath: `project-${req.userId.id}-${time}`,
    });

    if (goal) {
      newProject.goal = goal;
    }
    if (cardNumber) {
      if (checkValidCard(cardNumber)) {
        newProject.cardNumber = cardNumber;
      } else {
        return res.status(400).json({ message: "Thẻ không hợp lệ", code: 5 });
      }
    }
    await newProject.save();
    return res
      .status(200)
      .json({ message: "Success post", code: 0, project: newProject });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const updateProject = async (req, res) => {
  const projectName = req.body.projectName;
  const date = req.body.date ? new Date(req.body.date) : undefined;
  const goal = Number(req.body.goal);
  const city = req.body.city;
  const type = req.body.type;
  const listType = type ? JSON.parse(type) : undefined;
  const cardNumber = req.body.cardNumber;
  const description = req.body.description;
  const newFile = req.files.file;
  const fileContent = req.files.fileContent;
  const imageRemove = req.body.imageRemove;
  const imageContentRemove = req.body.imageContentRemove;
  const projectId = req.query.projectId;
  const content = req.body.content;
  const contentJSON = JSON.parse(content);
  const tmpImgJSON = req.body.tmpImg;
  const tmpImg = JSON.parse(tmpImgJSON);
  const presentImg = tmpImg.filter(
    (item) => item.type === "image" && item.attrs.src.startsWith("blob")
  );
  try {
    const project = await Project.findOne({
      _id: projectId,
      userId: req.userId.id,
    });
    if (!project) {
      return res.status(404).json({ message: " Event not exist", code: 2 });
    }
    if (project.isLock) {
      return res.status(200).json({ message: "Success", code: 9 });
    }
    if (projectName) {
      project.projectName = projectName;
    }
    if (date) {
      project.timeEnd = date;
    }
    if (goal) {
      project.goal = goal;
    }
    if (city) {
      project.city = city;
    }
    if (listType) {
      project.listType = listType;
    }
    if (cardNumber) {
      if (checkValidCard(cardNumber)) {
        project.cardNumber = cardNumber;
      } else {
        return res.status(400).json({ message: "Thẻ không hợp lệ", code: 5 });
      }
    }
    if (description) {
      project.description = description;
    }
    if (fileContent && fileContent.length > 0) {
      const promisesContent = fileContent.map(async (file, index) => {
        const url = await changeFile(
          file,
          index,
          project.filePath,
          project.__v + 1
        );
        contentJSON.content
          .filter(
            (item) => item.type === "image" && item.attrs.src.startsWith("blob")
          )
          .map((item) => {
            if (item.attrs.src === presentImg[index].attrs.src) {
              item.attrs.src = url;
            }
          });
      });
      const urlFile = await Promise.all(promisesContent);
    }
    if (imageContentRemove) {
      const listRemove = JSON.parse(imageContentRemove);
      const promise = listRemove.map(async (urlImageRemove, index) => {
        const fileUrl = urlImageRemove.split("/");
        const originalName = fileUrl[5].split("?")[0];
        const path = fileUrl[4] + "/" + originalName;
        await deleteFile(path);
      });
      await Promise.all(promise);

      project.image = project.image.filter(
        (item) => !listRemove.includes(item)
      );
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

      project.image = project.image.filter(
        (item) => !listRemove.includes(item)
      );
    }

    if (newFile) {
      const promises = newFile.map(async (file, index) => {
        const url = await changeFile(
          file,
          index,
          project.filePath,
          project.__v + 1
        );
        return url;
      });
      const urlFile = await Promise.all(promises);
      project.image = [...project.image, ...urlFile];
    }
    project.content = contentJSON;
    await project.save();
    return res
      .status(200)
      .json({ message: "Success register", code: 0, project: project });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getProjectById = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const project = await Project.findOne({ _id: projectId, isDelete: false });
    if (!project) {
      return res.status(404).json({ message: " Project not exist", code: 3 });
    }
    if (project.isLock) {
      return res.status(200).json({ message: "Success", code: 9 });
    }
    return res
      .status(200)
      .json({ message: "Success", code: 0, project: project });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const deleteProjectById = async (req, res) => {
  const projectId = req.query.projectId;
  try {
    const project = await Project.findOne({
      _id: projectId,
      userId: req.userId.id,
    });
    if (!project) {
      return res.status(404).json({ msg: "Not found event", code: 3 });
    } else {
      project.isDelete = true;
      await project.save();
      return res.status(200).json({ message: "Success delete", code: 0 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getProject = async (req, res) => {
  const page = req.query.page;
  try {
    const skipProject = page * NUMBER_PROJECT;
    const listProject = await Project.find({ isDelete: false, isLock: false })
      .sort({ _id: -1 })
      .skip(skipProject)
      .limit(8);
    return res
      .status(200)
      .json({ message: "Success", data: listProject, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const projectSearch = async (req, res) => {
  const { qSearch, qCity, qType, qSort, page } = req.body;
  try {
    const querySearch = {
      isDelete: false,
      isLock: false,
    };
    if (qCity) {
      querySearch.city = qCity;
    }
    if (qType && qType.length > 0) {
      querySearch.type = { $all: qType };
    }
    if (qSearch) {
      querySearch.projectName = {
        $regex: qSearch,
        $options: "i",
      };
    }
    if (qSort === "new") {
      const skipProject = page * NUMBER_PROJECT;
      const listProject = await Project.find(querySearch)
        .sort({ _id: -1 })
        .skip(skipProject)
        .limit(8);
      return res
        .status(200)
        .json({ message: "Success", data: listProject, code: 0 });
    } else {
      const skipProject = page * NUMBER_PROJECT;
      const listProject = await Project.find(querySearch)
        .skip(skipProject)
        .limit(8);
      return res
        .status(200)
        .json({ message: "Success", data: listProject, code: 0 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getProjectByUserId = async (req, res) => {
  const page = req.query.page;
  try {
    const skipProject = page * 3;
    const listProject = await Project.find({
      isDelete: false,
      isLock: false,
      userId: req.userId.id,
    })
      .sort({ _id: -1 })
      .skip(skipProject)
      .limit(3);

    return res
      .status(200)
      .json({ message: "Success", data: listProject, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const projectSearchByOwner = async (req, res) => {
  const { qSearch, qCity, qType, qSort, page } = req.body;

  try {
    const querySearch = {
      isDelete: false,
      isLock: false,
      userId: req.userId.id,
    };
    if (qCity) {
      querySearch.city = qCity;
    }
    if (qType && qType.length > 0) {
      querySearch.type = { $all: qType };
    }
    if (qSearch) {
      querySearch.projectName = {
        $regex: qSearch,
        $options: "i",
      };
    }
    if (qSort === "new") {
      const skipProject = page * 3;
      const listProject = await Project.find(querySearch)
        .sort({ _id: -1 })
        .skip(skipProject)
        .limit(3);
      return res
        .status(200)
        .json({ message: "Success", data: listProject, code: 0 });
    } else {
      const skipProject = page * 3;
      const listProject = await Project.find(querySearch)
        .skip(skipProject)
        .limit(3);
      return res
        .status(200)
        .json({ message: "Success", data: listProject, code: 0 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getProjectForLike = async (req, res) => {
  const number = req.query.number;
  try {
    const listProject = await Project.find({
      isDelete: false,
      isLock: false,
      timeEnd: { $gte: new Date() },
    });
    const listProjectAndLike = listProject.map(async (item, index) => {
      const totalLike = await Like.countDocuments({ itemId: item._id });
      return { project: item, totalLike: totalLike };
    });
    const listData = await Promise.all(listProjectAndLike);
    listData.sort((a, b) => b.totalLike - a.totalLike);
    return res
      .status(200)
      .json({ message: "Success", data: listData.slice(0, number), code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
