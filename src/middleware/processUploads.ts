import multer, { FileFilterCallback } from "multer";
import { catchAsync } from "../utils/catchAsync";
import { appError } from "../utils/appError";
import path from "path";
import { Request } from "express";
import fs from "fs";

const multerStorage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".pdf" && file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new appError("Only PDF files are allowed", 400));
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const processUploadsMiddleware = (required: boolean) =>
  catchAsync(async (req, res, next) => {
    if (required) {
      if (!req.file)
        return next(new appError("Pdf is required", 400, "VALIDATION_ERROR"));
    } else {
      if (!req.file) return next();
    }
    const filename = `${Date.now()}.pdf`;
    const outputPath = path.join("uploads", filename);
    fs.writeFileSync(outputPath, req.file.buffer);
    const fileUrl = `http://localhost:3000/uploads/${filename}`;
    // * temp fix
    req.body.resumeUrl = fileUrl;
    delete req.body.resume;
    req.filePath = outputPath;
    next();
  });
