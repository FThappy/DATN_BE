import { google } from "googleapis";
import nodemailer from "nodemailer";
import { generateOTP } from "./generateOTP.js";

export const sendMail = async (message, email) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN_MAIL;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  try {
    console.log(email)
    const Otps = generateOTP();
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "volunteerapp914@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    await transport.sendMail({
      from: '"Admin Volunteer" <volunteerapp914@gmail.com>', // sender address
      to: email, // list of receivers
      subject: message, // Subject line
      html: `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .otp-text {
            color: #007bff; /* Màu xanh */
            font-size: 18px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Mã OTP của bạn là:</p>
          <p class="otp-text">${Otps}</p>
        </div>
      </body>
    </html>
  `, // html body
    });
    return Otps;
  } catch (error) {
    console.log(error);
    throw error; 
  }
};
