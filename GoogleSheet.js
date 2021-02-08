const { google } = require('googleapis');

class GoogleSheet {
  constructor({ clientEmail, privateKey }) {
    this.clientEmail = clientEmail;
    this.privateKey = privateKey;
  }

  client() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.clientEmail,
        private_key: this.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
  }

  async get(params) {
    return new Promise((resolve, reject) => {
      this.client().spreadsheets.values.get({
        valueRenderOption: 'UNFORMATTED_VALUE',
        ...params,
      }, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res.data.values);
        }
      });
    });
  }
}

module.exports = GoogleSheet;