const express = require('express');
const router = express.Router();
const { getClient } = require('../bot/client');

// Endpoint tes
router.get('/', (req, res) => {
  res.send('✅ Bot WA aktif via ngrok!');
});

// Endpoint kirim pesan
router.get('/send', async (req, res) => {
  const to = req.query.to;
  const text = req.query.text;

  if (!to || !text) {
    return res.status(400).send('❌ Format salah. Gunakan /send?to=628xxxx&text=Pesan');
  }

  const client = getClient();
  if (!client) {
    return res.status(500).send('❌ Client WhatsApp belum siap');
  }

  try {
    await client.sendText(`${to}@c.us`, text);
    res.send('✅ Pesan dikirim');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal kirim pesan');
  }
});

module.exports = router;
