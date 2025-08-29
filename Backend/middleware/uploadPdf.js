import multer from 'multer';

// Use memory storage because we want Buffer in req.file.buffer
const storage = multer.memoryStorage();

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const uploadPdf = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default uploadPdf;
