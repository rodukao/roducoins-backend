// src/routes/ad.js

const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

// Rota para obter todos os anúncios
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Rota para obter um anúncio específico
router.get('/:adId', authMiddleware, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.adId);
    if (!ad) return res.status(404).json({ error: 'Anúncio não encontrado.' });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Rota para registrar que o usuário assistiu ao anúncio
router.post('/watch/:adId', authMiddleware, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.adId);
    if (!ad) return res.status(404).json({ error: 'Anúncio não encontrado.' });

    // Atualizar o saldo de Roducoins do usuário
    await User.findByIdAndUpdate(req.userId, { $inc: { roducoins: ad.reward } });

    res.json({ message: `Você ganhou ${ad.reward} Roducoins!` });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

module.exports = router;
