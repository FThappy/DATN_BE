import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) =>{
    const token = req.cookies.Authorization;
    if (!token) return res.status(401).json({ message: "Not Authenticated!" , code:4});
    jwt.verify(token, process.env.JWT_SEC, async (err, id) => {
      if (err) return res.status(403).json({ message: "Token is not Valid!", code:4 });
      req.userId = id;
      next();
    });
}