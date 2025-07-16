const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Upload file message
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const message = await Message.create({
      sender: req.user.id,
      receiver: req.body.receiverId,
      content: '',
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;
