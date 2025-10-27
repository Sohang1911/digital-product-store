import { useState, useEffect } from 'react';
import { Package, Download, User, Mail, Phone, Calendar, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ordersAPI } from '../services/api';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: any[];
  total: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

export function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('customerEmail');
    if (email) {
      setCustomerEmail(email);
      setSearchEmail(email);
      loadOrders(email);
    } else {
      setLoading(false);
    }
  }, []);

  const loadOrders = async (email: string) => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll('all');
      if (response.success) {
        const transformedOrders = (response.orders || []).map((order: any) => ({
          id: order.id,
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone
          },
          items: JSON.parse(order.items || '[]'),
          total: order.total_amount,
          status: order.status,
          createdAt: order.created_at
        }));
        
        // Filter orders by customer email
        const customerOrders = transformedOrders.filter(
          (order: Order) => order.customer.email.toLowerCase() === email.toLowerCase()
        );
        setOrders(customerOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      localStorage.setItem('customerEmail', searchEmail);
      setCustomerEmail(searchEmail);
      loadOrders(searchEmail);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerEmail');
    setCustomerEmail('');
    setOrders([]);
    setSearchEmail('');
  };

  if (!customerEmail) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Dashboard</h2>
              <p className="text-gray-600">Enter your email to view your orders</p>
            </div>
            
            <form onSubmit={handleEmailSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                View My Orders
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600">{customerEmail}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('orders')}
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            className={activeTab === 'orders' ? 'bg-indigo-600' : ''}
          >
            <Package className="h-4 w-4 mr-2" />
            My Orders ({orders.length})
          </Button>
          <Button
            onClick={() => setActiveTab('profile')}
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            className={activeTab === 'profile' ? 'bg-indigo-600' : ''}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600">You haven't placed any orders yet.</p>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <Badge className={order.status === 'paid' ? 'bg-green-600' : 'bg-yellow-600'}>
                          {order.status === 'paid' ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <span className="font-semibold text-indigo-600">
                          Total: ₹{order.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-gray-900">Items:</h4>
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product_title || item.title}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.price}</p>
                          {order.status === 'paid' && item.download_url && (
                            <a
                              href={item.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-1"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⏳ Your order is pending approval. Download links will be available once approved.
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4">
              {orders.length > 0 && (
                <>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{orders[0].customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{orders[0].customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{orders[0].customer.phone}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600">{orders.length}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {orders.filter(o => o.status === 'paid').length}
                        </p>
                        <p className="text-sm text-gray-600">Approved Orders</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
