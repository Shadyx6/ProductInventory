import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, History, Package } from 'lucide-react';
import Header from '../components/Header';
import StockModal from '../components/StockModal';
import Toast from '../components/Toast';
import {
  fetchProductById,
  fetchProductTransactions,
  stockInProduct,
  stockOutProduct
} from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockMode, setStockMode] = useState('IN');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodData, transData] = await Promise.all([
        fetchProductById(id),
        fetchProductTransactions(id)
      ]);
      setProduct(prodData);
      setTransactions(transData);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStockSubmit = async ({ quantity, note }) => {
    try {
      if (stockMode === 'IN') {
        await stockInProduct(id, { quantity, note });
        showToast(`Stocked in ${quantity} units successfully`);
      } else {
        await stockOutProduct(id, { quantity, note });
        showToast(`Stocked out ${quantity} units successfully`);
      }
      setIsStockOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process stock movement', 'error');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-container">
        <Header />
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Inventory</span>
        </Link>
        <div className="table-card">
          <div className="empty-state">
            <Package size={40} className="empty-icon" />
            <h2>Product Not Found</h2>
            <p style={{ marginTop: '8px' }}>The requested product does not exist or was deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  const isLowStock = Number(product.quantity) < Number(product.low_stock_threshold);

  return (
    <div className="app-container">
      <Header />

      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Inventory</span>
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 className="detail-title">{product.name}</h2>
              <span className="sku-code">{product.sku}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
              Category: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.category}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setStockMode('IN');
                setIsStockOpen(true);
              }}
              className="stock-btn stock-btn-in"
              style={{ padding: '8px 14px' }}
            >
              <Plus size={14} strokeWidth={3} />
              <span>Stock In</span>
            </button>
            <button
              onClick={() => {
                setStockMode('OUT');
                setIsStockOpen(true);
              }}
              className="stock-btn stock-btn-out"
              style={{ padding: '8px 14px' }}
            >
              <Minus size={14} strokeWidth={3} />
              <span>Stock Out</span>
            </button>
          </div>
        </div>

        <div className="meta-grid">
          <div>
            <div className="meta-item-label">Status</div>
            <div className="meta-item-value">
              {isLowStock ? (
                <span className="badge badge-low-stock">
                  <span className="badge-dot"></span>
                  Low Stock
                </span>
              ) : (
                <span className="badge badge-in-stock">
                  <span className="badge-dot"></span>
                  In Stock
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="meta-item-label">Current Stock</div>
            <div className="meta-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {product.quantity} units
            </div>
          </div>

          <div>
            <div className="meta-item-label">Low Stock Threshold</div>
            <div className="meta-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {product.low_stock_threshold} units
            </div>
          </div>

          <div>
            <div className="meta-item-label">Unit Price</div>
            <div className="meta-item-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              ${Number(product.price).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <History size={18} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Stock Movement History</h3>
      </div>

      <div className="table-card">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transaction history recorded for this product yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Quantity Movement</th>
                  <th>Note / Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const dateStr = new Date(tx.created_at).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });
                  const isStockIn = tx.type === 'IN';
                  return (
                    <tr key={tx.id}>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{dateStr}</td>
                      <td>
                        <span className={`badge ${isStockIn ? 'badge-in' : 'badge-out'}`}>
                          {isStockIn ? <Plus size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
                          {isStockIn ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td>
                        <span className="quantity-text" style={{ color: isStockIn ? 'var(--status-in-text)' : 'var(--danger-text)' }}>
                          {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {tx.note || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StockModal
        isOpen={isStockOpen}
        onClose={() => setIsStockOpen(false)}
        onSubmit={handleStockSubmit}
        product={product}
        mode={stockMode}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
