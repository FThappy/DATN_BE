# 🌍 Charity Social Network Backend  

A **Node.js + Express.js** backend for a social networking platform dedicated to **charity and volunteering**.  
This project provides APIs and real-time services to connect users, create and manage charity projects/events, and enable donations through **ZaloPay**.  

---

## ✨ Features  

### 🛠️ Core System  
- **User Authentication & Authorization**  
  - Register, login, and secure authentication with JWT.  
  - Profile management and privacy settings.  

- **Charity Projects & Events**  
  - Create, manage, and join charity projects.  
  - Create and manage volunteer events.  
  - Project & event updates and participation tracking.  

- **Social Networking**  
  - Friend requests and real-time friend connections.  
  - Real-time chat with **Firebase Firestore**.  
  - Like, comment, and share posts similar to Facebook.  
  - User timeline and news feed.  

- **Donation System**  
  - Donate to charity projects/events via **ZaloPay**.  
  - Secure payment integration and transaction tracking.  

### ⚡ Real-time Features  
- Real-time chat between users.  
- Instant friend request and acceptance notifications.  
- Live updates for project participation, events, and donations.  

---

## 🏗️ Tech Stack  

- **Backend Framework**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)  
- **Database**: Firebase Firestore (for chat, notifications, and real-time data) + SQL/NoSQL (for structured project data)  
- **Authentication**: JWT (JSON Web Tokens)  
- **Payments**: [ZaloPay API](https://zalopay.vn/)  
- **Storage**: Firebase Storage for media files  
- **Real-time Communication**: WebSockets / Firebase Firestore listeners  

---