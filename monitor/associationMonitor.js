const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
require('dotenv').config(); 


module.exports = function monitorarAssociation(getSockets) {

  const usuario = encodeURIComponent(process.env.MONGO_USER);
  const senha = encodeURIComponent(process.env.MONGO_PASS);
  const host = process.env.MONGO_HOST;
  const porta = process.env.MONGO_PORT;
  const db = process.env.MONGO_DB;
  const authSource = process.env.MONGO_AUTHSOURCE;

  const uri = `mongodb://${usuario}:${senha}@${host}:${porta}/${db}?authSource=${authSource}`;
  const client = new MongoClient(uri);

  let lastId = null;
  let buffer = [];

  async function monitorar() {
    try {
      await client.connect();
      const db = client.db('rsyslog_db');
      const colecao = db.collection('association');

      const ultimoDoc = await colecao.find().sort({ _id: -1 }).limit(1).next();
      if (ultimoDoc) {
        lastId = ultimoDoc._id;
      }

      setInterval(async () => {
        try {
          if (!lastId) return;

          const cursor = colecao.find({ _id: { $gt: lastId } }).sort({ _id: 1 });

          for await (const doc of cursor) {
            buffer.push(doc);
            lastId = doc._id;

            if (buffer.length >= 10) {
              const payload = JSON.stringify({
                tipo: 'association',
                dados: buffer
              });

              const sockets = getSockets(); // 🔁 Obtém os sockets atualizados
              sockets.forEach((s) => {
                if (s.readyState === WebSocket.OPEN) {
                  s.send(payload);
                }
              });

              buffer = [];
            }
          }
        } catch (err) {
          console.error('Erro ao consultar documentos da coleção association:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('Erro ao conectar ao MongoDB:', err);
    }
  }

  monitorar();
};
