import React, { useState, useEffect } from 'react';
import { Play, Star, ShoppingCart, Filter, X, Facebook, Twitter, Linkedin, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ProductModal } from './ProductModal';
import { productsAPI, demoVideosAPI, testimonialsAPI } from '../services/api';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  thumbnail: string;
  demoVideo: string;
}

interface HomePageProps {
  addToCart: (product: Product) => void;
  searchQuery: string;
  onNavigateToCart: () => void;
}

export function HomePage({ addToCart, searchQuery, onNavigateToCart }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [demoVideos, setDemoVideos] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  useEffect(() => {
    loadProducts();
    loadDemoVideos();
    loadTestimonials();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.success && response.products) {
        setProducts(response.products);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.warn('Products not loaded from backend:', error?.message || 'Network error');
      setProducts([]);
    }
  };

  const loadDemoVideos = async () => {
    try {
      const response = await demoVideosAPI.getAll();
      console.log('🎬 Demo Videos API Response:', response);
      if (response.success) {
        const videos = response.videos || [];
        console.log('📹 Total demo videos:', videos.length);
        videos.forEach((video: any, i: number) => {
          console.log(`Video ${i + 1}:`, {
            title: video.title,
            video_url: video.video_url,
            thumbnail: video.thumbnail,
            is_active: video.is_active
          });
        });
        setDemoVideos(videos);
      }
    } catch (error) {
      console.error('❌ Failed to load demo videos:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await testimonialsAPI.getAll();
      if (response.success) {
        setTestimonials(response.testimonials || []);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    }
  };

  const shareProduct = (product: Product, platform: 'whatsapp' | 'facebook' | 'twitter') => {
    const url = window.location.href;
    const text = `Check out this amazing product: ${product.title} - Only ₹${product.price}!`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    toast.success(`Sharing on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          // You can add a popularity field later, for now use price as proxy
          return b.price - a.price;
        case 'newest':
        default:
          return Number(b.id) - Number(a.id); // Higher ID = newer
      }
    });

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const faqs = [
    {
      question: 'How do I download the videos after purchase?',
      answer: 'After successful payment confirmation and admin approval, you will receive a secure download link via email. The link has lifetime validity - you can download anytime, forever!'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept payments via UPI, QR code scan. Simply scan the QR code displayed during checkout and confirm your payment.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Due to the digital nature of our products, we do not offer refunds. However, you can preview demo videos before purchasing.'
    },
    {
      question: 'How long are the videos?',
      answer: 'Video duration varies by product. Most story videos are between 5-15 minutes long, perfect for children\'s attention span.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! Contact us through the contact form or WhatsApp for bulk purchase inquiries and special discounts.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save contact form submission
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.push({
      ...contactForm,
      date: new Date().toISOString()
    });
    localStorage.setItem('contacts', JSON.stringify(contacts));
    setContactForm({ name: '', email: '', message: '' });
    alert('Thank you for your message! We will get back to you soon.');
  };

  const siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
  const whatsappNumber = siteSettings.whatsapp || '+919876543210';
  const supportEmail = siteSettings.email || 'support@digitalstore.com';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-gray-50 mb-4">Premium Hindi Story Videos</h1>
            <p className="text-gray-100 text-xl mb-8">
              Engaging, Educational, and Entertaining Digital Content for Children
            </p>
            <Button
              onClick={() => {
                const productsSection = document.getElementById('products');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900">Our Products</h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-4`}>
              {/* Sort Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-gray-900 mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₹{priceRange.min}</span>
                    <span>₹{priceRange.max}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Categories</h3>
                  {showFilters && (
                    <button onClick={() => setShowFilters(false)} className="md:hidden">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded transition ${
                        selectedCategory === category
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                      <div className="relative bg-gray-100">
                        <div className="w-full h-48 flex items-center justify-center overflow-hidden">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(product.title);
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-center p-4">
                              <p className="text-sm">No preview image</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition"
                        >
                          <Play className="h-12 w-12 text-white" />
                        </button>
                        
                        <Badge className="absolute top-2 right-2 bg-indigo-600">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-gray-900 mb-2">{product.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-indigo-600 text-xl font-bold">₹{product.price}</span>
                          <Button
                            onClick={() => addToCart(product)}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                        
                        {/* Social Share Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500 mr-1">Share:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareProduct(product, 'whatsapp');
                            }}
                            className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 transition"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareProduct(product, 'facebook');
                            }}
                            className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition"
                            title="Share on Facebook"
                          >
                            <Facebook className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareProduct(product, 'twitter');
                            }}
                            className="p-1.5 rounded-full bg-sky-50 hover:bg-sky-100 transition"
                            title="Share on Twitter"
                          >
                            <Twitter className="h-4 w-4 text-sky-600" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Videos Section */}
      {demoVideos.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-gray-900 text-center mb-4">Watch Demo Videos</h2>
            <p className="text-gray-600 text-center mb-12">See our products in action</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {demoVideos.map((video: any, index: number) => {
                const videoId = getVideoId(video.video_url);
                const isLocalVideo = video.video_url.startsWith('http://localhost') || video.video_url.startsWith('/uploads');
                
                // Get proper thumbnail URL
                let thumbnailUrl = '';
                if (video.thumbnail && video.thumbnail.trim() !== '') {
                  // Use uploaded/custom thumbnail
                  thumbnailUrl = video.thumbnail;
                  console.log('📸 Thumbnail for video:', video.title, '→', thumbnailUrl);
                } else if (videoId) {
                  // Use YouTube thumbnail for YouTube videos
                  thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                  console.log('📺 YouTube thumbnail for:', video.title, '→', thumbnailUrl);
                } else {
                  console.warn('⚠️ No thumbnail found for video:', video.title);
                }
                
                const isPlaying = playingVideo === index;
                
                return (
                  <Card key={video.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative group border-b border-gray-200" style={{ height: '400px' }}>
                      {isPlaying ? (
                        isLocalVideo ? (
                          <video
                            controls
                            autoPlay
                            className="w-full h-full object-contain bg-black"
                            controlsList="nodownload"
                          >
                            <source src={video.video_url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : videoId ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1`}
                            title="Demo Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            className="w-full h-full"
                          ></iframe>
                        ) : null
                      ) : (
                        <div 
                          className="relative w-full h-full cursor-pointer"
                          onClick={() => setPlayingVideo(index)}
                          style={{ background: 'white' }}
                        >
                          <img
                            src={thumbnailUrl || 'https://via.placeholder.com/640x360/4F46E5/ffffff?text=Click+to+Play'}
                            alt={video.title || 'Video thumbnail'}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              zIndex: 1,
                              backgroundColor: '#1a1a1a'
                            }}
                            onLoad={() => console.log('✅ Image displayed')}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/640x360/EF4444/ffffff?text=Failed+to+Load';
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            pointerEvents: 'none'
                          }}>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: 'rgba(220, 38, 38, 0.9)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}>
                              <Play className="h-10 w-10 text-white ml-1" fill="white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {video.title && (
                      <div className="p-3 bg-white">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</h3>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-gray-900 text-center mb-4">Real Results from Real Creators</h2>
          <p className="text-gray-600 text-center mb-12">See how our content helped YouTube channels grow exponentially 📊📈</p>
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.slice(0, 6).map((testimonial: any) => (
                <Card key={testimonial.id} className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {testimonial.customer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-gray-900">{testimonial.customer_name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i: number) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">"{testimonial.feedback}"</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No testimonials yet</p>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                >
                  <span className="text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-gray-900 text-center mb-12">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <a
                  href={`mailto:${supportEmail}`}
                  className="flex items-center text-gray-600 hover:text-indigo-600 transition"
                >
                  <Mail className="h-5 w-5 mr-3" />
                  {supportEmail}
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-green-600 transition"
                >
                  <MessageCircle className="h-5 w-5 mr-3" />
                  WhatsApp Support
                </a>
              </div>
              <div className="mt-8">
                <h4 className="text-gray-900 mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition">
                    <Twitter className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition">
                    <Linkedin className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Digital Store. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Premium Hindi Story Videos & Digital Products</p>
        </div>
      </footer>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => {
            addToCart(selectedProduct);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
