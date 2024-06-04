import User from "../models/User.js";
import Project from "../models/Project.js";
import admin from "../config/firebase.js";
import { changeFile, deleteFile, uploadFile } from "../utils/file.js";
import { checkValidCard } from "../utils/utilsCard.js";

const bucket = admin.storage().bucket();

export const createProject = async (req, res) => {
  const projectName = req.body.projectName;
  const date = new Date(req.body.date);
  const goal = Number(req.body.goal);
  const city = req.body.city;
  const type = req.body.type;
  const listType = JSON.parse(type);
  const cardNumber = req.body.cardNumber;
  const description = req.body.description;
  const file = req.files;
  const content = req.body.content;
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
    const newProject = new Project({
      userId: req.userId.id,
      projectName: projectName,
      timeEnd: date,
      description: description,
      city: city,
      content: content,
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
  console.log(req.body.date);
  const date = new Date(req.body.date) ;
  const goal = Number(req.body.goal);
  const city = req.body.city;
  const type = req.body.type;
  const listType = type ? JSON.parse(type) : undefined;
  const cardNumber = req.body.cardNumber;
  const description = req.body.description;
  const content = req.body.content;
  const newFile = req.files;
  const imageRemove = req.body.imageRemove;
  const projectId = req.query.projectId;
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
    if (content) {
      project.content = content;
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
