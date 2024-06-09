import axios from "axios";
import CryptoJS from "crypto-js";
import bodyParser from "body-parser";
import moment from "moment";
import Project from "./../models/Project.js";
import User from "../models/User.js";
import Transcation from "../models/Transcation.js";

const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

const NUMBER_TRANSCATION = 10;

export const zalopay = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.body.projectId });
    if (!project) {
      return res
        .status(404)
        .json({ message: " Project Không tồn tại", code: 5 });
    }
    const user = await User.findOne({ _id: req.userId.id });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 6 });
    }
    const embed_data = {
      // sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
      redirecturl: "http://localhost:3000",
      projectId: req.body.projectId,
      userId: req.userId.id,
    };

    const items = [];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: req.userId.id,
      app_time: Date.now(), // milliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: req.body.amount,
      // khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
      // Chú ý: cần dùng ngrok để public url thì Zalopay Server mới call đến được
      callback_url:
        "https://datn-be-zrcv.onrender.com/api/transcation/callback-zalopay",
      description: `Chuyển khoản tiền từ thiện #${transID}`,
      bank_code: "",
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    const result = await axios.post(config.endpoint, null, { params: order });
    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Payment processing failed" });
  }
};

export const callbackZalopay = async (req, res) => {
  let result = {};
  const projectId = JSON.parse(JSON.parse(req.body.data).embed_data).projectId;
  const userId = JSON.parse(JSON.parse(req.body.data).embed_data).userId;
  const amount = JSON.parse(req.body.data).amount;

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng ở đây
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      const project = await Project.findOne({_id : projectId});
      project.rise = project.rise + amount;
      await project.save();

      const newTranscation = new Transcation({
        projectId: projectId,
        userId: userId,
        amount: amount,
      });
      await newTranscation.save();
      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    console.log("lỗi:::" + ex.message);
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
};

// GET

export const getTranscation = async (req, res) => {
  const page = req.query.page;
  try {
    const skipTranscation = page * NUMBER_TRANSCATION;
    const listTranscation = await Transcation.find()
      .sort({ _id: -1 })
      .skip(skipTranscation)
      .limit(8);
    return res
      .status(200)
      .json({ message: "Success", data: listTranscation, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getTranscationByUserId = async (req, res) => {
  const page = req.query.page;
  try {
    const skipTranscation = page * NUMBER_TRANSCATION;
    const listTranscation = await Transcation.find({
      userId: req.userId.id,
    })
      .sort({ _id: -1 })
      .skip(skipTranscation)
      .limit(8);
    return res
      .status(200)
      .json({ message: "Success", data: listTranscation, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getTranscationByProjectId = async (req, res) => {
  const page = req.query.page;
  const projectId = req.query.projectId
  try {
    const skipTranscation = page * NUMBER_TRANSCATION;
    const listTranscation = await Transcation.find({
      projectId: projectId,
    })
      .sort({ _id: -1 })
      .skip(skipTranscation)
      .limit(8);
    return res
      .status(200)
      .json({ message: "Success", data: listTranscation, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
