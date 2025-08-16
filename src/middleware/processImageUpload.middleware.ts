import multer, { FileFilterCallback } from "multer";
import { catchAsync } from "../utils/catchAsync";
import { appError } from "../utils/appError";
import path from "path";
import sharp from "sharp";
import { Request } from "express";
import { uploadImageToSupabase } from "../supabase/bucket";

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
    cb(new appError("only image are allowed ", 400, "VALIDATION_ERROR"));
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const processImagesMiddleware = catchAsync(async (req, res, next) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return next();

  const imageUrls: string[] = [];
  const filePaths: string[] = [];

  for (const file of files) {
    const filename = `${Date.now()}-${file.originalname.split(".")[0]}.webp`;
    const outputPath = path.join("uploads", filename);

    const processedBuffer = await sharp(file.buffer)
      .resize({
        width: 512,
        height: 512,
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .webp({ quality: 80 })
      .toBuffer();
    // currently i am using internal directory
    // fs.writeFileSync(outputPath, processedBuffer);
    // now it upload to supabase bucket
    const url =  await uploadImageToSupabase(processedBuffer, filename)

    imageUrls.push(url);
    filePaths.push(outputPath);
  }
  req.body.images = imageUrls;
  req.filePaths = filePaths;
  next();
});
