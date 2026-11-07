import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  placingOrder
}) => {
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (!isOpen) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleCheckout = async () => {
    try {
      const order = await onPlaceOrder();
      if (order) {
        setOrderSuccess(order);
      }
    } catch (err) {
      // Error handled by parent toast/alert
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Your Shopping Cart</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {orderSuccess ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={54} color="#16a34a" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
              Order Placed Successfully!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Order ID: <strong>#{orderSuccess._id?.slice(-6).toUpperCase()}</strong>
            </p>
            <p style={{ color: '#334155', fontSize: '0.88rem', marginBottom: '24px', maxWidth: '300px' }}>
              Your order total of <strong>{formatCurrency(orderSuccess.totalAmount)}</strong> has been confirmed. Stock was verified and reduced.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setOrderSuccess(null);
                onClose();
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : !cart?.items || cart.items.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              Your Cart is Empty
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
              Browse the catalog and add products to start an order.
            </p>
            <button className="btn-secondary" onClick={onClose}>
              Browse Store
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.items.map((item) => {
                const prod = item.product;
                const canIncrease = item.quantity < prod.stock;

                return (
                  <div key={prod._id} className="cart-item-row">
                    <img
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                      alt={prod.name}
                      className="cart-item-thumb"
                    />
                    <div className="cart-item-details">
                      <div className="cart-item-name">{prod.name}</div>
                      <div className="cart-item-price">
                        {formatCurrency(item.unitPrice || prod.price)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(prod._id, item.quantity - 1)}
                            title="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            disabled={!canIncrease}
                            onClick={() => onUpdateQuantity(prod._id, item.quantity + 1)}
                            title={canIncrease ? 'Increase quantity' : `Max available stock reached (${prod.stock})`}
                            style={{ opacity: canIncrease ? 1 : 0.4 }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                          Subtotal: {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(prod._id)}
                      title="Remove from cart"
                      style={{ color: '#94a3b8', alignSelf: 'flex-start', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-summary-line">
                <span>Calculated Total:</span>
                <span style={{ color: 'var(--primary)' }}>
                  {formatCurrency(cart.totalAmount)}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                * Verified and calculated directly on the server.
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-secondary"
                  onClick={onClearCart}
                  style={{ padding: '10px 14px' }}
                  title="Clear all items"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCheckout}
                  disabled={placingOrder}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {placingOrder ? (
                    'Processing Order...'
                  ) : (
                    <>
                      <span>Place Order ({formatCurrency(cart.totalAmount)})</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
