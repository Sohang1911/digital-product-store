import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, User, LogOut, BarChart3, Package } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { AdminPanel } from './components/AdminPanel';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { AdminLogin } from './components/AdminLogin';
import { CustomerDashboard } from './components/CustomerDashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { analyticsAPI, authAPI } from './services/api';

type Page = 'home' | 'admin' | 'cart' | 'checkout' | 'admin-login' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Don't auto-login on page load - user must click Admin button
    // checkAuthStatus(); // Disabled for fresh login every time

    // Load cart from localStorage (cart stays on client)
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Track visitor using backend API
    trackVisitor();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await authAPI.verifyToken();
        setIsAdminLoggedIn(true);
      } catch (error) {
        // Token invalid, clear it
        localStorage.removeItem('authToken');
        setIsAdminLoggedIn(false);
      }
    }
  };

  const trackVisitor = async () => {
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
      await analyticsAPI.trackVisitor();
      localStorage.setItem('lastVisit', today);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cartItems, { ...product, quantity: 1 }];
    }
    
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Product added to cart!');
  };

  const removeFromCart = (productId: string) => {
    const newCart = cartItems.filter(item => item.id !== productId);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Product removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  const handleAdminLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsAdminLoggedIn(true);
    setCurrentPage('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('authToken');
    setCurrentPage('home');
    toast.success('Logged out successfully');
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigateTo = (page: Page) => {
    // Home pe jaane par admin session clear karo
    if (page === 'home' && isAdminLoggedIn) {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('authToken');
      toast.success('Admin session closed');
    }
    
    if (page === 'admin' && !isAdminLoggedIn) {
      setCurrentPage('admin-login');
    } else {
      setCurrentPage(page);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => navigateTo('home')}
            >
              <Package className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-indigo-900">Digital Store</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigateTo('home')}
                className={`${currentPage === 'home' ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className={`${currentPage === 'dashboard' ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition flex items-center`}
              >
                <User className="h-4 w-4 mr-1" />
                My Orders
              </button>
              <button
                onClick={() => navigateTo('admin')}
                className={`${currentPage === 'admin' || currentPage === 'admin-login' ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition flex items-center`}
              >
                {isAdminLoggedIn ? <BarChart3 className="h-4 w-4 mr-1" /> : <User className="h-4 w-4 mr-1" />}
                {isAdminLoggedIn ? 'Dashboard' : 'Admin'}
              </button>
              
              {currentPage === 'home' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                onClick={() => navigateTo('cart')}
                className="relative flex items-center text-gray-700 hover:text-indigo-600 transition"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-3">
                <button
                  onClick={() => navigateTo('home')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Home
                </button>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  My Orders
                </button>
                <button
                  onClick={() => navigateTo('admin')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  {isAdminLoggedIn ? 'Dashboard' : 'Admin Login'}
                </button>
                <button
                  onClick={() => navigateTo('cart')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between"
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1">
                      {cartCount}
                    </span>
                  )}
                </button>
                {isAdminLoggedIn && (
                  <button
                    onClick={handleAdminLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <HomePage 
            addToCart={addToCart} 
            searchQuery={searchQuery}
            onNavigateToCart={() => navigateTo('cart')}
          />
        )}
        {currentPage === 'admin-login' && (
          <AdminLogin onLogin={handleAdminLogin} />
        )}
        {currentPage === 'admin' && (
          <>
            {isAdminLoggedIn ? (
              <AdminPanel onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )}
          </>
        )}
        {currentPage === 'cart' && (
          <Cart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={() => navigateTo('checkout')}
            onContinueShopping={() => navigateTo('home')}
          />
        )}
        {currentPage === 'checkout' && (
          <Checkout
            items={cartItems}
            total={cartTotal}
            onSuccess={() => {
              clearCart();
              navigateTo('home');
            }}
            onCancel={() => navigateTo('cart')}
          />
        )}
        {currentPage === 'dashboard' && (
          <CustomerDashboard />
        )}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
