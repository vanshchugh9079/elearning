import multer from "multer";
import path from "path"; // <-- Import path module for extensions

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Temp upload folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname); // <-- Correct way
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({ storage });
