const { MongoClient } = require('mongodb');
const WebSocket = require('ws');

module.exports = function monitorarhandshake(getSockets) {
  const usuario = encodeURIComponent('cogeti');
  const senha = encodeURIComponent('Cogeti@2022!');
  const uri = `mongodb://${usuario}:${senha}@192.168.7.3:27017/`;
  const client = new MongoClient(uri);

  let lastId = null;
  const fila = []; // Fila com tamanho fixo de 10

  async function monitorar() {
    try {
      await client.connect();
      const db = client.db('rsyslog_db');
      const colecao = db.collection('handshake');

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
            console.log('🔔 Enviando fila de documentos da coleção handshake:', fila.length);
            const payload = JSON.stringify({
              tipo: 'handshake',
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
          console.error('Erro ao consultar documentos da coleção handshake:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('Erro ao conectar ao MongoDB:', err);
    }
  }

  monitorar();
};
