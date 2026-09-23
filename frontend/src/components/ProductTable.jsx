import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Trash2, Plus, Minus, Inbox } from 'lucide-react';

const ProductTable = ({ products, loading, onEdit, onDelete, onStockIn, onStockOut }) => {
  if (loading) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '14px', fontSize: '14px' }}>Loading inventory items...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <Inbox size={42} className="empty-icon" />
          <h3 style={{ fontSize: '16px', color: '#fff' }}>No products found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Try adjusting your search query or category filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Available Stock</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Stock Management & Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isLowStock = Number(product.quantity) < Number(product.low_stock_threshold);
              return (
                <tr key={product.id}>
                  <td>
                    <Link to={`/products/${product.id}`} className="product-link">
                      {product.name}
                    </Link>
                  </td>
                  <td>
                    <span className="sku-code">{product.sku}</span>
                  </td>
                  <td>
                    <span className="category-tag">{product.category}</span>
                  </td>
                  <td>
                    <span className="quantity-text" style={{ color: isLowStock ? 'var(--status-low-text)' : 'var(--text-primary)' }}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>
                    <span className="price-text">${Number(product.price).toFixed(2)}</span>
                  </td>
                  <td>
                    {isLowStock ? (
                      <span className="badge badge-low-stock">
                        <span className="badge-dot"></span>
                        Low Stock ({product.quantity}/{product.low_stock_threshold})
                      </span>
                    ) : (
                      <span className="badge badge-in-stock">
                        <span className="badge-dot"></span>
                        In Stock
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button
                        title="Stock In (+)"
                        onClick={() => onStockIn(product)}
                        className="stock-btn stock-btn-in"
                      >
                        <Plus size={13} strokeWidth={3} />
                        <span>Stock In</span>
                      </button>
                      <button
                        title="Stock Out (-)"
                        onClick={() => onStockOut(product)}
                        className="stock-btn stock-btn-out"
                      >
                        <Minus size={13} strokeWidth={3} />
                        <span>Stock Out</span>
                      </button>
                      <button
                        title="Edit Details"
                        onClick={() => onEdit(product)}
                        className="icon-btn-subtle"
                        style={{ marginLeft: '4px' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        title="Delete Product"
                        onClick={() => onDelete(product)}
                        className="icon-btn-subtle icon-btn-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
