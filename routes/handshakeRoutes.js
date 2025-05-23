const express = require('express');
const router = express.Router();
const { listarHandshakes } = require('../requests/handshakeRequests.js');

// GET /handshake
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { data, total } = await listarHandshakes({
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
    console.error('❌ Erro ao listar handshakes:', error.message);
    res.status(500).json({ erro: 'Erro ao listar handshakes', detalhes: error.message });
  }
});

module.exports = router;
