
# 🤖 WhatsApp Bot with Venom and Google Sheets

A WhatsApp bot built with Node.js using [venom-bot](https://github.com/orkestral/venom) and Google Sheets integration. Perfect for automating WhatsApp message sending based on data from Google Sheets.

---

## 🚀 Tech Stack

- Node.js  
- Express.js  
- Venom Bot  
- Google Sheets API  
- Puppeteer (Chromium)  

---

## 📦 Installation & Running

---

## ⚙️ System Requirements

- Node.js v14 or newer  
- npm  
- Linux Operating System  
- Active WhatsApp account (for QR scanning)  
- Chromium dependencies (see step 4)  

---

## 🚀 Installation and Running Steps

### 1. Clone the Project

```bash
git clone https://github.com/Hendra-Ikon/wa-bot.git
cd wa-bot
```

### 2. Install Node.js Dependencies

```bash
npm install
```

```bash
npm run install-deps
```
### 3. Check Node.js and npm Versions

```bash
node -v
npm -v
```

Make sure there are no errors and versions are appropriate (`node >= 14`).

---

### 4. Install Chromium System Dependencies (REQUIRED for LINUX)

If you get an error like:

```
error while loading shared libraries: libgbm.so.1: cannot open shared object file
```

Run:

```bash
sudo apt update && sudo apt install -y \
libatk-1.0-0 libgbm1 libx11-xcb1 libxcb1 libxcomposite1 \
libxdamage1 libxrandr2 libasound2 libpangocairo-1.0-0 \
libatk-bridge2.0-0 libcups2 libdrm2 libxfixes3 libxext6 \
libnss3 libxss1 libxtst6 libxshmfence1 libgtk-3-0
```

---

## ▶️ Running the Bot

### Run manually (for testing/development):

```bash
node app.js
```

### Run with npm script:

```bash
npm start
```

---

## 🖥️ Running in Background (with PM2)

### 1. Install PM2 globally:

```bash
npm install -g pm2
```

### 2. Start the bot with PM2:

```bash
pm2 start app.js --name wa-bot
```

### 3. Check bot status:

### 4. Show logs:

```bash
pm2 logs wa-bot
```

### 5. QR scanning in log pm2

```bash
pm2 status
```

### 6. Restart the bot:

```bash
pm2 restart wa-bot
```

### 7. Stop the bot:

```bash
pm2 stop wa-bot
```

### 8. Remove the bot from PM2:

```bash
pm2 delete wa-bot
```

---

## 🌐 Default Server

The bot will automatically run an Express server at:

```
http://localhost:3000
```

---

## 🧑‍💻 Contribution

Feel free to fork and submit pull requests if you want to add features or fix bugs.

---

## 📄 License

MIT License – Use and modify as you wish.

---

## 💬 Contact

If you encounter issues, please open an issue on GitHub or contact the author.
