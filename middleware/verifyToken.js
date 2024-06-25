import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.Authorization;
  if (!token)
    return res.status(401).json({ message: "Not Authenticated!", code: 4 });
  jwt.verify(token, process.env.JWT_SEC, async (err, id) => {
    if (err)
      return res.status(403).json({ message: "Token is not Valid!", code: 4 });
    req.userId = id;
    next();
  });
};

export const certainUserToken = (req, res, next) => {
  const userId = req.userId.id;
  const tokenChange = req.body.tokenChange;
  if (tokenChange) {
    jwt.verify(tokenChange, process.env.RE_PASSWORD_JWT_SEC, (err, id) => {
      if (err) {
        return res.status(403).json({ msg: "Token is not valid", code: 3 });
      }
      if (id.id !== userId) {
        return res.status(403).json({ msg: "Token is not valid", code: 3 });
      }
      next();
    });
  } else {
    return res.status(401).json({ msg: "Token is not valid", code: 3 });
  }
};
