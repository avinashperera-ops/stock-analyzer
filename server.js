const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const yfinance = require('yfinance');
const axios = require('axios');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// Endpoint to upload CSV file
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      fs.unlinkSync(filePath); // Delete the uploaded file
      res.json({ data: results });
    });
});

// Endpoint to fetch stock data by ticker
app.get('/stock/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker;
    const data = await yfinance.historical(ticker, { period: '1y' });
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching stock data');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});