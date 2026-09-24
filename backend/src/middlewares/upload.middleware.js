const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError");

const storage = multer.memoryStorage();

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeValid = file.mimetype.startsWith("image/");
  const isExtensionValid = allowedExtensions.includes(ext);

  if (isMimeValid || isExtensionValid) {
    return cb(null, true);
  }

  cb(
    new AppError(
      "Only JPG, JPEG, PNG and WEBP images are allowed.",
      400
    ),
    false
  );
};
// 5mb picture
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;