import admin from "../config/firebase.js";

const bucket = admin.storage().bucket();

export const uploadFile = async (file, index, time, userId , type) => {
  console.log(file);
  try {
    const remoteFilePath = type + "-"+
      userId +
      "-" +
      time +
      `/${index}${0}` +
      file.originalname;

    console.log(remoteFilePath);

    const blob = bucket.file(remoteFilePath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    const url = await new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        console.error("Lỗi khi tải lên tệp:", error);
        reject({ msg: "Lỗi khi tải lên tệp", code: 4 });
      });

      blobStream.on("finish", () => {
        /** Lấy URL tải xuống */
        blob.getSignedUrl(
          {
            action: "read",
            expires: "01-01-2030",
          },
          async (err, url) => {
            if (err) {
              console.error("Lỗi khi lấy URL tải xuống:", err);
              reject({ msg: "Lỗi khi lấy URL tải xuống", code: 4 });
            } else {
              console.log("Tệp đã được tải lên thành công.");
              console.log("URL của tệp đã tải lên:", url);
              /** Sau khi có url của tệp, resolve Promise với URL */
              resolve(url);
            }
          }
        );
      });

      blobStream.end(file.buffer);
    });
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// Xóa file
export const deleteFile = async (path) => {
  try {
    await bucket
      .file(path)
      .delete()
      .then(() => {
        console.log("File deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// Xóa folder
export const deleteFolder = async (path) => {
  try {
    await bucket.deleteFiles({ prefix: path });
    console.log("Folder deleted successfully");
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};
export const changeFile = async (file, index, filePath, version) => {
  try {
    const remoteFilePath =
      filePath + "/" + `${index}${version}` + file.originalname;

    console.log(remoteFilePath);

    const blob = bucket.file(remoteFilePath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    const url = await new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        console.error("Lỗi khi tải lên tệp:", error);
        reject({ msg: "Lỗi khi tải lên tệp", code: 4 });
      });

      blobStream.on("finish", () => {
        /** Lấy URL tải xuống */
        blob.getSignedUrl(
          {
            action: "read",
            expires: "01-01-2030",
          },
          async (err, url) => {
            if (err) {
              console.error("Lỗi khi lấy URL tải xuống:", err);
              reject({ msg: "Lỗi khi lấy URL tải xuống", code: 4 });
            } else {
              console.log("Tệp đã được tải lên thành công.");
              console.log("URL của tệp đã tải lên:", url);
              /** Sau khi có url của tệp, resolve Promise với URL */
              resolve(url);
            }
          }
        );
      });

      blobStream.end(file.buffer);
    });
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const uploadProfileImage = async (file, path) => {
  try {

    const blob = bucket.file(path);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    const url = await new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        console.error("Lỗi khi tải lên tệp:", error);
        reject({ msg: "Lỗi khi tải lên tệp", code: 4 });
      });

      blobStream.on("finish", () => {
        /** Lấy URL tải xuống */
        blob.getSignedUrl(
          {
            action: "read",
            expires: "01-01-2030",
          },
          async (err, url) => {
            if (err) {
              console.error("Lỗi khi lấy URL tải xuống:", err);
              reject({ msg: "Lỗi khi lấy URL tải xuống", code: 4 });
            } else {
              console.log("Tệp đã được tải lên thành công.");
              console.log("URL của tệp đã tải lên:", url);
              /** Sau khi có url của tệp, resolve Promise với URL */
              resolve(url);
            }
          }
        );
      });

      blobStream.end(file.buffer);
    });
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};