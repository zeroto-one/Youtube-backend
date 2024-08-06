/*
 * Multer configuration for file uploads
 * =======================================
 *
 ! This module exports a Multer instance configured for disk storage and file uploads.
 *
 * @module multerConfig
 */

import multer from "multer";

/*
 * Disk storage configuration for Multer
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
  /*
   * Destination folder for uploaded files
   * @param {Express.Request} req - Express request object
   * @param {multer.File} file - File being uploaded
   * @param {Function} cb - Callback function to set destination folder
   */
  destination: function(req, file, cb) {
    // Add error handling
    try {
      cb(null, './public/temp');
    } catch (err) {
      cb(err);
    }
  },
  /**
   * 
   * Generate a unique filename for uploaded files
   * @param {Express.Request} req - Express request object
   * @param {multer.File} file - File being uploaded
   * @param {Function} cb - Callback function to set filename
   */
  filename: function(req, file, cb) {
    // Generate a unique filename
    //const filename = `${Date.now()}-${file.originalname}`;this we will use later
    cb(null, file.originalname);
  }
});

/*
 * Create a Multer instance with storage and limits
 * @type {multer.Multer}
 */
export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});

/*
 * Example usage:
 * @example
 * const express = require('express');
 * const app = express();
 * const upload = require('./multerConfig').upload;
 *
 * app.post('/upload', upload.single('file'), (req, res) => {
 *   // req.file contains the uploaded file
 *   // req.body contains the entire request body
 *   res.send(`File uploaded successfully!`);
 * });
 */