const mongoose = require('mongoose');
const Authentication = require('../models/authentication');

const usuario = encodeURIComponent(process.env.MONGO_USER);
const senha = encodeURIComponent(process.env.MONGO_PASS);
const host = process.env.MONGO_HOST;
const porta = process.env.MONGO_PORT;
const db = process.env.MONGO_DB;
const authSource = process.env.MONGO_AUTHSOURCE;

const MONGO_URI = `mongodb://${usuario}:${senha}@${host}:${porta}/${db}?authSource=${authSource}`;
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

async function listarAuthentications(params) {
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
  if (params.apName) {
    filtro.authApName = params.apName;
  }
  if (params.ssid) {
    filtro.authSsid = params.ssid;
  }
  if (params.userMac) {
    filtro.authUserMac = params.userMac;
  }
  if (params.usuario) {
    filtro.authUserName = params.usuario;
  }

  const skip = parseInt(params.skip) || 0;
  const limit = parseInt(params.limit) || 10;
  const total = await Authentication.countDocuments(filtro);

  const data = await Authentication.find(filtro)
    .sort({ datetime: -1 })
    .skip(skip)
    .limit(limit);

  return { data, total };

}



module.exports = {
  listarAuthentications,
};
