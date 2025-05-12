const { MongoClient } = require('mongodb');
const WebSocket = require('ws');

module.exports = function monitorarAssociation(sockets) {
  const usuario = encodeURIComponent('cogeti');
  const senha = encodeURIComponent('Cogeti@2022!');
  const uri = `mongodb://${usuario}:${senha}@192.168.7.3:27017/`;
  const client = new MongoClient(uri);

  let lastId = null;  // Inicializando o lastId
  let buffer = [];

  async function monitorar() {
    try {
      await client.connect();
      const db = client.db('rsyslog_db');
      const colecao = db.collection('association');

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
            buffer.push(doc);
            lastId = doc._id;  // Atualiza o lastId após cada documento

            if (buffer.length >= 10) {
              console.log('🔔 Enviando lote de 10 documentos da coleção association:', buffer.length);
              const payload = JSON.stringify({
                tipo: 'association',
                dados: buffer
              });

              sockets.forEach((s) => {
                if (s.readyState === WebSocket.OPEN) {
                  s.send(payload);
                }
              });

              buffer = []; // Limpa o buffer após o envio
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
