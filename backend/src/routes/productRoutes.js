const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  stockIn,
  stockOut,
  getProductTransactions
} = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/stock-in', stockIn);
router.post('/:id/stock-out', stockOut);
router.get('/:id/transactions', getProductTransactions);

module.exports = router;
