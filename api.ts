// API Service for connecting to backend
const API_URL = 'http://localhost:5001/api';

console.log('🔗 API Service initialized with URL:', API_URL);

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Invalid response type: ${contentType}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    // If there are validation errors, include them
    const error: any = new Error(data.message || `HTTP error! status: ${response.status}`);
    if (data.errors) {
      error.errors = data.errors;
    }
    throw error;
  }
  
  return data;
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const url = `${API_URL}/auth/login`;
    console.log('🔌 Login request to:', url);
    console.log('📦 Payload:', { username });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    console.log('📡 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    const result = await handleResponse(response);
    console.log('✅ Login result:', result);
    return result;
  },

  verifyToken: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  updatePassword: async (currentPassword: string, newPassword: string, newUsername?: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword, newUsername })
    });
    return handleResponse(response);
  }
};

// Products API
export const productsAPI = {
  getAll: async (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_URL}/products?${params}`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },

  create: async (productData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  update: async (id: string, productData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  getCategories: async () => {
    const response = await fetch(`${API_URL}/products/categories`);
    return handleResponse(response);
  }
};

// Orders API
export const ordersAPI = {
  create: async (orderData: any, paymentProof?: File) => {
    const formData = new FormData();
    formData.append('items', JSON.stringify(orderData.items));
    formData.append('customer', JSON.stringify(orderData.customer));
    formData.append('transactionId', orderData.transactionId);
    
    if (paymentProof) {
      formData.append('paymentProof', paymentProof);
    }

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(response);
  },

  getAll: async (status?: string) => {
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    
    const response = await fetch(`${API_URL}/orders?${params}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  approve: async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/orders/${id}/approve`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/orders/stats`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};

// Settings API
export const settingsAPI = {
  getPaymentSettings: async () => {
    const response = await fetch(`${API_URL}/settings/payment`);
    return handleResponse(response);
  },

  updatePaymentSettings: async (settingsData: any, qrCode?: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    
    Object.keys(settingsData).forEach(key => {
      if (settingsData[key]) {
        formData.append(key, settingsData[key]);
      }
    });
    
    if (qrCode) {
      formData.append('qrCode', qrCode);
    }

    const response = await fetch(`${API_URL}/settings/payment`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  getSiteSettings: async () => {
    const response = await fetch(`${API_URL}/settings/site`);
    return handleResponse(response);
  },

  updateSiteSettings: async (settingsData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/settings/site`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settingsData)
    });
    return handleResponse(response);
  }
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/analytics`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  trackVisitor: async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/track-visitor`, {
        method: 'POST'
      });
      if (!response.ok) {
        console.warn('Visitor tracking failed but continuing...');
      }
    } catch (error) {
      // Silently fail - not critical
      console.warn('Visitor tracking unavailable');
    }
  }
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 Uploading file:', file.name);
    
    const response = await fetch(`${API_URL}/upload/single`, {
      method: 'POST',
      body: formData
      // Don't set Content-Type - browser will set it with boundary
    });
    
    const result = await handleResponse(response);
    console.log('✅ Upload successful:', result);
    return result;
  }
};

// Demo Videos API
export const demoVideosAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/demo-videos`);
    return handleResponse(response);
  },

  create: async (videoData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/demo-videos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    });
    return handleResponse(response);
  },

  update: async (id: number, videoData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/demo-videos/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/demo-videos/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};

// Testimonials API
export const testimonialsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/testimonials`);
    return handleResponse(response);
  },

  create: async (testimonialData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/testimonials`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testimonialData)
    });
    return handleResponse(response);
  },

  update: async (id: number, testimonialData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/testimonials/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testimonialData)
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  settings: settingsAPI,
  analytics: analyticsAPI,
  upload: uploadAPI,
  demoVideos: demoVideosAPI,
  testimonials: testimonialsAPI
};
