import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '0',
    low_stock_threshold: '5'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || '',
        price: initialData.price ? String(initialData.price) : '',
        quantity: initialData.quantity !== undefined ? String(initialData.quantity) : '0',
        low_stock_threshold: initialData.low_stock_threshold !== undefined ? String(initialData.low_stock_threshold) : '5'
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'Electronics',
        price: '',
        quantity: '0',
        low_stock_threshold: '5'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';

    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price must be a positive number greater than 0';
    }

    if (!isEdit) {
      const numQty = parseInt(formData.quantity, 10);
      if (isNaN(numQty) || numQty < 0) {
        newErrors.quantity = 'Initial quantity must be 0 or greater';
      }
    }

    const numThreshold = parseInt(formData.low_stock_threshold, 10);
    if (isNaN(numThreshold) || numThreshold < 0) {
      newErrors.low_stock_threshold = 'Threshold must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ergonomic Wireless Mouse"
                className="form-control"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={isEdit}
                  placeholder="e.g. ELEC-WM-001"
                  className="form-control"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.sku && <p className="form-error">{errors.sku}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  className="form-control"
                />
                {errors.category && <p className="form-error">{errors.category}</p>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-control"
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Low Stock Threshold *</label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  placeholder="5"
                  className="form-control"
                />
                {errors.low_stock_threshold && (
                  <p className="form-error">{errors.low_stock_threshold}</p>
                )}
              </div>
            </div>

            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Initial Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="form-control"
                />
                {errors.quantity && <p className="form-error">{errors.quantity}</p>}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
