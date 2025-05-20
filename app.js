const express = require('express');
const whatsappBot = require('./bot/client');

const app = express();
const PORT = 3000;

// Endpoint tes
app.get('/', (req, res) => {
  res.send('✅ Bot WA aktif via ngrok!');
});

// Endpoint kirim pesan manual
app.get('/send', async (req, res) => {
  const to = req.query.to;
  const text = req.query.text;

  if (!to || !text) {
    return res.status(400).send('❌ Format salah. Gunakan /send?to=628xxxx&text=Pesan');
  }

  try {
    await whatsappBot.sendMessage(`${to}@c.us`, text);
    res.send('✅ Pesan dikirim');
  } catch (err) {
    console.error('❌ Gagal kirim pesan:', err);
    res.status(500).send('❌ Gagal kirim pesan');
  }
});

// Mulai Express server
app.listen(PORT, () => {
  console.log(`🌐 Express server aktif di http://localhost:${PORT}`);
});

// Jalankan WhatsApp Bot
whatsappBot.createBot();
