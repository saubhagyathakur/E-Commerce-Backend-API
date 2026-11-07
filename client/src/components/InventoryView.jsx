import React from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';

export const InventoryView = ({
  products,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  loading
}) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1e293b' }}>
            Product Catalog & Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Admin product management: add, edit, track stock counts, and delete products.
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddProduct}>
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Units</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isLow = product.stock <= 3;
                const isOut = product.stock <= 0;

                return (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="chip" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(product.price)}</td>
                    <td style={{ fontWeight: 600 }}>{product.stock}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          isOut ? 'cancelled' : isLow ? 'low' : 'delivered'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="action-pill-btn"
                          style={{ padding: '6px 10px' }}
                          onClick={() => onOpenEditProduct(product)}
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="action-pill-btn"
                          style={{ padding: '6px 10px', color: '#ef4444' }}
                          onClick={() => onDeleteProduct(product._id)}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
