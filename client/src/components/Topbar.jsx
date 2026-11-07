import React from 'react';
import { Search, Bell, ShoppingCart, LogOut, User as UserIcon } from 'lucide-react';

export const Topbar = ({
  searchQuery,
  setSearchQuery,
  currentUser,
  cartCount,
  onOpenCart,
  onSwitchRole,
  onOpenAuthModal,
  onLogout
}) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search products, orders or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Role Switcher Pill for instant demonstration */}
        <div className="role-switcher" title="Quick switch role for testing">
          <button
            className={`role-pill ${currentUser?.role === 'admin' ? 'active' : ''}`}
            onClick={() => onSwitchRole('admin')}
          >
            Admin View
          </button>
          <button
            className={`role-pill ${currentUser?.role === 'customer' ? 'active' : ''}`}
            onClick={() => onSwitchRole('customer')}
          >
            Customer View
          </button>
        </div>

        {/* Cart Icon with Dynamic Count */}
        <button className="icon-btn" onClick={onOpenCart} title="Open Shopping Cart">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
        </button>

        {/* Notifications Icon */}
        <button className="icon-btn" title="Notifications">
          <Bell size={20} />
        </button>

        {/* Current User Badge */}
        {currentUser ? (
          <div className="user-profile-badge">
            <div className="avatar">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.1 }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              style={{ marginLeft: '4px', color: '#94a3b8' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuthModal}>
            <UserIcon size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
