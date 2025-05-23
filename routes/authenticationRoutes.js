const express = require('express');
const router = express.Router();
const { listarAuthentications } = require('../requests/authenticationRequests.js.js');

// GET /authentication
router.get('/', async (req, res) => {
    try {
        console.log('➡️  Requisição GET /authentication recebida');
        const authentications = await listarAuthentications();
        console.log(`✅ ${authentications.length} authentications retornados`);
        res.json(authentications);
    } catch (error) {
        console.error('❌ Erro ao listar authentications:', error.message);
        console.error(error); // mostra stack trace completa
        res.status(500).json({ erro: 'Erro ao listar authentications', detalhes: error.message });
    }
});


module.exports = router;
