const express = require('express');
const router = express.Router();
const { listarAssociations } = require('../requests/associationRequests.js');

// GET /association
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { data, total } = await listarAssociations({
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
    console.error('❌ Erro ao listar associations:', error.message);
    res.status(500).json({ erro: 'Erro ao listar associations', detalhes: error.message });
  }
});

module.exports = router;
