const path = require('path');
const fs = require('fs');
const { extractKodeBarang, isNominalValid, normalizeNominal } = require('../utils/helpers');
const { getProductByCode, getAllSellers } = require('../services/googleSheets');
const { extractTextFromImage } = require('../services/ocrService');

const userState = {};

function startMessageHandler(client) {
  console.log('⚡ Bot started, listening to messages...');

  client.onMessage(async (message) => {
    const sender = message.from;
    const text = message.body?.trim().toLowerCase();
    const state = userState[sender];

    // ✨ Handle gambar (bukti pembayaran)
    if (message.type === 'image') {
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15);
      const filePath = path.resolve(__dirname, `../temp/${sender}_bukti_${timestamp}.jpg`);

      try {
        const mediaBuffer = await client.decryptFile(message);
        fs.writeFileSync(filePath, mediaBuffer);

        const result = await extractTextFromImage(filePath);
        console.log('📄 Hasil OCR:', result);

        if (!state || !state.produk) {
          await client.sendText(sender, '⚠️ Data transaksi tidak ditemukan. Silakan mulai ulang dengan mengetik "halo".');
          fs.unlinkSync(filePath);
          return;
        }

        const hargaProduk = parseInt(state.produk.harga.replace(/[^\d]/g, ''));
        const nominalOCR = normalizeNominal(result.nominal);

        if (result.nominal && result.date) {
          if (isNominalValid(nominalOCR, hargaProduk)) {
            await client.sendText(
              sender,
              `✅ Bukti pembayaran *VALID*.\n\n📅 Tanggal: *${result.date}*\n💰 Nominal: *Rp${nominalOCR.toLocaleString()}*\n🏦 Provider: *${result.provider || 'Tidak terdeteksi'}*\n\nTerima kasih! Pembayaran Anda akan segera kami proses.`
            );
          } else {
            await client.sendText(
              sender,
              `❌ Bukti pembayaran *TIDAK VALID*.\n\n📅 Tanggal: *${result.date}*\n💰 Nominal yang dibaca: *Rp${nominalOCR.toLocaleString()}*\n💰 Seharusnya: *Rp${hargaProduk.toLocaleString()}*\n🏦 Provider: *${result.provider || 'Tidak terdeteksi'}*\n\nSilakan periksa kembali bukti transfer Anda.`
            );
          }
        } else {
          await client.sendText(sender, '❌ Gagal membaca nominal atau tanggal dari gambar. Pastikan bukti transfer terlihat jelas.');
        }

        fs.unlinkSync(filePath);
        delete userState[sender];
      } catch (err) {
        console.error('❌ Error proses gambar:', err);
        await client.sendText(sender, '❌ Gagal memproses gambar bukti pembayaran.');
      }
      return;
    }

    // 💬 Proses pesan teks
    console.log('📩 Pesan masuk:', message.body);
    console.log('📍 User state:', state);

    // Step 1: Konfirmasi pembayaran
    if (state?.awaitingPaymentConfirmation) {
      const { produk } = state;

      if (text === 'ya') {
        userState[sender] = {
          ...state,
          awaitingPaymentConfirmation: false,
          awaitingPaymentMethod: true,
        };

        await client.sendText(
          sender,
          '💳 Silakan pilih metode pembayaran:\n1. QRIS GoPay\n2. QRIS DANA\n3. Transfer Bank BNI\n4. COD\n\nBalas dengan angka (1/2/3/4).'
        );
      } else {
        await client.sendText(sender, '👍 Transaksi dibatalkan. Ketik "halo" untuk mulai lagi.');
        delete userState[sender];
      }
      return;
    }

    // Step 2: Pilih metode pembayaran
    if (state?.awaitingPaymentMethod) {
      const { produk } = state;

      if (!produk) {
        await client.sendText(sender, '⚠️ Transaksi tidak valid atau sudah kadaluarsa. Ketik "halo" untuk mulai ulang.');
        delete userState[sender];
        return;
      }

      try {
        if (text === '1') {
          const qrisPath = path.resolve(__dirname, '../assets/Gopay.jpeg');
          await client.sendImage(sender, qrisPath, 'qris_gopay.jpeg', `📷 Silakan scan QRIS GoPay berikut untuk membayar sebesar *${produk.harga}*.\nSetelah transfer, kirim foto bukti pembayaran.`);
        } else if (text === '2') {
          const qrisPath = path.resolve(__dirname, '../assets/Dana.jpeg');
          await client.sendImage(sender, qrisPath, 'qris_dana.jpeg', `📷 Silakan scan QRIS DANA berikut untuk membayar sebesar *${produk.harga}*.\nSetelah transfer, kirim foto bukti pembayaran.`);
        } else if (text === '3') {
          await client.sendText(sender, `🏦 Silakan transfer sebesar *${produk.harga}* ke rekening berikut:\n\nBank: BNI\nNomor Rekening: 1794901004\nAtas Nama: AVISHA RIANI LATUMETEN\n\nSetelah transfer, kirim foto bukti pembayaran.`);
        } else if (text === '4') {
          await client.sendText(sender, '📍 Anda memilih metode pembayaran *COD*.\nSilakan ketik nama seller tempat Anda akan COD.');
          userState[sender] = {
            ...state,
            awaitingPaymentMethod: false,
            awaitingCODSeller: true,
          };
          return;
        } else {
          await client.sendText(sender, '❌ Pilihan tidak valid. Balas dengan angka 1, 2, 3, atau 4.');
          return;
        }

        userState[sender] = {
          ...state,
          awaitingPaymentMethod: false,
          awaitingImage: true,
        };
      } catch (err) {
        console.error('❌ Gagal mengirim metode pembayaran:', err.message);
        await client.sendText(sender, '❌ Gagal mengirim metode pembayaran. Silakan coba lagi nanti.');
      }

      return;
    }

    // Step 3: COD - Konfirmasi nama seller
    if (state?.awaitingCODSeller) {
      try {
        const sellerName = text.toLowerCase();
        const sellers = await getAllSellers(); // Ambil semua seller dari Google Sheet
        const match = sellers.find((s) => s.name?.toLowerCase() === sellerName);

        if (match) {
          await client.sendText(sender, `✅ COD akan dikonfirmasi ke seller *${text}*.\n\nMohon ditunggu, kami akan konfirmasi pada seller tersebut.`);
        } else {
          await client.sendText(sender, `❌ Nama seller *${text}* tidak ditemukan di sistem kami. Silakan ketik ulang nama seller.`);
          return;
        }

        delete userState[sender]; // selesai proses
      } catch (err) {
        console.error('❌ Gagal cek seller:', err.message);
        await client.sendText(sender, '❌ Terjadi kesalahan saat memeriksa seller. Silakan coba lagi.');
      }

      return;
    }

    // Step 4: Cek kode barang
    const kodeBarang = extractKodeBarang(text);
    if (kodeBarang) {
      const produk = await getProductByCode(kodeBarang);

      if (produk) {
        await client.sendText(sender, `📦 Produk ditemukan:\nKode: ${produk.kode}\nHarga: ${produk.harga}`);

        userState[sender] = {
          produk,
          awaitingPaymentConfirmation: true,
        };

        await client.sendText(sender, 'Apakah Anda ingin membayar? (ya/tidak)');
      } else {
        await client.sendText(sender, `❌ Produk dengan kode *${kodeBarang}* tidak ditemukan.`);
      }

      return;
    }

    // Step 5: Sapaan awal
    if (text === 'halo') {
      await client.sendText(
        sender,
        'Halo! Ini AVI Bot 🤖\nKetik dengan format:\n`Kode: <kode_barang>`\nuntuk cek produk & pembayaran.'
      );
      return;
    }

    // Step 6: Tidak dikenali
    await client.sendText(sender, 'Ketik "halo" untuk mulai.');
  });
}

module.exports = { startMessageHandler };
