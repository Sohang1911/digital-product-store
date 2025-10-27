import React, { useState, useEffect } from 'react';
import { CheckCircle, Upload, AlertCircle, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { ordersAPI } from '../services/api';

interface CheckoutProps {
  items: any[];
  total: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function Checkout({ items, total, onSuccess, onCancel }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentProof, setPaymentProof] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState(null as File | null);
  const [transactionId, setTransactionId] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const qrCode = localStorage.getItem('qrCode') || '';
  const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');

  const handleCustomerInfoSubmit = (e: any) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentProofUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = async () => {
    if (!transactionId) {
      toast.error('Please enter transaction ID');
      return;
    }

    if (!paymentProof || !paymentProofFile) {
      toast.error('Please upload payment proof screenshot');
      return;
    }

    try {
      console.log('📦 Creating order with data:', {
        items,
        customer: customerInfo,
        transactionId,
        hasFile: !!paymentProofFile
      });

      const orderData = {
        items,
        customer: customerInfo,
        transactionId
      };

      const response = await ordersAPI.create(orderData, paymentProofFile);

      if (response.success) {
        toast.success('Order placed successfully! Waiting for admin approval.');
        setStep(3);
      }
    } catch (error: any) {
      console.error('❌ Order creation error:', error);
      
      // Show detailed error if available
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(error.message || 'Failed to place order');
      }
    }
  };

  const handleComplete = () => {
    onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2">Customer Info</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2">Payment</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="ml-2">Complete</span>
          </div>
        </div>
      </div>

      {/* Step 1: Customer Information */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-gray-900 mb-6">Customer Information</h2>
          <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-sm text-blue-600 mt-1">
                📧 Invoice and order updates will be sent to this email
              </p>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="Enter WhatsApp number with country code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-sm text-green-600 mt-1">
                📱 Bundle access link will be sent to this WhatsApp number
              </p>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 mt-6">
              <h3 className="text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span>{item.title} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between text-gray-900">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Continue to Payment
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-gray-900 mb-6">Payment Details</h2>
            
            <div className="mb-6">
              <h3 className="text-gray-900 mb-4">Scan QR Code to Pay</h3>
              {qrCode ? (
                <div className="flex justify-center">
                  <img src={qrCode} alt="Payment QR Code" className="max-w-xs rounded-lg shadow-md" />
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-yellow-800">No payment QR code configured.</p>
                    <p className="text-yellow-600 text-sm">Please contact admin for payment details.</p>
                  </div>
                </div>
              )}

              {paymentDetails.upiId && (
                <div className="mt-4 text-center">
                  <p className="text-gray-600">UPI ID: <span className="text-gray-900">{paymentDetails.upiId}</span></p>
                </div>
              )}

              {paymentDetails.accountNumber && (
                <div className="mt-4 space-y-1 text-center">
                  <p className="text-gray-600">Account Number: <span className="text-gray-900">{paymentDetails.accountNumber}</span></p>
                  <p className="text-gray-600">IFSC Code: <span className="text-gray-900">{paymentDetails.ifscCode}</span></p>
                  <p className="text-gray-600">Account Holder: <span className="text-gray-900">{paymentDetails.accountHolder}</span></p>
                </div>
              )}
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Transaction ID / UTR Number *</label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Payment Proof (Screenshot Required) *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofUpload}
                    className="hidden"
                    id="payment-proof"
                  />
                  <label htmlFor="payment-proof" className="cursor-pointer">
                    {paymentProof ? (
                      <img src={paymentProof} alt="Payment Proof" className="max-w-xs mx-auto rounded" />
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload screenshot</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm mb-2">
                  ✅ After payment confirmation, your order will be reviewed by admin.
                </p>
                <p className="text-blue-800 text-sm">
                  📧 Invoice will be automatically sent to your email<br/>
                  📱 Bundle access link will be shared on your WhatsApp number
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleConfirmPayment} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Confirm Payment
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase! Your order is being reviewed by our admin.
              You will receive an email with download link and invoice once your payment is verified.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-600 text-sm">
                Order confirmation and download link will be sent to:
              </p>
              <p className="text-gray-900">{customerInfo.email}</p>
            </div>
          </Card>

          {/* Feedback Section */}
          {!showFeedback ? (
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Help us improve! 💬</h3>
              <p className="text-gray-600 mb-4">
                Would you like to share your shopping experience?
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowFeedback(true)} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  ⭐ Give Feedback
                </Button>
                <Button 
                  onClick={handleComplete} 
                  variant="outline" 
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Share Your Experience ⭐</h3>
              
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rate your experience</label>
                <div className="flex gap-2 justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`h-8 w-8 ${
                          star <= rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600">
                    {rating === 5 && '🎉 Excellent!'}
                    {rating === 4 && '😊 Great!'}
                    {rating === 3 && '👍 Good'}
                    {rating === 2 && '😐 Fair'}
                    {rating === 1 && '😞 Poor'}
                  </p>
                )}
              </div>

              {/* Feedback Text */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your feedback (optional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    if (rating > 0) {
                      // Save feedback to localStorage
                      const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
                      feedbacks.push({
                        rating,
                        feedback,
                        customerName: customerInfo.name,
                        date: new Date().toISOString()
                      });
                      localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
                      toast.success('Thank you for your valuable feedback! 🙏');
                      handleComplete();
                    } else {
                      toast.error('Please select a rating');
                    }
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit Feedback
                </Button>
                <Button 
                  onClick={handleComplete} 
                  variant="outline" 
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
