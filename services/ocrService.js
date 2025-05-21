const Tesseract = require('tesseract.js');
const path = require('path');

async function extractTextFromImage(imagePath) {
    try {
      const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: m => console.log(m),
      });
  
      const text = result.data.text;
  
      // Ekstrak nominal
      const nominalMatch = text.match(/Rp[\s]*([\d.,]+)/i);
      const nominal = nominalMatch ? parseInt(nominalMatch[1].replace(/[^\d]/g, '')) : null;
  
      // Ekstrak tanggal
      const dateMatch = text.match(/\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}/);
      const date = dateMatch ? dateMatch[0] : null;
  
      // Ekstrak provider
      const providerMatch = text.match(/Nama Issuer Bank ([A-Z]+)/i);
      const provider = providerMatch ? providerMatch[1] : null;
  
      return { nominal, date, provider, rawText: text };
    } catch (error) {
      console.error('OCR error:', error);
      return null;
    }
  }
  

module.exports = {
  extractTextFromImage,
};
