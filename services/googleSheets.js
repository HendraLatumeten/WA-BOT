const { google } = require('googleapis');
const CREDENTIALS = require('../credentials.json');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = '1bUak2y1XdfieLMLfa1So52YSH8h9NiszHfgHFzpQcDE';

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

const sheets = google.sheets({ version: 'v4', auth });

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

async function getAllSellers() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Cloter1_Selling!J2:J', // Kolom J dari baris 2 ke bawah
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('Data seller kosong.');
      return [];
    }

    const sellers = rows.map(row => ({ name: row[0] })).filter(s => s.name);

    console.log('Sellers:', sellers); // Opsional, untuk debug

    return sellers;
  } catch (error) {
    console.error('Error getting sellers from Google Sheets:', error);
    return [];
  }
}


module.exports = { getProductByCode, getAllSellers };
