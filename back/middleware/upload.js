import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `sunulogement/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      resource_type: "auto",
    },
  });

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  cb(null, allowed.includes(file.mimetype));
};

const limits = { fileSize: 10 * 1024 * 1024 };

export const uploadLogement = multer({
  storage: createStorage("logements"),
  fileFilter,
  limits,
});

export const uploadLocataire = multer({
  storage: createStorage("locataires"),
  fileFilter,
  limits,
});
