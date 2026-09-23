import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const StockModal = ({ isOpen, onClose, onSubmit, product, mode = 'IN' }) => {
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setQuantity('1');
    setNote('');
    setError('');
  }, [isOpen, product, mode]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Quantity must be an integer greater than 0');
      return;
    }

    if (mode === 'OUT' && parsedQty > product.quantity) {
      setError(`Stock-out quantity (${parsedQty}) cannot exceed available stock (${product.quantity})`);
      return;
    }

    onSubmit({ quantity: parsedQty, note: note.trim() });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'IN' ? (
              <ArrowDownLeft size={20} style={{ color: 'var(--status-in-text)' }} />
            ) : (
              <ArrowUpRight size={20} style={{ color: 'var(--danger-text)' }} />
            )}
            <h2 className="modal-title">
              {mode === 'IN' ? 'Stock In' : 'Stock Out'} - {product.name}
            </h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Current stock: <strong style={{ color: 'var(--text-primary)' }}>{product.quantity} units</strong> (SKU: {product.sku})
            </div>

            <div className="form-group">
              <label className="form-label">
                {mode === 'IN' ? 'Quantity to Add *' : 'Quantity to Remove *'}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError('');
                }}
                className="form-control"
                placeholder="1"
                autoFocus
              />
              {error && <p className="form-error">{error}</p>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason / Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-control"
                placeholder={mode === 'IN' ? 'e.g. Supplier delivery' : 'e.g. Customer order #1042'}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${mode === 'IN' ? 'btn-primary' : 'btn-danger'}`}
            >
              {mode === 'IN' ? 'Confirm Stock In' : 'Confirm Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;
