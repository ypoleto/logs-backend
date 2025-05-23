const express = require('express');
const router = express.Router();
const { listarHandshakes } = require('../requests/handshakeRequests.js');

// GET /handshake
router.get('/', async (req, res) => {
    try {
      
      const { dataInicio, dataFim } = req.query;
      
      let handshakes;
      if (dataInicio || dataFim) {
        handshakes = await listarHandshakes(dataInicio, dataFim);
      } else {
        handshakes = await listarHandshakes();
      }
      res.json(handshakes);
  
    } catch (error) {
      console.error('❌ Erro ao listar handshakes:', error.message);
      res.status(500).json({ erro: 'Erro ao listar handshakes', detalhes: error.message });
    }
  });


module.exports = router;
