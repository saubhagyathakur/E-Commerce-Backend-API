import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ShoppingCart,
  Users,
  Layers,
  Settings,
  HelpCircle,
  FileCode2,
  ExternalLink
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">C</div>
        <div className="brand-text">Copper</div>
      </div>

      <ul className="nav-menu">
        <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
          <button onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
        </li>

        <li className={`nav-item ${activeTab === 'store' ? 'active' : ''}`}>
          <button onClick={() => setActiveTab('store')}>
            <ShoppingBag size={18} />
            <span>Store Catalog</span>
          </button>
        </li>

        <li className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}>
          <button onClick={() => setActiveTab('orders')}>
            <ShoppingCart size={18} />
            <span>{userRole === 'admin' ? 'Manage Orders' : 'My Orders'}</span>
          </button>
        </li>

        {userRole === 'admin' && (
          <li className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('inventory')}>
              <Package size={18} />
              <span>Inventory & Products</span>
            </button>
          </li>
        )}

        <li className="nav-item">
          <a
            href="/api-docs"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '0.92rem',
              fontWeight: 500
            }}
          >
            <FileCode2 size={18} />
            <span>API Docs (Swagger)</span>
            <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
          </a>
        </li>
      </ul>

      <div className="sidebar-footer">
        <ul className="nav-menu">
          <li className="nav-item">
            <button onClick={() => alert('Settings: E-Commerce API configured for MongoDB & Node.js')}>
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => alert('Assignment 2: E-Commerce Backend API with React + Express + Node.js + MongoDB')}>
              <HelpCircle size={18} />
              <span>Help & Docs</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};
