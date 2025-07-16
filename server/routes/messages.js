const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// Save message to DB
router.post('/', authMiddleware, async (req, res) => {
  const { sender, receiver, text } = req.body;
  const message = new Message({ sender, receiver, text });
  await message.save();
  res.json(message);
});

// Get chat between current user and selected user
router.get('/:userId', authMiddleware, async (req, res) => {
  const myId = req.user.id;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: otherId },
      { sender: otherId, receiver: myId },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;
