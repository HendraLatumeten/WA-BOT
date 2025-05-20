const venom = require('venom-bot');
const express = require('express');
const app = express();
const PORT = 3000;

let whatsappClient = null;

venom
  .create({
    session: 'bot-wa',
    headless: 'new',
    useChrome: true,
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
    start(client);
    console.log('✅ Bot siap!');
  })
  .catch((err) => console.log('❌ Gagal start bot:', err));

function start(client) {
  console.log('⚡ Bot started, listening to messages...');
  client.onMessage((message) => {
    console.log('📩 Pesan masuk:', message.body);
    if (message.body.toLowerCase() === 'halo') {
      client.sendText(message.from, 'Halo! Ini bot WA pribadi 🤖');
    } else {
      client.sendText(message.from, 'Ketik "halo" untuk mulai.');
    }
  });
}

// Endpoint uji coba dari luar (via ngrok)
app.get('/', (req, res) => {
  res.send('✅ Bot WA aktif via ngrok!');
});

// Endpoint kirim pesan dari luar (via HTTP GET)
app.get('/send', async (req, res) => {
  const to = req.query.to; // contoh: 628123456789
  const text = req.query.text;

  if (!to || !text) {
    return res.status(400).send('❌ Format salah. Gunakan /send?to=628xxxx&text=Pesan');
  }

  try {
    await whatsappClient.sendText(`55${to}@c.us`, text); // Ganti 55 dengan kode negara jika perlu
    res.send('✅ Pesan dikirim');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal kirim pesan');
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Express server aktif di http://localhost:${PORT}`);
});
