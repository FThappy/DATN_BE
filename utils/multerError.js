export const multerError = async(req,res, next)=>{
  if(req.multerError){
    return res.status(400).json({ message: "Chỉ chấp nhận file ảnh", code: 1 });
  }
  next();
}