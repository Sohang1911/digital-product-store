import { useState, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';

export function PaymentSettings() {
  const [qrCode, setQrCode] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    accountNumber: '',
    ifscCode: '',
    accountHolder: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedQR = localStorage.getItem('qrCode');
    if (savedQR) setQrCode(savedQR);

    const savedDetails = localStorage.getItem('paymentDetails');
    if (savedDetails) setPaymentDetails(JSON.parse(savedDetails));
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setQrCode(dataUrl);
        localStorage.setItem('qrCode', dataUrl);
        toast.success('QR code uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDetails = () => {
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
    toast.success('Payment details saved successfully!');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">QR Code Payment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Upload QR Code</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="hidden"
                id="qr-upload"
              />
              <label htmlFor="qr-upload" className="cursor-pointer">
                {qrCode ? (
                  <img src={qrCode} alt="Payment QR Code" className="max-w-xs mx-auto rounded" />
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload QR code image</p>
                    <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Payment Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">UPI ID</label>
            <input
              type="text"
              value={paymentDetails.upiId}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="yourname@upi"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-gray-900 mb-4">Bank Account Details (Optional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={paymentDetails.accountHolder}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, accountHolder: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={paymentDetails.accountNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={paymentDetails.ifscCode}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, ifscCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveDetails}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Payment Details
          </Button>
        </div>
      </Card>
    </div>
  );
}
