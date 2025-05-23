const mongoose = require('mongoose');
const Authentication = require('../models/authentication');

const usuario = encodeURIComponent("cogeti")
const senha = encodeURIComponent("Cogeti@2022!")
const MONGO_URI = process.env.MONGO_URI || `mongodb://${usuario}:${senha}@192.168.7.3:27017/rsyslog_db?authSource=admin`;
let conectado = false;

async function conectarMongo() {
  if (conectado) return;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado ao MongoDB');
    conectado = true;
  } catch (erro) {
    console.error('❌ Erro ao conectar ao MongoDB:', erro);
    throw erro;
  }
}

async function listarAuthentications() {
  await conectarMongo();
  return Authentication.find().sort({ datetime: -1 });
}

module.exports = {
  listarAuthentications,
};
