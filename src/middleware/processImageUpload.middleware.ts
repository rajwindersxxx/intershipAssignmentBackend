import multer, { FileFilterCallback } from "multer";
import { catchAsync } from "../utils/catchAsync";
import { appError } from "../utils/appError";
import path from "path";
import sharp from "sharp";
import { Request } from "express";
import fs from "fs";

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const multerStorage = multer.memoryStorage();
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) && file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError("only image are allowed ", 400));
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const processImageMiddleware = catchAsync(async (req, res, next) => {
  if (!req.file) return next()
  const filename = `${Date.now()}.webp`;
  const outputPath = path.join("uploads", filename);
  const processImageBuffer = await sharp(req.file.buffer)
  .resize({
    width: 512,
    height: 512,
    fit: sharp.fit.cover,
    position: sharp.strategy.entropy,
  })
  .webp({ quality: 80 })
  .toBuffer();
  fs.writeFileSync(outputPath, processImageBuffer);
  const imagUrl = `http://localhost:4000/uploads/${filename}`;
  req.body.image = imagUrl;
  req.filePath = outputPath;
  // !temporary fix
  req.body.departmentId = Number(req.body.departmentId)
  next();
});
