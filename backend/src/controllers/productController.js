const db = require('../db');

const getProducts = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let queryText = 'SELECT * FROM products';
    const queryParams = [];
    const conditions = [];

    if (search && search.trim() !== '') {
      queryParams.push(`%${search.trim()}%`);
      conditions.push(`(name ILIKE $${queryParams.length} OR sku ILIKE $${queryParams.length})`);
    }

    if (category && category.trim() !== '' && category !== 'All') {
      queryParams.push(category.trim());
      conditions.push(`category = $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY id DESC';

    const result = await db.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { name, sku, category, price, quantity, low_stock_threshold } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!sku || sku.trim() === '') {
      return res.status(400).json({ message: 'SKU is required' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: 'Category is required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number greater than 0' });
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ message: 'Initial quantity must be a non-negative integer' });
    }

    const parsedThreshold = parseInt(low_stock_threshold, 10);
    if (isNaN(parsedThreshold) || parsedThreshold < 0) {
      return res.status(400).json({ message: 'Low stock threshold must be a non-negative integer' });
    }

    const existingSku = await db.query('SELECT id FROM products WHERE LOWER(sku) = LOWER($1)', [sku.trim()]);
    if (existingSku.rows.length > 0) {
      return res.status(409).json({ message: 'Product with this SKU already exists' });
    }

    await client.query('BEGIN');

    const insertProductText = `
      INSERT INTO products (name, sku, category, price, quantity, low_stock_threshold)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const productValues = [
      name.trim(),
      sku.trim().toUpperCase(),
      category.trim(),
      parsedPrice,
      parsedQuantity,
      parsedThreshold
    ];

    const productResult = await client.query(insertProductText, productValues);
    const createdProduct = productResult.rows[0];

    if (parsedQuantity > 0) {
      const insertTransactionText = `
        INSERT INTO stock_transactions (product_id, type, quantity, note)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(insertTransactionText, [
        createdProduct.id,
        'IN',
        parsedQuantity,
        'Initial stock recorded on product creation'
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json(createdProduct);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, low_stock_threshold } = req.body;

    const existing = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: 'Category is required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number greater than 0' });
    }

    const parsedThreshold = parseInt(low_stock_threshold, 10);
    if (isNaN(parsedThreshold) || parsedThreshold < 0) {
      return res.status(400).json({ message: 'Low stock threshold must be a non-negative integer' });
    }

    const updateText = `
      UPDATE products
      SET name = $1, category = $2, price = $3, low_stock_threshold = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const result = await db.query(updateText, [
      name.trim(),
      category.trim(),
      parsedPrice,
      parsedThreshold,
      id
    ]);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(200).json({ message: 'Product deleted successfully', id: parseInt(id, 10) });
  } catch (error) {
    next(error);
  }
};

const stockIn = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const { quantity, note } = req.body;

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Stock-in quantity must be an integer greater than 0' });
    }

    await client.query('BEGIN');

    const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [id]);
    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentProduct = productResult.rows[0];
    const newQuantity = currentProduct.quantity + parsedQuantity;

    const updateResult = await client.query(
      'UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newQuantity, id]
    );

    const transactionNote = note && note.trim() !== '' ? note.trim() : 'Stock in update';
    await client.query(
      'INSERT INTO stock_transactions (product_id, type, quantity, note) VALUES ($1, $2, $3, $4)',
      [id, 'IN', parsedQuantity, transactionNote]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Stock updated successfully',
      product: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const stockOut = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const { quantity, note } = req.body;

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Stock-out quantity must be an integer greater than 0' });
    }

    await client.query('BEGIN');

    const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [id]);
    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentProduct = productResult.rows[0];

    if (parsedQuantity > currentProduct.quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Stock-out quantity (${parsedQuantity}) cannot exceed available stock (${currentProduct.quantity})`
      });
    }

    const newQuantity = currentProduct.quantity - parsedQuantity;

    const updateResult = await client.query(
      'UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newQuantity, id]
    );

    const transactionNote = note && note.trim() !== '' ? note.trim() : 'Stock out update';
    await client.query(
      'INSERT INTO stock_transactions (product_id, type, quantity, note) VALUES ($1, $2, $3, $4)',
      [id, 'OUT', parsedQuantity, transactionNote]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Stock updated successfully',
      product: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getProductTransactions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const result = await db.query(
      'SELECT * FROM stock_transactions WHERE product_id = $1 ORDER BY created_at DESC, id DESC',
      [id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  stockIn,
  stockOut,
  getProductTransactions
};
