const express = require('express');
const router = express.Router();
const { listarAuthentications } = require('../requests/authenticationRequests.js');

// GET /authentication
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { data, total } = await listarAuthentications({
      ...filters,
      skip,
      limit
    });

    res.json({
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Erro ao listar authentications:', error.message);
    res.status(500).json({ erro: 'Erro ao listar authentications', detalhes: error.message });
  }
});

module.exports = router;
