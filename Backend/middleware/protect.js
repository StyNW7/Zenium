import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize user identity for downstream controllers
    // Our tokens are signed as { userId: <ObjectId> }
    req.user = {
      ...decoded,
      id: decoded.userId,
      _id: decoded.userId,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
