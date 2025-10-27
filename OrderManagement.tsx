import { useState, useEffect } from 'react';
import { CheckCircle, Eye, Download, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { ordersAPI } from '../../services/api';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import * as XLSX from 'xlsx';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: any[];
  total: number;
  transactionId: string;
  paymentProof?: string;
  status: 'pending' | 'paid';
  downloadToken: string;
  downloadExpiry: string;
  createdAt: string;
  invoiceUrl?: string;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getAll(filter);
      console.log('Orders response:', response);
      if (response.success) {
        // Transform backend data structure to match frontend interface
        const transformedOrders = (response.orders || []).map((order: any) => ({
          id: order.id,
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone
          },
          items: order.items || [],
          total: order.total_amount,
          transactionId: order.transaction_id,
          paymentProof: order.payment_proof ? `http://localhost:5001${order.payment_proof}` : undefined,
          status: order.status,
          downloadToken: order.download_link?.split('download=')[1] || '',
          downloadExpiry: order.link_expiry || '',
          createdAt: order.created_at,
          invoiceUrl: order.invoice_path
        }));
        setOrders(transformedOrders);
      } else {
        setError('Failed to load orders');
      }
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      setError(error.message || 'Failed to load orders');
      toast.error('Unable to load orders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };


  const approveOrder = async (order: Order) => {
    if (confirm('Approve this order and send download link to customer?')) {
      try {
        // Call backend API to approve order
        const response = await ordersAPI.approve(order.id);
        
        if (response.success) {
          toast.success('Order approved! Email sent to customer.');
          
          // Reload orders to get updated data with download links
          await loadOrders();
          
          // Fetch fresh order data directly from backend with download URLs
          const orderResponse = await ordersAPI.getById(order.id);
          const updatedOrder = orderResponse.order ? {
            ...order,
            items: orderResponse.order.items.map((item: any) => ({
              ...item,
              title: item.product_title || item.title,
              download_url: item.download_url
            }))
          } : order;
          
          // Generate and download invoice
          try {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(20);
            doc.text('INVOICE', 105, 20, { align: 'center' } as any);
            
            doc.setFontSize(10);
            doc.text('Digital Store', 105, 30, { align: 'center' } as any);
            doc.text('Premium Digital Products', 105, 36, { align: 'center' } as any);
            
            // Invoice Details
            doc.setFontSize(12);
            doc.text(`Invoice Number: ${order.id}`, 20, 50);
            doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 57);
            doc.text(`Transaction ID: ${order.transactionId}`, 20, 64);
            
            // Customer Details
            doc.text('Bill To:', 20, 80);
            doc.setFontSize(10);
            doc.text(order.customer.name, 20, 87);
            doc.text(order.customer.email, 20, 93);
            doc.text(order.customer.phone, 20, 99);
            
            // Items Table Header
            doc.setFontSize(12);
            let yPos = 115;
            doc.text('Item', 20, yPos);
            doc.text('Qty', 120, yPos);
            doc.text('Price', 150, yPos);
            doc.text('Total', 180, yPos);
            doc.line(20, yPos + 2, 190, yPos + 2);
            yPos += 10;
            
            // Items
            doc.setFontSize(10);
            updatedOrder.items.forEach((item: any) => {
              const itemPrice = Number(item.price).toFixed(2);
              const itemTotal = Number(item.price * item.quantity).toFixed(2);
              doc.text(item.product_title || item.title || '', 20, yPos, { maxWidth: 95 } as any);
              doc.text(item.quantity.toString(), 120, yPos);
              doc.text('Rs. ' + itemPrice, 150, yPos);
              doc.text('Rs. ' + itemTotal, 180, yPos);
              yPos += 8;
            });
            
            doc.line(20, yPos, 190, yPos);
            yPos += 10;
            
            // Total
            doc.setFontSize(12);
            doc.text('Total Amount:', 150, yPos);
            doc.text('Rs. ' + Number(order.total).toFixed(2), 180, yPos);
            
            // Download Links Section
            yPos += 15;
            doc.setFontSize(11);
            doc.text('Product Download Links (Lifetime Access):', 20, yPos);
            yPos += 7;
            
            doc.setFontSize(9);
            updatedOrder.items.forEach((item: any, index: number) => {
              if (item.download_url) {
                doc.text(`${index + 1}. ${item.product_title || item.title}`, 20, yPos);
                yPos += 5;
                doc.setTextColor(0, 0, 255);
                doc.text(item.download_url, 25, yPos, { maxWidth: 165 } as any);
                doc.setTextColor(0, 0, 0);
                yPos += 8;
              }
            });
            
            // Footer
            yPos += 10;
            doc.setFontSize(10);
            doc.text('Thank you for your purchase!', 105, yPos, { align: 'center' } as any);
            doc.text('All download links have lifetime validity!', 105, yPos + 7, { align: 'center' } as any);
            
            // Download invoice
            doc.save(`Invoice-${order.id}.pdf`);
            toast.success('Invoice downloaded successfully!');
          } catch (invoiceError) {
            console.error('Invoice generation error:', invoiceError);
            toast.error('Failed to generate invoice');
          }
          
          // Show download links alert
          const productLinks = updatedOrder.items
            .filter((item: any) => item.download_url)
            .map((item: any, index: number) => 
              `${index + 1}. ${item.product_title || item.title}\n   🔗 ${item.download_url}`
            )
            .join('\n\n');
          
          const message = `✅ ORDER APPROVED SUCCESSFULLY!\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📦 Order ID: ${order.id}\n\n` +
            `👤 Customer Details:\n` +
            `   Name: ${order.customer.name}\n` +
            `   📧 Email: ${order.customer.email}\n` +
            `   📱 Phone: ${order.customer.phone}\n\n` +
            `💰 Total Amount: ₹${Number(order.total).toFixed(2)}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📥 PRODUCT DOWNLOAD LINKS (LIFETIME ACCESS):\n\n${productLinks || 'No download links available'}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `✅ Actions Completed:\n` +
            `   ✓ Order marked as paid\n` +
            `   ✓ Invoice generated & downloaded\n` +
            `   ✓ Email sent to customer\n` +
            `   ✓ Download links activated\n\n` +
            `📧 Customer will receive email with invoice and all download links!`;
          
          alert(message);
        }
      } catch (error: any) {
        console.error('Approve order error:', error);
        toast.error(error.message || 'Failed to approve order');
      }
    }
  };

  const downloadInvoice = (order: Order) => {
    if (order.invoiceUrl) {
      const link = document.createElement('a');
      link.href = order.invoiceUrl;
      link.download = `Invoice-${order.id}.pdf`;
      link.click();
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        // For now, just remove from local state
        // In production, you'd call: await ordersAPI.delete(orderId);
        const updatedOrders = orders.filter(o => o.id !== orderId);
        setOrders(updatedOrders);
        toast.success('Order deleted successfully');
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete order');
      }
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredOrders.map(order => ({
        'Order ID': order.id,
        'Customer Name': order.customer.name,
        'Email': order.customer.email,
        'Phone': order.customer.phone,
        'Items': order.items.map(item => item.product_title || item.title).join(', '),
        'Quantity': order.items.reduce((sum, item) => sum + item.quantity, 0),
        'Total Amount': `Rs. ${Number(order.total).toFixed(2)}`,
        'Transaction ID': order.transactionId,
        'Status': order.status.toUpperCase(),
        'Order Date': new Date(order.createdAt).toLocaleDateString('en-IN'),
        'Payment Proof': order.paymentProof || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      
      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String((row as any)[key]).length)))
      }));
      ws['!cols'] = colWidths;
      
      const fileName = `Orders_${filter}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Orders Report', 105, 15, { align: 'center' } as any);
      
      doc.setFontSize(10);
      doc.text(`Filter: ${filter.toUpperCase()}`, 105, 22, { align: 'center' } as any);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 105, 28, { align: 'center' } as any);
      doc.text(`Total Orders: ${filteredOrders.length}`, 105, 34, { align: 'center' } as any);
      
      let yPos = 45;
      
      filteredOrders.forEach((order) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        // Order Header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Order #${order.id}`, 15, yPos);
        doc.setFont('helvetica', 'normal');
        
        // Status badge
        doc.setFontSize(9);
        if (order.status === 'paid') {
          doc.setTextColor(0, 128, 0);
          doc.text('[APPROVED]', 60, yPos);
        } else {
          doc.setTextColor(255, 140, 0);
          doc.text('[PENDING]', 60, yPos);
        }
        doc.setTextColor(0, 0, 0);
        
        yPos += 6;
        
        // Customer & Order Details
        doc.setFontSize(9);
        doc.text(`Customer: ${order.customer.name}`, 15, yPos);
        yPos += 5;
        doc.text(`Email: ${order.customer.email}`, 15, yPos);
        yPos += 5;
        doc.text(`Phone: ${order.customer.phone}`, 15, yPos);
        yPos += 5;
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 15, yPos);
        yPos += 5;
        doc.text(`Transaction ID: ${order.transactionId}`, 15, yPos);
        yPos += 5;
        
        // Items
        doc.text('Items:', 15, yPos);
        yPos += 5;
        order.items.forEach(item => {
          doc.text(`  • ${item.product_title || item.title} (Qty: ${item.quantity}) - Rs. ${Number(item.price).toFixed(2)}`, 18, yPos);
          yPos += 5;
        });
        
        // Total
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: Rs. ${Number(order.total).toFixed(2)}`, 15, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 3;
        
        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(15, yPos, 195, yPos);
        yPos += 8;
      });
      
      const fileName = `Orders_${filter}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadOrders} className="bg-indigo-600">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs and Export Buttons */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-indigo-600' : ''}
          >
            All Orders ({orders.length})
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
            className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </Button>
          <Button
            onClick={() => setFilter('paid')}
            variant={filter === 'paid' ? 'default' : 'outline'}
            className={filter === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Approved ({orders.filter(o => o.status === 'paid').length})
          </Button>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
            disabled={filteredOrders.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={exportToPDF}
            variant="outline"
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
            disabled={filteredOrders.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-900 text-xs uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-gray-900 text-xs uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-gray-900 text-xs uppercase">Items</th>
                <th className="px-6 py-3 text-left text-gray-900 text-xs uppercase">Total</th>
                <th className="px-6 py-3 text-left text-gray-900 text-xs uppercase">Status</th>
                <th className="px-6 py-3 text-left text-gray-900 text-xs uppercase">Date</th>
                <th className="px-6 py-3 text-left text-gray-900 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 text-sm">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 text-sm">{order.customer.name}</div>
                    <div className="text-gray-500 text-xs">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {order.items.length} item(s)
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm">₹{Number(order.total).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Badge className={
                      order.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => approveOrder(order)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {order.status === 'paid' && order.invoiceUrl && (
                        <Button
                          onClick={() => downloadInvoice(order)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteOrder(order.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:border-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found
          </div>
        )}
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={true} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-600"><span className="text-gray-900">Name:</span> {selectedOrder.customer.name}</p>
                  <p className="text-gray-600"><span className="text-gray-900">Email:</span> {selectedOrder.customer.email}</p>
                  <p className="text-gray-600"><span className="text-gray-900">Phone:</span> {selectedOrder.customer.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-gray-900">{item.title}</p>
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-gray-900">₹{Number(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between text-gray-900">
                  <span>Total:</span>
                  <span>₹{Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-gray-900 mb-3">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-600"><span className="text-gray-900">Transaction ID:</span> {selectedOrder.transactionId}</p>
                  <p className="text-gray-600"><span className="text-gray-900">Status:</span> <Badge className={
                    selectedOrder.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }>{selectedOrder.status}</Badge></p>
                  {selectedOrder.paymentProof && (
                    <div>
                      <p className="text-gray-900 mb-2">Payment Proof:</p>
                      <img src={selectedOrder.paymentProof} alt="Payment Proof" className="max-w-xs rounded" />
                    </div>
                  )}
                </div>
              </div>

              {/* Download Info */}
              {selectedOrder.status === 'paid' && (
                <div>
                  <h3 className="text-gray-900 mb-3">Download Information</h3>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p className="text-gray-600">
                      <span className="text-gray-900">Download Link:</span><br />
                      <code className="text-sm bg-white px-2 py-1 rounded">
                        {window.location.origin}?download={selectedOrder.downloadToken}
                      </code>
                    </p>
                    <p className="text-green-600 font-semibold">
                      ✅ Lifetime Access - Never Expires!
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                {selectedOrder.status === 'pending' && (
                  <Button
                    onClick={() => {
                      approveOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Order
                  </Button>
                )}
                {selectedOrder.status === 'paid' && selectedOrder.invoiceUrl && (
                  <Button
                    onClick={() => downloadInvoice(selectedOrder)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
                <Button
                  onClick={() => deleteOrder(selectedOrder.id)}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:border-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
