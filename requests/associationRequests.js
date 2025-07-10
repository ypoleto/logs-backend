const mongoose = require('mongoose');
const Association = require('../models/association');
require('dotenv').config(); // carrega as variáveis do .env

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

async function listarAssociations(params) {
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
    filtro.assocApName = params.apName;
  }
  if (params.ssid) {
    filtro.assocSsid = params.ssid;
  }
  if (params.userMac) {
    filtro.assocUserMac = params.userMac;
  }

  const skip = parseInt(params.skip) || 0;
  const limit = parseInt(params.limit) || 10;
  const total = await Association.countDocuments(filtro);

  const data = await Association.find(filtro)
    .sort({ datetime: -1 })
    .skip(skip)
    .limit(limit);

  return { data, total };

}



module.exports = {
  listarAssociations,
};
