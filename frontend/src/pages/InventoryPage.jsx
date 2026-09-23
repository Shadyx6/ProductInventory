import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import ProductTable from '../components/ProductTable';
import ProductFormModal from '../components/ProductFormModal';
import StockModal from '../components/StockModal';
import DeleteModal from '../components/DeleteModal';
import Toast from '../components/Toast';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  stockInProduct,
  stockOutProduct
} from '../services/api';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProductForForm, setSelectedProductForForm] = useState(null);

  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockMode, setStockMode] = useState('IN');
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProducts(searchTerm, selectedCategory);
      setProducts(data);

      const allCats = Array.from(new Set(data.map((p) => p.category))).filter(Boolean);
      setCategories(['All', ...allCats]);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to load products from backend API',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = async (formData) => {
    try {
      await createProduct(formData);
      showToast('Product added successfully');
      setIsFormOpen(false);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create product', 'error');
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      await updateProduct(selectedProductForForm.id, formData);
      showToast('Product updated successfully');
      setIsFormOpen(false);
      setSelectedProductForForm(null);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(selectedProductForDelete.id);
      showToast('Product deleted successfully');
      setIsDeleteOpen(false);
      setSelectedProductForDelete(null);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const handleStockSubmit = async ({ quantity, note }) => {
    try {
      const id = selectedProductForStock.id;
      if (stockMode === 'IN') {
        await stockInProduct(id, { quantity, note });
        showToast(`Stocked in ${quantity} units successfully`);
      } else {
        await stockOutProduct(id, { quantity, note });
        showToast(`Stocked out ${quantity} units successfully`);
      }
      setIsStockOpen(false);
      setSelectedProductForStock(null);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock', 'error');
    }
  };

  return (
    <div className="app-container">
      <Header onAddProduct={() => {
        setSelectedProductForForm(null);
        setIsFormOpen(true);
      }} />

      <div className="toolbar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-field"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {products.length} products
          </span>
          <button onClick={loadProducts} className="btn-icon" title="Refresh Products">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        onEdit={(prod) => {
          setSelectedProductForForm(prod);
          setIsFormOpen(true);
        }}
        onDelete={(prod) => {
          setSelectedProductForDelete(prod);
          setIsDeleteOpen(true);
        }}
        onStockIn={(prod) => {
          setSelectedProductForStock(prod);
          setStockMode('IN');
          setIsStockOpen(true);
        }}
        onStockOut={(prod) => {
          setSelectedProductForStock(prod);
          setStockMode('OUT');
          setIsStockOpen(true);
        }}
      />

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProductForForm(null);
        }}
        onSubmit={selectedProductForForm ? handleUpdateProduct : handleCreateProduct}
        initialData={selectedProductForForm}
      />

      <StockModal
        isOpen={isStockOpen}
        onClose={() => {
          setIsStockOpen(false);
          setSelectedProductForStock(null);
        }}
        onSubmit={handleStockSubmit}
        product={selectedProductForStock}
        mode={stockMode}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProductForDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        productName={selectedProductForDelete ? selectedProductForDelete.name : ''}
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

export default InventoryPage;
