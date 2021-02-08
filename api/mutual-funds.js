const _ = require('lodash');
const GoogleSheet = require('../GoogleSheet');
const indonesiaMarket = require('../indonesiaMarket');

const googleSheet = new GoogleSheet({
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_PRIVATE_KEY,
});

module.exports = async (req, res) => {
  const spreadsheetId = req.query.spreadsheetId;

  if (typeof spreadsheetId !== 'string' || spreadsheetId.trim().length === 0) {
    return res.status(422).json({ error: 'spreadsheetId is required.' });
  }

  try {
    const [products, items] = await Promise.all([
      indonesiaMarket.get('mutual-funds', { per_page: 2000 }),
      googleSheet.get({ spreadsheetId, range: 'Mutual Funds!A2:E' }),
    ]);

    const portfolio = items.map(item => {
      const product = _.find(products, product => {
        return product.Name.toLowerCase() === item[0].toLowerCase();
      });

      return {
        name: item[0],
        platform: item[1],
        type: item[2],
        units: item[3],
        average_value: item[4],
        last_price: product ? product.NetAssetValue : null,
        last_update: product ? `${product.LastUpdate}+07:00` : null,
      };
    });

    return res.json(portfolio);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};