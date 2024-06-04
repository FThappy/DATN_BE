import { eventarc_v1beta1 } from "googleapis";
import admin from "../config/firebase.js";
import User from "../models/User.js";
import { changeFile, deleteFile, uploadFile } from "../utils/file.js";
import Post from "./../models/Post.js";
import Event from "../models/Event.js";
import Join from "../models/Join.js";

const bucket = admin.storage().bucket();

const NUMBER_EVENT = 8;

const NUMBER_JOIN_EVENT = 9;

export const createEvent = async (req, res) => {
  const eventName = req.body.eventName;
  const timeStart = new Date(req.body.timeStart);
  const timeEnd = new Date(req.body.timeEnd);
  const city = req.body.city;
  const address = req.body.address;
  const description = req.body.description;
  const file = req.files;
  const time = new Date().getTime();
  try {
    const user = await User.findOne({ _id: req.userId.id });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (!eventName || !timeStart || !timeEnd || !city || !address) {
      return res
        .status(400)
        .json({ message: "Không đầy đủ thông tin", code: 2 });
    }
    const promises = file.map(async (file, index) => {
      const url = await uploadFile(file, index, time, req.userId.id, "event");
      return url;
    });
    const urlFile = await Promise.all(promises);
    const newEvent = new Event({
      userId: req.userId.id,
      eventName: eventName,
      timeStart: timeStart,
      timeEnd: timeEnd,
      city: city,
      address: address,
      wallImg: urlFile,
      filePath: `event-${req.userId.id}-${time}`,
    });
    if (description) {
      newEvent.description = description;
    }
    await newEvent.save();
    return res
      .status(200)
      .json({ message: "Success post", code: 0, event: newEvent });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const updateEvent = async (req, res) => {
  const eventName = req.body.eventName;
  const timeStart = new Date(req.body.timeStart);
  const timeEnd = new Date(req.body.timeEnd);
  const city = req.body.city;
  const address = req.body.address;
  const description = req.body.description;
  const newFile = req.files;
  const imageRemove = req.body.imageRemove;
  const eventId = req.query.eventId;
  console.log(city);
  try {
    const event = await Event.findOne({ _id: eventId, userId: req.userId.id });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 2 });
    }
    if (eventName) {
      event.eventName = eventName;
    }
    if (timeStart) {
      event.timeStart = timeStart;
    }
    if (timeEnd) {
      event.timeEnd = timeEnd;
    }
    if (city) {
      event.city = city;
    }
    if (address) {
      event.address = address;
    }
    if (description) {
      event.description = description;
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

      event.wallImg = event.wallImg.filter(
        (item) => !listRemove.includes(item)
      );
    }
    if (newFile) {
      const promises = newFile.map(async (file, index) => {
        const url = await changeFile(
          file,
          index,
          event.filePath,
          event.__v + 1
        );
        return url;
      });
      const urlFile = await Promise.all(promises);
      event.wallImg = [...event.wallImg, ...urlFile];
    }
    await event.save();
    return res
      .status(200)
      .json({ message: "Success register", code: 0, event: event });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getEventById = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findOne({ _id: eventId, isDelete: false });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 3 });
    }
    return res.status(200).json({ message: "Success", event: event, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const deleteEventById = async (req, res) => {
  const userId = req.query.userId;
  const eventId = req.query.eventId;
  try {
    const event = await Event.findOne({ _id: eventId, userId: userId });
    if (!event) {
      return res.status(404).json({ msg: "Not found event", code: 3 });
    } else {
      event.isDelete = true;
      await event.save();
      return res.status(200).json({ message: "Success delete", code: 0 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getEvent = async (req, res) => {
  const page = req.query.page;
  try {
    const skipEvent = page * NUMBER_EVENT;
    const listEvent = await Event.find({ isDelete: false, isLock: false })
      .sort({ _id: -1 })
      .skip(skipEvent)
      .limit(8);
    return res
      .status(200)
      .json({ message: "Success", data: listEvent, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getTotalPageEvent = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({
      isDelete: false,
      isLock: false,
    });
    const totalPages = Math.ceil(totalEvents / NUMBER_EVENT);
    const data = Array.from({ length: totalPages }, (_, i) => i + 1);
    return res.status(200).json({ message: "Success", data: data, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const createJoinEvent = async (req, res) => {
  const { eventId, userId } = req.body;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 1 });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 2 });
    }
    const join = await Join.findOne({ itemId: eventId, userId: userId });
    if (join) {
      return res.status(404).json({ message: "Already participated", code: 3 });
    }
    const newJoin = new Join({
      itemId: eventId,
      userId: userId,
      type: "event",
    });
    await newJoin.save();
    return res
      .status(200)
      .json({ message: "Success", success: true, join: {
        _id : newJoin._id,
        itemId : newJoin.itemId,
        userId : newJoin.userId
      }, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const deleteJoinEvent = async (req, res) => {
  const userId = req.query.userId;
  const eventId = req.query.eventId;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 1 });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 2 });
    }
    await Join.findOneAndDelete({ itemId: eventId, userId: userId });
    return res
      .status(200)
      .json({ message: "Success", success: false, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getJoinById = async (req, res) => {
  const userId = req.query.userId;
  const eventId = req.query.eventId;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 1 });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 2 });
    }
    const join = await Join.findOne({ itemId: eventId, userId: userId });
    if (!join) {
      return res
        .status(404)
        .json({ message: "You Not Already Participated", code: 3 });
    }
    return res.status(200).json({ message: "Success", success: true, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const deleteJoinEventByOwner = async (req, res) => {
  const userId = req.query.userId;
  const eventId = req.query.eventId;
  const ownerId = req.query.ownerId;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 1 });
    }
    if (event.userId !== ownerId) {
      return res.status(403).json({ message: "Not author", code: 5 });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 2 });
    }
    const join = await Join.findOne({ itemId: eventId, userId: userId });
    if (!join) {
      return res
        .status(404)
        .json({ message: "You Not Already Participated", code: 3 });
    }
    await Join.findOneAndDelete({ itemId: eventId, userId: userId });
    return res
      .status(200)
      .json({ message: "Success", success: false, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getUserJoinEvent = async (req, res) => {
  const page = req.query.page;
  const eventId = req.query.eventId;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 1 });
    }
    const skipJoinEvent = page * NUMBER_JOIN_EVENT;
    const listJoinEvent = await Join.find({ itemId: eventId })
      .sort({ _id: -1 })
      .skip(skipJoinEvent)
      .limit(9);
    return res
      .status(200)
      .json({ message: "Success", data: listJoinEvent, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getCountUserJoinEvent = async (req, res) => {
  const eventId = req.query.eventId;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ message: " Event not exist", code: 1 });
    }
    const totalJoinEvents = await Join.countDocuments({
      itemId: eventId,
    });
    return res
      .status(200)
      .json({ message: "Success", data: totalJoinEvents, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const eventSearch = async (req, res) => {
  const { qSearch, qCity, qDate, qSort, page } = req.body;

  try {
    const querySearch = {
      isDelete: false,
      isLock: false,
    };
    if (qCity) {
      querySearch.city = qCity;
    }
    if (qDate) {
      querySearch.timeStart = { $lte: qDate };
      querySearch.timeEnd = { $gte: qDate };
    }
    if (qSearch) {
      querySearch.eventName = {
        $regex: qSearch,
        $options: "i",
      };
    }
    const totalEvents = await Event.countDocuments(querySearch);
    const totalPages = Math.ceil(totalEvents / NUMBER_EVENT);
    const data = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (qSort === "new") {
      const skipEvent = page * NUMBER_EVENT;
      const listEvent = await Event.find(querySearch)
        .sort({ _id: -1 })
        .skip(skipEvent)
        .limit(8);
      return res
        .status(200)
        .json({
          message: "Success",
          listEvent: listEvent,
          data: data,
          code: 0,
        });
    } else {
      const skipEvent = page * NUMBER_EVENT;
      const listEvent = await Event.find(querySearch).skip(skipEvent).limit(8);
      return res.status(200).json({
        message: "Success",
        listEvent: listEvent,
        data: data,
        code: 0,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

// OWNER
export const getEventOwner = async (req, res) => {
  const page = req.query.page;
  const userId = req.userId.id;
  try {
    const skipEvent = page * 6;
    const listEvent = await Event.find({
      isDelete: false,
      isLock: false,
      userId: userId,
    })
      .sort({ _id: -1 })
      .skip(skipEvent)
      .limit(6);
    return res
      .status(200)
      .json({ message: "Success", data: listEvent, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getTotalPageEventOwner = async (req, res) => {
  const userId = req.userId.id;
  try {
    const totalEvents = await Event.countDocuments({
      isDelete: false,
      isLock: false,
      userId: userId,
    });
    const totalPages = Math.ceil(totalEvents / 6);
    const data = Array.from({ length: totalPages }, (_, i) => i + 1);
    return res.status(200).json({ message: "Success", data: data, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const eventSearchOwner = async (req, res) => {
  const { qSearch, qCity, qDate, qSort, page } = req.body;
  const userId = req.userId.id;
  try {
    const querySearch = {
      isDelete: false,
      isLock: false,
      userId: userId,
    };
    if (qCity) {
      querySearch.city = qCity;
    }
    if (qDate) {
      querySearch.timeStart = { $lte: qDate };
      querySearch.timeEnd = { $gte: qDate };
    }
    if (qSearch) {
      querySearch.eventName = {
        $regex: qSearch,
        $options: "i",
      };
    }
    const totalEvents = await Event.countDocuments(querySearch);
    const totalPages = Math.ceil(totalEvents / 6);
    const data = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (qSort === "new") {
      const skipEvent = page * 6;
      const listEvent = await Event.find(querySearch)
        .sort({ _id: -1 })
        .skip(skipEvent)
        .limit(6);
      return res.status(200).json({
        message: "Success",
        listEvent: listEvent,
        data: data,
        code: 0,
      });
    } else {
      const skipEvent = page * 6;
      const listEvent = await Event.find(querySearch).skip(skipEvent).limit(6);
      return res.status(200).json({
        message: "Success",
        listEvent: listEvent,
        data: data,
        code: 0,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

// Join

export const getEventUserJoin = async (req, res) => {
  const page = req.query.page;
  const userId = req.userId.id;
  try {
    const skipJoin = page * 6;
    const listJoin = await Join.find({ userId: userId, type: "event" })
      .sort({ _id: -1 })
      .skip(skipJoin)
      .limit(6);
    if (listJoin.length > 0) {
      const promises = listJoin.map(async (item, index) => {
        const event = await Event.findOne({
          _id: item.itemId,
          isDelete: false,
          isLock: false,
        });
        return event;
      });
      const listEvent = await Promise.all(promises);
      return res
        .status(200)
        .json({ message: "Success", data: listEvent, code: 0 });
    }
    return res.status(200).json({ message: "Success", data: [], code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getTotalPageEventUserJoin = async (req, res) => {
  const userId = req.userId.id;
  try {
    const totalJoin = await Join.countDocuments({
      userId: userId,
    });
    const totalPages = Math.ceil(totalJoin / 6);
    const data = Array.from({ length: totalPages }, (_, i) => i + 1);
    return res.status(200).json({ message: "Success", data: data, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

