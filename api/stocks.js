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
      indonesiaMarket.get('stocks', { per_page: 1000 }),
      googleSheet.get({ spreadsheetId, range: 'Stocks!A2:D' }),
    ]);

    const portfolio = items.map(item => {
      const product = _.find(products, product => {
        return product.Code.toUpperCase() === item[0].toUpperCase();
      });

      return {
        code: item[0],
        platform: item[1],
        units: item[2],
        average_value: item[3],
        name: product ? product.Name : null,
        sector: product ? _.startCase(product.SectorName.toLowerCase()) : null,
        subsector: product ? product.SubSectorName : null,
        last_price: product ? product.Last : null,
        last_update: product ? `${product.LastUpdate}+07:00` : null,
      };
    });

    return res.json(portfolio);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};