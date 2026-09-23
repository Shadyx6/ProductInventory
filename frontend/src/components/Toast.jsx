import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'}`}>
      {type === 'error' ? (
        <AlertCircle size={18} />
      ) : (
        <CheckCircle size={18} />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="close-btn" style={{ marginLeft: '8px', padding: '2px' }}>
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
