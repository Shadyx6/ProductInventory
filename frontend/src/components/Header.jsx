import React from 'react';
import { Package, Plus } from 'lucide-react';

const Header = ({ onAddProduct }) => {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo-icon">
          <Package size={22} />
        </div>
        <div>
          <h1 className="header-title">StockTrack</h1>
          <p className="header-description">Real-time Product Inventory & Stock Movement Management</p>
        </div>
      </div>
      {onAddProduct && (
        <button onClick={onAddProduct} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      )}
    </header>
  );
};

export default Header;
