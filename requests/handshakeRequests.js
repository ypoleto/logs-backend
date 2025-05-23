const mongoose = require('mongoose');
const Handshake = require('../models/handshake');

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

async function listarHandshakes(dataInicio, dataFim, ssid, user) {
  await conectarMongo();

  const filtro = {};

  if (dataInicio || dataFim) {
    filtro.datetime = {};
    if (dataInicio) {
      filtro.datetime.$gte = new Date(dataInicio);
    }
    if (dataFim) {
      filtro.datetime.$lte = new Date(dataFim);
    }
  }

  if (ssid) {
    filtro.hsSsid = ssid;
  }

  if (user) {
    filtro.hsUserName = user;
  }

  return Handshake.find(filtro).sort({ datetime: -1 });
}



module.exports = {
  listarHandshakes,
};
