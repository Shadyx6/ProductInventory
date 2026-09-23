const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use(errorHandler);

module.exports = app;
