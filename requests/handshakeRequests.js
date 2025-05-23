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

async function listarHandshakes(params) {
  await conectarMongo();

  const filtro = {};

  if (params.dataInicio || params.dataFim) {
    filtro.datetime = {};
    if (params.dataInicio) {
      filtro.datetime.$gte = new Date(params.dataInicio);
    }
    if (params.dataFim) {
      filtro.datetime.$lte = new Date(params.dataFim);
    }
  }

  if (params.ssid) {
    filtro.hsSsid = params.ssid;
  }

  if (params.usuario) {
    filtro.hsUserName = params.usuario;
  }

  const skip = parseInt(params.skip) || 0;
  const limit = parseInt(params.limit) || 10;
  const total = await Handshake.countDocuments(filtro);

  const data = await Handshake.find(filtro)
    .sort({ datetime: -1 })
    .skip(skip)
    .limit(limit);

  return { data, total };

}



module.exports = {
  listarHandshakes,
};
