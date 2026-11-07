import React, { useState } from 'react';
import { X, ShieldCheck, User } from 'lucide-react';

export const AuthModal = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  loading
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isRegister) {
        await onRegister(name, email, password, role);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  const handleQuickFill = (type) => {
    setIsRegister(false);
    setErrorMsg('');
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123');
    } else {
      setEmail('customer@example.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isRegister ? 'Create an Account' : 'Sign In to Copper'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick Demo Fill Buttons */}
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Quick Test Credentials:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                  onClick={() => handleQuickFill('admin')}
                >
                  <ShieldCheck size={14} color="#f97316" />
                  <span>Admin (Shashwat)</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                  onClick={() => handleQuickFill('customer')}
                >
                  <User size={14} color="#3b82f6" />
                  <span>Customer (Priya)</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            {isRegister && (
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label>Account Role *</label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="customer">Customer (Browse, Cart & Orders)</option>
                  <option value="admin">Admin (Manage Products, Orders & Stats)</option>
                </select>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
              >
                {isRegister
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Register here"}
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
