const { MongoClient } = require('mongodb');
const WebSocket = require('ws');

module.exports = function monitorarhandshake(sockets) {
  const usuario = encodeURIComponent('cogeti');
  const senha = encodeURIComponent('Cogeti@2022!');
  const uri = `mongodb://${usuario}:${senha}@192.168.7.3:27017/`;
  const client = new MongoClient(uri);

  let lastId = null;  // Inicializando o lastId
  const fila = []; // Fila com tamanho fixo de 10

  async function monitorar() {
    try {
      await client.connect();
      const db = client.db('rsyslog_db');
      const colecao = db.collection('handshake');

      // Buscar o último documento para definir o lastId
      const ultimoDoc = await colecao.find().sort({ _id: -1 }).limit(1).next();
      if (ultimoDoc) {
        lastId = ultimoDoc._id;  // Definir o lastId com o último documento existente
      }

      setInterval(async () => {
        try {
          if (!lastId) {
            return; // Se lastId ainda não estiver definido, não faz nada
          }

          let query = { _id: { $gt: lastId } }; // Filtrar por documentos com _id maior que o lastId
          const cursor = colecao.find(query).sort({ _id: 1 });

          for await (const doc of cursor) {
            fila.push(doc); // Adiciona o documento à fila

            // Se a fila ultrapassar 10 itens, remove o primeiro
            if (fila.length > 10) {
              fila.shift();
            }

            lastId = doc._id;  // Atualiza o lastId após cada documento
          }

          // Envia a fila de 10 documentos via WebSocket a cada 2 segundos
          if (fila.length > 0) {
            console.log('🔔 Enviando fila de documentos da coleção handshake:', fila.length);
            const payload = JSON.stringify({
              tipo: 'handshake',
              dados: fila
            });

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
