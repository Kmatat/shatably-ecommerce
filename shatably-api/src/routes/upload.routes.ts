import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Configure multer for local storage (switch to Cloudinary in production)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Helper to build full URL for uploaded files
function getUploadUrl(req: any, filename: string): string {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
}

router.use(authenticate);

/**
 * POST /api/upload/image
 * Upload single image
 */
router.post('/image', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileUrl = getUploadUrl(req, req.file.filename);

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload/material-list
 * Upload material list file
 */
router.post('/material-list', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileUrl = getUploadUrl(req, req.file.filename);
    const fileType = req.file.mimetype.includes('image') ? 'image' :
                     req.file.mimetype.includes('pdf') ? 'pdf' :
                     req.file.mimetype.includes('word') ? 'docx' :
                     req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet') ? 'xlsx' : 'other';

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload/images
 * Upload multiple images (up to 20)
 */
router.post('/images', upload.array('files', 20), async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const uploadedFiles = files.map((file) => ({
      url: getUploadUrl(req, file.filename),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

    res.json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
