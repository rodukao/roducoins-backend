const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const User = require('../models/User');

router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.userId).select('-password');
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor.' });
    }
  });

module.exports = router;