function extractKodeBarang(text) {
    const regex = /\(Kode:\s*([^)]+)\)/i;
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

function isNominalValid(nominalOCR, hargaProduk) {
    const biayaTransferMaks = 25000;
    const selisih = nominalOCR - hargaProduk;
  
    // Bisa sama persis, atau beda maksimal Rp25.000
    return selisih >= 0 && selisih <= biayaTransferMaks;
  }
  function normalizeNominal(value) {
    if (!value) return null;
  
    const cleaned = value
      .toString()
      .replace(/[^\d]/g, ''); // Hapus semua selain angka
  
    return parseInt(cleaned, 10); // Ubah ke integer
  }
  
  module.exports = { extractKodeBarang, isNominalValid, normalizeNominal };
  