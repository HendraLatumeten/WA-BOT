const path = require('path');
const { extractKodeBarang } = require('../utils/helpers');
const { getProductByCode } = require('../services/googleSheets');

const userState = {};

function startMessageHandler(client) {
  console.log('⚡ Bot started, listening to messages...');

  client.onMessage(async (message) => {
    const text = message.body.trim().toLowerCase();
    const sender = message.from;

    console.log('📩 Pesan masuk:', message.body);
    console.log('📍 User state:', userState[sender]); // Debugging tambahan

    // Step 1: Menunggu konfirmasi pembayaran
    if (userState[sender]?.awaitingPaymentConfirmation) {
      const { produk } = userState[sender];

      if (text === 'ya') {
        userState[sender].awaitingPaymentConfirmation = false; // Reset flag
        userState[sender].awaitingPaymentMethod = true;

        await client.sendText(
          sender,
          '💳 Silakan pilih metode pembayaran:\n1. QRIS GoPay\n2. QRIS DANA\n3. Transfer Bank BNI\n\nBalas dengan angka (1/2/3).'
        );
      } else {
        await client.sendText(sender, '👍 Transaksi dibatalkan. Ketik "halo" untuk mulai lagi.');
        delete userState[sender];
      }
      return;
    }

    // Step 2: Menunggu metode pembayaran
    if (userState[sender]?.awaitingPaymentMethod) {
      const { produk } = userState[sender];

      if (!produk) {
        await client.sendText(sender, '⚠️ Transaksi tidak valid atau sudah kadaluarsa. Ketik "halo" untuk mulai ulang.');
        delete userState[sender];
        return;
      }

      try {
        if (text === '1') {
          const qrisPath = path.resolve(__dirname, '../assets/Gopay.jpeg');
          await client.sendImage(
            sender,
            qrisPath,
            'qris_gopay.jpeg',
            `📷 Silakan scan QRIS GoPay berikut untuk membayar sebesar *${produk.harga}*.\nTerima kasih! 🙏`
          );
        } else if (text === '2') {
          const qrisPath = path.resolve(__dirname, '../assets/Dana.jpeg');
          await client.sendImage(
            sender,
            qrisPath,
            'qris_dana.jpeg',
            `📷 Silakan scan QRIS DANA berikut untuk membayar sebesar *${produk.harga}*.\nTerima kasih! 🙏`
          );
        } else if (text === '3') {
          await client.sendText(
            sender,
            `🏦 Silakan transfer sebesar ${produk.harga} ke rekening berikut:\n\nBank: BNI\nNomor Rekening: 1794901004\nAtas Nama: AVISHA RIANI LATUMETEN\n\nTerima kasih! 🙏`
          );
        } else {
          await client.sendText(sender, '❌ Pilihan tidak valid. Balas dengan angka 1, 2, atau 3.');
          return;
        }
      } catch (err) {
        console.error('❌ Gagal mengirim metode pembayaran:', err.message);
        await client.sendText(sender, '❌ Gagal mengirim metode pembayaran. Silakan coba lagi nanti.');
      }

      // Transaksi dianggap selesai setelah kirim metode pembayaran
      delete userState[sender];
      return;
    }

    // Step 3: Deteksi kode barang
    const kodeBarang = extractKodeBarang(text);
    if (kodeBarang) {
      const produk = await getProductByCode(kodeBarang);

      if (produk) {
        await client.sendText(
          sender,
          `📦 Produk ditemukan:\nKode: ${produk.kode}\nHarga: ${produk.harga}`
        );

        userState[sender] = {
          awaitingPaymentConfirmation: true,
          produk,
        };

        await client.sendText(sender, 'Apakah Anda ingin membayar? (ya/tidak)');
      } else {
        await client.sendText(sender, `❌ Produk dengan kode *${kodeBarang}* tidak ditemukan.`);
      }

      return;
    }

    // Step 4: Sapaan awal
    if (text === 'halo') {
      await client.sendText(
        sender,
        'Halo! Ini AVI Bot 🤖\nKetik dengan format:\n`Kode: <kode_barang>`\nuntuk cek produk & pembayaran.'
      );
      return;
    }

    // Step 5: Pesan lainnya
    await client.sendText(sender, 'Ketik "halo" untuk mulai.');
  });
}

module.exports = { startMessageHandler };
