import React from 'react';
import { Package, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';

export const OrdersView = ({
  orders,
  userRole,
  onUpdateOrderStatus,
  loading
}) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1e293b' }}>
          {userRole === 'admin' ? 'Order Management (Admin)' : 'My Orders'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {userRole === 'admin'
            ? 'View and manage all customer orders and update shipping statuses.'
            : 'Track your order history, verified items and delivery status.'}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            No orders found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {userRole === 'admin'
              ? 'No customer orders have been placed yet.'
              : 'You have not placed any orders yet. Visit the catalog to make your first purchase!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  {userRole === 'admin' && order.customer && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      Customer: <strong>{order.customer.name}</strong> ({order.customer.email})
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(order.totalAmount)}
                  </span>

                  {userRole === 'admin' ? (
                    <select
                      value={order.orderStatus}
                      onChange={(e) => onUpdateOrderStatus(order._id, e.target.value)}
                      className={`status-badge ${order.orderStatus.toLowerCase()}`}
                      style={{ border: 'none', outline: 'none', cursor: 'pointer', padding: '6px 12px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              {order.shippingAddress && (
                <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#f97316" />
                  <span>
                    Ship to: {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
