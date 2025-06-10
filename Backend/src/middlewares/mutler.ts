import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinary from '../utils/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'real_estate_properties',
    format: file.mimetype.split('/')[1],
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  }),
});

const parser = multer({ storage });

export default parser;
