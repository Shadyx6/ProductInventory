import React, { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";

const StockModal = ({ isOpen, onClose, onSubmit, product, mode = "IN" }) => {
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setQuantity("1");
    setNote("");
    setError("");
  }, [isOpen, product, mode]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("Quantity must be an integer greater than 0");
      return;
    }

    if (mode === "OUT" && parsedQty > product.quantity) {
      setError(
        `Stock-out quantity (${parsedQty}) cannot exceed available stock (${product.quantity})`,
      );
      return;
    }

    onSubmit({ quantity: parsedQty, note: note.trim() });
  };

  const parsedInput = parseInt(quantity, 10);
  const validQty = !isNaN(parsedInput) && parsedInput > 0 ? parsedInput : 0;
  const projectedStock =
    mode === "IN"
      ? Number(product.quantity) + validQty
      : Number(product.quantity) - validQty;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className={`badge ${mode === "IN" ? "badge-in-stock" : "badge-low-stock"}`}
              style={{ padding: "6px" }}
            >
              {mode === "IN" ? (
                <Plus size={16} strokeWidth={3} />
              ) : (
                <Minus size={16} strokeWidth={3} />
              )}
            </div>
            <div>
              <h2 className="modal-title">
                {mode === "IN" ? "Stock In Movement" : "Stock Out Movement"}
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                SKU: {product.sku}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                backgroundColor: "var(--bg-main)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                marginBottom: "18px",
                border: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    display: "block",
                  }}
                >
                  Target Item
                </span>
                <strong style={{ fontSize: "14px", color: "#fff" }}>
                  {product.name}
                </strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    display: "block",
                  }}
                >
                  Projected Stock
                </span>
                <strong
                  style={{
                    fontSize: "15px",
                    fontFamily: "var(--font-mono)",
                    color:
                      mode === "IN"
                        ? "var(--status-in-text)"
                        : projectedStock < 0
                          ? "var(--danger-text)"
                          : "var(--text-primary)",
                  }}
                >
                  {product.quantity} ➔{" "}
                  {projectedStock >= 0 ? projectedStock : 0} units
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {mode === "IN"
                  ? "Quantity to Add (+)"
                  : "Quantity to Remove (-)"}
              </label>

              <div className="quantity-control">
                <button
                  type="button"
                  className="quantity-stepper-btn"
                  onClick={() => {
                    const current = parseInt(quantity, 10) || 1;
                    setQuantity(String(Math.max(1, current - 1)));
                    setError("");
                  }}
                  disabled={parseInt(quantity, 10) <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setError("");
                  }}
                  className="quantity-input"
                  placeholder="1"
                  autoFocus
                  aria-label="Quantity"
                />

                <button
                  type="button"
                  className="quantity-stepper-btn"
                  onClick={() => {
                    const current = parseInt(quantity, 10) || 0;
                    setQuantity(String(current + 1));
                    setError("");
                  }}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              {error && <p className="form-error">{error}</p>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Reason / Transaction Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-control"
                placeholder={
                  mode === "IN"
                    ? "e.g. Supplier delivery invoice #4092"
                    : "e.g. Customer order dispatch"
                }
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`stock-btn ${mode === "IN" ? "stock-btn-in" : "stock-btn-out"}`}
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              {mode === "IN" ? (
                <Plus size={14} strokeWidth={3} />
              ) : (
                <Minus size={14} strokeWidth={3} />
              )}
              <span>
                {mode === "IN" ? "Confirm Stock In" : "Confirm Stock Out"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;
