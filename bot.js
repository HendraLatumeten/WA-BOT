const venom = require('venom-bot');
const express = require('express');
const { google } = require('googleapis');
const app = express();
const PORT = 3000;

let whatsappClient = null;

// === Load credential Google API ===
const CREDENTIALS = require('./credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1bUak2y1XdfieLMLfa1So52YSH8h9NiszHfgHFzpQcDE';

// === Fungsi Ekstrak Kode Barang ===
function extractKodeBarang(text) {
  const regex = /\(Kode:\s*([^)]+)\)/i;
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

// === Ambil Produk dari Google Sheet ===
async function getProductByCode(kodeBarang) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Cloter1!A2:G',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('Data Google Sheets kosong.');
      return null;
    }

    console.log('Data produk dari Google Sheets:');
    rows.forEach((row, index) => {
      console.log(`Baris ${index + 2}: KODE=${row[0]}, HARGA=${row[6]}`);
    });

    for (const row of rows) {
      if (row[0] && row[0].toLowerCase() === kodeBarang.toLowerCase()) {
        return {
          kode: row[0],
          harga: row[6] || '-',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting data from Google Sheets:', error);
    return null;
  }
}

// === Inisialisasi Venom Bot ===
venom
  .create({
    session: 'bot-wa',
    headless: false,
    useChrome: true,
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

    // Tambahkan log status WA
    client.onStateChange((state) => {
      console.log('🟢 WA STATE:', state);
      if (state === 'Connected') {
        console.log('✅ Bot berhasil terhubung ke WhatsApp!');
      }
    });

    client.onStreamChange((state) => {
      console.log('🔁 Stream state:', state);
    });

    start(client);
  })
  .catch((err) => console.log('❌ Gagal start bot:', err));

// === Mulai Listener Pesan ===
function start(client) {
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

// === Endpoint Tes Express ===
app.get('/', (req, res) => {
  res.send('✅ Bot WA aktif via ngrok!');
});

app.get('/send', async (req, res) => {
  const to = req.query.to;
  const text = req.query.text;

  if (!to || !text) {
    return res.status(400).send('❌ Format salah. Gunakan /send?to=628xxxx&text=Pesan');
  }

  try {
    await whatsappClient.sendText(`${to}@c.us`, text);
    res.send('✅ Pesan dikirim');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal kirim pesan');
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🌐 Express server aktif di http://localhost:${PORT}`);
});
