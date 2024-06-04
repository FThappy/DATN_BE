import admin from "firebase-admin";
import serviceAccount from "../social-charity.json" assert { type: "json" };
import dotenv from "dotenv";
dotenv.config();

/** Khởi tạo ứng dụng Firebase */
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.TYPE,
      project_id: process.env.PROJECT_ID,
      private_key_id: process.env.PRIVATE_KEY_ID,
      private_key: process.env.PRIVATE_KEY,
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID_FIREBASE,
      auth_uri: process.env.AUTH_URI,
      token_uri: process.env.TOKEN_URI,
      auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
      universe_domain: process.env.UNIVERSE_DOMAIN,
    }),
    databaseURL: "https://social-charity-4c5a3-default-rtdb.firebaseio.com/",
    storageBucket: "social-charity-4c5a3.appspot.com",
  });
  console.log(">>> Kết nối với firebase thành công");
} catch (error) {
  console.log(">>> Xảy ra lỗi khi kết nối với firebase");
  console.log(">>> Lỗi khi kết nối firebase:", error);
}

/** Xuất đối tượng admin để sử dụng trong các tệp khác */
export default admin;
