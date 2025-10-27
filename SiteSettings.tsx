import { useState, useEffect } from 'react';
import { Save, Key } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';

export function SiteSettings() {
  const [settings, setSettings] = useState({
    whatsapp: '',
    email: '',
    instagram: '',
    facebook: ''
  });

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleChangePassword = () => {
    if (credentials.password !== credentials.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (credentials.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    localStorage.setItem('adminCredentials', JSON.stringify({
      username: credentials.username || 'Sohang',
      password: credentials.password
    }));

    setCredentials({ username: '', password: '', confirmPassword: '' });
    toast.success('Admin credentials updated successfully!');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Contact Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+919876543210"
            />
            <p className="text-gray-500 text-sm mt-1">Include country code (e.g., +91)</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Support Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="support@digitalstore.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Instagram Profile (Optional)</label>
            <input
              type="text"
              value={settings.instagram}
              onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="@yourusername"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Facebook Page (Optional)</label>
            <input
              type="text"
              value={settings.facebook}
              onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="facebook.com/yourpage"
            />
          </div>

          <Button
            onClick={handleSaveSettings}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Contact Settings
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Admin Credentials</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Leave empty to keep current username"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={credentials.confirmPassword}
              onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Key className="h-4 w-4 mr-2" />
            Update Credentials
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-gray-900 mb-2">Important Notes</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
          <li>All data is stored in browser's localStorage (demo purposes only)</li>
          <li>For production, integrate with a real backend and database</li>
          <li>Download links are generated but require actual file hosting</li>
          <li>Email sending requires integration with an email service</li>
          <li>Keep your admin credentials secure</li>
        </ul>
      </Card>
    </div>
  );
}
