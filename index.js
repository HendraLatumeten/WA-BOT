const express = require('express');
const { createBot } = require('./bot/client');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = 3000;

// Jalankan bot WA
createBot();

// Route Express
app.use('/', messageRoutes);

app.listen(PORT, () => {
  console.log(`🌐 Express server aktif di http://localhost:${PORT}`);
});
