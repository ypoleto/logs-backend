const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
require('dotenv').config(); 

module.exports = function monitorarAuthentication(getSockets) {
  const usuario = encodeURIComponent(process.env.MONGO_USER);
  const senha = encodeURIComponent(process.env.MONGO_PASS);
  const host = process.env.MONGO_HOST;
  const porta = process.env.MONGO_PORT;
  const db = process.env.MONGO_DB;
  const authSource = process.env.MONGO_AUTHSOURCE;

  const uri = `mongodb://${usuario}:${senha}@${host}:${porta}/${db}?authSource=${authSource}`;
  const client = new MongoClient(uri);

  let lastId = null;
  const fila = []; // Fila com tamanho fixo de 10

  async function monitorar() {
    try {
      await client.connect();
      const db = client.db('rsyslog_db');
      const colecao = db.collection('authentication');

      // Buscar o último documento para definir o lastId
      const ultimoDoc = await colecao.find().sort({ _id: -1 }).limit(1).next();
      if (ultimoDoc) {
        lastId = ultimoDoc._id;
      }

      setInterval(async () => {
        try {
          if (!lastId) return;

          const cursor = colecao.find({ _id: { $gt: lastId } }).sort({ _id: 1 });

          for await (const doc of cursor) {
            fila.push(doc);
            if (fila.length > 10) {
              fila.shift(); // Mantém tamanho fixo de 10
            }
            lastId = doc._id;
          }

          if (fila.length > 0) {
            const payload = JSON.stringify({
              tipo: 'authentication',
              dados: fila
            });

            const sockets = getSockets(); // ✅ obtém os sockets atualizados
            sockets.forEach((s) => {
              if (s.readyState === WebSocket.OPEN) {
                s.send(payload);
              }
            });
          }
        } catch (err) {
          console.error('Erro ao consultar documentos da coleção authentication:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('Erro ao conectar ao MongoDB:', err);
    }
  }

  monitorar();
};
