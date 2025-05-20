const { extractKodeBarang } = require('../utils/helpers');
const { getProductByCode } = require('../services/googleSheets');

function startMessageHandler(client) {
  console.log('⚡ Bot started, listening to messages...');

  client.onMessage(async (message) => {
    console.log('📩 Pesan masuk:', message.body);
    const text = message.body.trim();
    const kodeBarang = extractKodeBarang(text);

    if (kodeBarang) {
      const produk = await getProductByCode(kodeBarang);
      if (produk) {
        client.sendText(
          message.from,
          `📦 Produk ditemukan:\nKode: ${produk.kode}\nHarga: ${produk.harga}`
        );
      } else {
        client.sendText(
          message.from,
          `❌ Produk dengan kode *${kodeBarang}* tidak ditemukan.`
        );
      }
    } else if (text.toLowerCase() === 'halo') {
      client.sendText(
        message.from,
        'Halo! Ini bot WA pribadi 🤖\nKirim pesan dengan format (Kode: <kode_barang>) untuk cek produk.'
      );
    } else {
      client.sendText(message.from, 'Ketik "halo" untuk mulai.');
    }
  });
}

module.exports = { startMessageHandler };
