import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerStore } from './components/CustomerStore';
import { OrdersView } from './components/OrdersView';
import { InventoryView } from './components/InventoryView';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { AuthModal } from './components/AuthModal';
import { api, getStoredUser, setAuthToken } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [searchQuery, setSearchQuery] = useState('');

  // Products & Filtering
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Cart
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Dashboard Stats & Admin Data
  const [dashData, setDashData] = useState({
    stats: null,
    recentOrders: [],
    inventoryAlerts: []
  });

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Toast / notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch between demo accounts effortlessly
  const handleSwitchRole = async (targetRole) => {
    try {
      if (targetRole === 'admin') {
        const res = await api.login('admin@example.com', 'Admin@123');
        setCurrentUser(res.user);
        setActiveTab('dashboard');
        showToast('Switched to Admin profile (Shashwat)', 'success');
      } else {
        const res = await api.login('customer@example.com', 'Customer@123');
        setCurrentUser(res.user);
        setActiveTab('store');
        showToast('Switched to Customer profile (Priya Sharma)', 'success');
      }
      fetchCart();
      fetchDashboard();
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Initial Auth & Data Load
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!currentUser) {
          // Auto-login default demo admin for an instant out-of-the-box experience
          const res = await api.login('admin@example.com', 'Admin@123');
          setCurrentUser(res.user);
        } else {
          const profile = await api.getProfile();
          setCurrentUser(profile);
        }
      } catch (e) {
        console.warn('Initial session expired or not set, logging in default demo account');
        try {
          const res = await api.login('admin@example.com', 'Admin@123');
          setCurrentUser(res.user);
        } catch {
          // ignore
        }
      }
    };
    initAuth();
  }, []);

  // Fetch Products based on search, category and price filters
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts({
        search: searchQuery,
        category: selectedCategory,
        minPrice,
        maxPrice
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [searchQuery, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Cart
  const fetchCart = async () => {
    try {
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCart();
    }
  }, [currentUser]);

  // Fetch Dashboard Stats
  const fetchDashboard = async () => {
    if (currentUser?.role !== 'admin') return;
    try {
      const data = await api.getDashboardStats();
      setDashData(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchDashboard();
    }
  }, [currentUser]);

  // Fetch Orders
  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      if (currentUser.role === 'admin') {
        const all = await api.getAllOrders();
        setOrders(all);
      } else {
        const my = await api.getMyOrders();
        setOrders(my);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, currentUser]);

  // Cart Actions
  const handleAddToCart = async (product) => {
    try {
      const updatedCart = await api.addToCart(product._id, 1);
      setCart(updatedCart);
      showToast(`Added "${product.name}" to cart!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    try {
      const updatedCart = await api.updateCartQuantity(productId, quantity);
      setCart(updatedCart);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveCartItem = async (productId) => {
    try {
      const updatedCart = await api.removeFromCart(productId);
      setCart(updatedCart);
      showToast('Item removed from cart', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      const updatedCart = await api.clearCart();
      setCart(updatedCart);
      showToast('Cart cleared', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const res = await api.placeOrder();
      showToast('Order confirmed and inventory updated!', 'success');
      fetchCart();
      fetchProducts();
      fetchDashboard();
      if (activeTab === 'orders') fetchOrders();
      return res.data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      setPlacingOrder(false);
    }
  };

  // Product Actions (Admin)
  const handleSaveProduct = async (productData) => {
    setSavingProduct(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, productData);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.createProduct(productData);
        showToast('Product created successfully!', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
      fetchCategories();
      fetchDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(productId);
      showToast('Product deleted', 'info');
      fetchProducts();
      fetchDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Order Status Update (Admin)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to '${newStatus}'`, 'success');
      fetchOrders();
      fetchDashboard();
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Auth Actions
  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await api.login(email, password);
      setCurrentUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      fetchCart();
      fetchDashboard();
      fetchOrders();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (name, email, password, role) => {
    setAuthLoading(true);
    try {
      const data = await api.register(name, email, password, role, 'admin_registration_secret_key_9999');
      setCurrentUser(data.user);
      showToast(`Account created for ${data.user.name}!`, 'success');
      fetchCart();
      fetchDashboard();
      fetchOrders();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCart({ items: [], totalItems: 0, totalAmount: 0 });
    showToast('Signed out', 'info');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#16a34a' : '#0f172a',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={currentUser?.role || 'customer'}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          cartCount={cart.totalItems || 0}
          onOpenCart={() => setIsCartOpen(true)}
          onSwitchRole={handleSwitchRole}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="page-body">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              stats={dashData.stats}
              recentOrders={dashData.recentOrders}
              inventoryAlerts={dashData.inventoryAlerts}
              onOpenAddProduct={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onNavigateTab={setActiveTab}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'store' && (
            <CustomerStore
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onAddToCart={handleAddToCart}
              loading={loadingProducts}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              userRole={currentUser?.role || 'customer'}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              loading={loadingOrders}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              onOpenAddProduct={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onOpenEditProduct={(prod) => {
                setEditingProduct(prod);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              loading={loadingProducts}
            />
          )}
        </main>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        placingOrder={placingOrder}
      />

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        saving={savingProduct}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={authLoading}
      />
    </div>
  );
}

export default App;
