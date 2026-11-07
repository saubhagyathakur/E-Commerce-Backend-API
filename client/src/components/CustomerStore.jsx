import React from 'react';
import { ShoppingCart, Eye, Check, AlertCircle } from 'lucide-react';

export const CustomerStore = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onAddToCart,
  onViewProductDetails,
  loading
}) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const allCategories = ['All', ...(categories || [])];

  return (
    <div>
      <div className="storefront-header">
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1e293b' }}>
            Store Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Browse and search products, filter by category & price range, and manage your cart.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="category-chips">
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Price Range & Quick Filter Bar */}
        <div className="store-filters-bar">
          <div className="price-filter-group">
            <span style={{ fontWeight: 600 }}>Filter by Price:</span>
            <span>₹</span>
            <input
              type="number"
              placeholder="Min"
              className="price-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              className="price-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            {(minPrice || maxPrice) && (
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
              >
                Clear Price
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Showing <strong>{products.length}</strong> available products
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <AlertCircle size={40} color="#f97316" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            No products match your criteria
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
            Try resetting your search query, category selection, or price filters.
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              onSelectCategory('All');
              setMinPrice('');
              setMaxPrice('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 3;

            return (
              <div key={product._id} className="product-card">
                <div className="product-img-wrapper">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                    alt={product.name}
                    loading="lazy"
                  />
                  <span className="product-category-tag">{product.category}</span>
                  <span
                    className="stock-tag"
                    style={{
                      background: isOutOfStock
                        ? '#fee2e2'
                        : isLowStock
                        ? '#fef3c7'
                        : '#dcfce7',
                      color: isOutOfStock
                        ? '#ef4444'
                        : isLowStock
                        ? '#b45309'
                        : '#16a34a'
                    }}
                  >
                    {isOutOfStock
                      ? 'Out of Stock'
                      : isLowStock
                      ? `${product.stock} left`
                      : 'In Stock'}
                  </span>
                </div>

                <div className="product-info">
                  <h3 className="product-title" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="product-desc">{product.description}</p>

                  <div className="product-footer">
                    <div className="product-price">{formatCurrency(product.price)}</div>

                    <button
                      className="btn-add-cart"
                      disabled={isOutOfStock}
                      onClick={() => onAddToCart(product)}
                      title={isOutOfStock ? 'Product out of stock' : 'Add to Shopping Cart'}
                    >
                      <ShoppingCart size={15} />
                      <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
