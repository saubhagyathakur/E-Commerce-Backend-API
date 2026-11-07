import React from 'react';
import {
  TrendingUp,
  PackageCheck,
  ShoppingBag,
  Clock,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard = ({
  stats,
  recentOrders,
  inventoryAlerts,
  onOpenAddProduct,
  onNavigateTab,
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

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div>
      {/* Dashboard Top Greeting & Action */}
      <div className="dash-header">
        <div className="dash-greeting">
          <h1>Good morning, Shashwat!</h1>
          <p>{todayStr}</p>
        </div>
        <button className="btn-primary" onClick={onOpenAddProduct}>
          <Plus size={18} />
          <span>Quick Add Product</span>
        </button>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">TOTAL REVENUE</span>
            <div className="metric-icon-wrap" style={{ background: '#fff7ed', color: '#f97316' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats?.totalRevenue || 428510)}</div>
          <div className="metric-change">
            <ArrowUpRight size={14} />
            <span>+12.5% vs last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">TOTAL ORDERS</span>
            <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.totalOrders || 1284}</div>
          <div className="metric-change">
            <ArrowUpRight size={14} />
            <span>+8.2% vs last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">ACTIVE PRODUCTS</span>
            <div className="metric-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <PackageCheck size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.activeProducts || 347}</div>
          <div className="metric-change">
            <ArrowUpRight size={14} />
            <span>+3.2% vs last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">PENDING ORDERS</span>
            <div className="metric-icon-wrap" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#ef4444' }}>
            {stats?.pendingOrders || 23}
          </div>
          <div className="metric-change negative">
            <span>Requires review</span>
          </div>
        </div>
      </div>

      {/* Quick Action Pill Buttons */}
      <div className="quick-actions-bar">
        <span className="quick-action-label">Quick Actions:</span>
        <button className="action-pill-btn highlight" onClick={onOpenAddProduct}>
          <Plus size={16} />
          <span>Add Product</span>
        </button>
        <button className="action-pill-btn" onClick={() => onNavigateTab('orders')}>
          <ShoppingBag size={16} />
          <span>Manage Orders</span>
        </button>
        <button className="action-pill-btn" onClick={() => onNavigateTab('store')}>
          <ExternalLink size={16} />
          <span>Customer Storefront</span>
        </button>
        <button className="action-pill-btn" onClick={() => onNavigateTab('inventory')}>
          <RefreshCw size={16} />
          <span>Sync Inventory</span>
        </button>
      </div>

      {/* Two Column Grid: Recent Orders + Inventory Alerts */}
      <div className="dash-columns">
        {/* Left Column: Recent Orders */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Orders</h2>
            <button className="panel-link" onClick={() => onNavigateTab('orders')}>
              View All Orders
            </button>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((ord, idx) => {
                    const firstItem = ord.items?.[0];
                    const itemTitle = firstItem
                      ? `${firstItem.name} ${ord.items.length > 1 ? `(+${ord.items.length - 1} more)` : ''}`
                      : 'E-com Item';
                    const customerName = ord.customer?.name || 'Customer';

                    return (
                      <tr key={ord._id}>
                        <td style={{ fontWeight: 600 }}>#{ord._id.slice(-4).toUpperCase()}</td>
                        <td>{customerName}</td>
                        <td>{itemTitle}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(ord.totalAmount)}</td>
                        <td>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => onUpdateOrderStatus(ord._id, e.target.value)}
                            className={`status-badge ${ord.orderStatus.toLowerCase()}`}
                            style={{ border: 'none', outline: 'none', cursor: 'pointer' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      No recent orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Inventory Alerts */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <span>Inventory Alerts</span>
            </h2>
            <button className="panel-link" onClick={() => onNavigateTab('inventory')}>
              Manage
            </button>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {inventoryAlerts && inventoryAlerts.length > 0 ? (
                  inventoryAlerts.map((prod, idx) => (
                    <tr key={prod._id}>
                      <td style={{ fontWeight: 600 }}>{prod.name}</td>
                      <td style={{ color: '#64748b' }}>SKU-{prod._id.slice(-4).toUpperCase()}</td>
                      <td style={{ fontWeight: 700 }}>{prod.stock} left</td>
                      <td>
                        <span className={`status-badge ${prod.stock <= 5 ? 'low' : 'normal'}`}>
                          {prod.stock <= 5 ? 'Low' : 'Adequate'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                      All product inventories healthy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
