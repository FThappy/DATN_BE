import Friend from "../models/Friend.js";
import RequestAddFriend from "../models/RequestAddFriend.js";
import User from "../models/User.js";


const NUMBER_FRIEND = 10

export const checkFriend = async (req, res) => {
  const userId = req.query.userId;
  try {
    const owner = await User.findOne({ _id: req.userId.id });
    const user = await User.findOne({ _id: userId });
    await Promise.all([owner, user]);
    if (!owner) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const isFriend = await Friend.findOne({
      friend: { $all: [userId, req.userId.id] },
    });
    if (!isFriend) {
      return res.status(404).json({ message: "Not friend", code: 3 });
    }
    return res.status(200).json({
      message: "Success ",
      code: 0,
      isFriend: isFriend,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getListFriendById = async (req, res) => {
  const page = req.query.page;
  try {
    const skipFriend = page * NUMBER_FRIEND;
    const listFriend = await Friend.find({ friend: req.userId.id })
      .sort({ _id: -1 })
      .skip(skipFriend)
      .limit(10);
      const listFriendId = listFriend.map((item) =>
        item.friend.filter((id) => id !== req.userId.id)[0]
      );
    return res
      .status(200)
      .json({ message: "Success", data: listFriendId, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getTotalFriend = async (req, res) => {
  try {
    const totalFriend= await Friend.countDocuments({ friend: req.userId.id });
    return res
      .status(200)
      .json({ message: "Success", data: totalFriend, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const deleteFriend = async (req, res) => {
  const userId = req.query.userId;
  try {
    const owner = await User.findOne({ _id: req.userId.id });
    const user = await User.findOne({ _id: userId });
    await Promise.all([owner, user]);
    if (!owner) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const friend = await Friend({
      friend: { $all: [userId, req.userId.id] },
    });
    if (!friend) {
      return res.status(404).json({ message: "Not friend", code: 1 });
    }
    await Friend.findOneAndDelete({
      friend: { $all: [userId, req.userId.id] },
    });
    return res.status(200).json({
      message: "Success ",
      code: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};


export const getUserSendReq = async (req, res) => {
  const page = req.query.page;
  try {
    const skipFriend = page * NUMBER_FRIEND;
    const listFriendId = await RequestAddFriend.find({ from: req.userId.id })
      .sort({ _id: -1 })
      .select({

        to: 1,
      })
      .skip(skipFriend)
      .limit(10);
    return res
      .status(200)
      .json({ message: "Success", data: listFriendId, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const getUserReceived = async (req, res) => {
  const page = req.query.page;
  try {
    const skipFriend = page * NUMBER_FRIEND;
    const listFriendId = await RequestAddFriend.find({ to: req.userId.id })
      .sort({ _id: -1 })
      .select({
        from: 1,
      })
      .skip(skipFriend)
      .limit(10);
    return res
      .status(200)
      .json({ message: "Success", data: listFriendId, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};


// No Friend

export const getNoFriend = async (req, res) => {
  const page = req.query.page;
  try {
    const skipFriend = page * NUMBER_FRIEND;
   const listFriend = await Friend.find({ friend: req.userId.id })
     .sort({ _id: -1 })
     .skip(skipFriend)
     .limit(10);
   const listFriendId = listFriend.map(
     (item) => item.friend.filter((id) => id !== req.userId.id)[0]
   );
    const listNoFriendId = await User.find({
      _id: {
        $nin: [...listFriendId, req.userId.id],
      },
    })
      .sort({ _id: -1 })
      .select({
        _id: 1,
      })
      .skip(skipFriend)
      .limit(10);
    return res
      .status(200)
      .json({ message: "Success", data: listNoFriendId, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};