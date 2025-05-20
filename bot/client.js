const venom = require('venom-bot');
const { startMessageHandler } = require('./handler');

let whatsappClient = null;

function createBot() {
  venom
    .create({
      session: 'bot-wa',
      headless: 'new',
      useChrome: false,
      timeout: 60000,
      args: [
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
    })
    .then((client) => {
      whatsappClient = client;

      client.onStateChange((state) => {
        console.log('🟢 WA STATE:', state);
        if (state === 'Connected') {
          console.log('✅ Bot berhasil terhubung ke WhatsApp!');
        }
      });

      client.onStreamChange((state) => {
        console.log('🔁 Stream state:', state);
      });

      startMessageHandler(client);
    })
    .catch((err) => console.log('❌ Gagal start bot:', err));
}

function getClient() {
  return whatsappClient;
}

module.exports = { createBot, getClient };
