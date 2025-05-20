function extractKodeBarang(text) {
    const regex = /\(Kode:\s*([^)]+)\)/i;
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }
  
  module.exports = { extractKodeBarang };
  