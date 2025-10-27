import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Upload, Download, CheckSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { productsAPI, uploadAPI } from '../../services/api';
// @ts-ignore
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  thumbnail: string;
  demoVideo: string;
  downloadLink: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState([] as Product[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null as Product | null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: '',
    description: '',
    price: 0,
    thumbnail: '', // Default to skip
    demoVideo: '', // Default to skip
    downloadLink: '',
    demoVideoFile: null as File | null,
    thumbnailFile: null as File | null
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.success) {
        // Map backend fields to frontend interface
        const mappedProducts = (response.products || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          price: p.price,
          thumbnail: p.thumbnail || '',
          demoVideo: p.demo_video || '',
          downloadLink: p.download_url || '' // Map download_url to downloadLink
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    }
  };

  // Remove saveProducts function - using API directly

  const generateDescription = (title: string, category: string) => {
    // Category-specific descriptions
    const categoryIntros: { [key: string]: string } = {
      'hindi': `🎬 ${title} - Premium Hindi content ka complete collection! Professional quality videos ke saath unlimited entertainment aur knowledge.`,
      'educational': `📚 ${title} - Complete educational package with expertly curated content to boost your learning and skills.`,
      'entertainment': `🎥 ${title} - Ultimate entertainment package with premium quality content for unlimited fun and enjoyment.`,
      'stories': `📖 ${title} - Captivating stories collection that will keep you engaged for hours with high-quality narration.`,
      'default': `✨ ${title} - Premium ${category} collection with professionally crafted content for the best experience.`
    };
    
    // Check which category matches (case insensitive)
    const categoryKey = Object.keys(categoryIntros).find(key => 
      category.toLowerCase().includes(key)
    ) || 'default';
    
    const intro = categoryIntros[categoryKey];
    
    const whatsIncluded = `\n\nWhat's Included:\n✓ High-quality video content\n✓ Instant download access after payment approval\n✓ Lifetime access to downloaded content\n✓ Professional invoice provided\n✓ 24/7 download availability\n✓ No expiry date - yours forever\n\n🎯 Perfect for anyone looking to enhance their experience. Download immediately after approval and start enjoying today!\n\n💎 Premium Quality | 🚀 Instant Access | ♾️ Lifetime Validity`;
    
    return intro + whatsIncluded;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    try {
      let thumbnailUrl = formData.thumbnail;
      let demoVideoUrl = formData.demoVideo;
      
      // Upload thumbnail if file selected
      if (formData.thumbnailFile) {
        toast.info(`Uploading image: ${formData.thumbnailFile.name}...`);
        const uploadResult = await uploadAPI.uploadFile(formData.thumbnailFile);
        thumbnailUrl = `http://localhost:5001${uploadResult.url}`;
        toast.success('Image uploaded successfully!');
      }
      
      // Upload demo video if file selected
      if (formData.demoVideoFile) {
        toast.info(`Uploading video: ${formData.demoVideoFile.name}...`);
        const uploadResult = await uploadAPI.uploadFile(formData.demoVideoFile);
        demoVideoUrl = `http://localhost:5001${uploadResult.url}`;
        toast.success('Video uploaded successfully!');
      }
      
      // Prepare product data with actual URLs
      const productData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        thumbnail: thumbnailUrl.replace('upload://', ''),
        demoVideo: demoVideoUrl.replace('upload://', ''),
        downloadUrl: formData.downloadLink // Backend expects downloadUrl
      };
      
      if (editingProduct) {
        // Update existing product
        await productsAPI.update(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        // Add new product
        await productsAPI.create(productData);
        toast.success('Product added successfully!');
      }
      
      resetForm();
      loadProducts(); // Reload products from server
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Ensure proper data format for editing - all fields must have defined values
    setFormData({
      id: product.id || '',
      title: product.title || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || 0,
      thumbnail: product.thumbnail || '',
      demoVideo: product.demoVideo || '',
      downloadLink: product.downloadLink || '',
      demoVideoFile: null,
      thumbnailFile: null
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        toast.success('Product deleted successfully!');
        loadProducts(); // Reload products from server
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      category: '',
      description: '',
      price: 0,
      thumbnail: '', // Default to skip
      demoVideo: '', // Default to skip
      downloadLink: '',
      demoVideoFile: null,
      thumbnailFile: null
    });
    setEditingProduct(null);
    setShowDialog(false);
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              ) : (
                <Package className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{product.title}</h3>
                  <span className="text-indigo-600 text-sm">{product.category}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-900">₹{product.price}</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(product)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={showDialog} onOpenChange={(open: boolean) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Hindi Stories, Educational"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={8}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Click 'Auto Generate' to create description automatically..."
              />
              <Button
                type="button"
                onClick={() => {
                  if (!formData.title || !formData.category) {
                    toast.error('Please enter Title and Category first');
                    return;
                  }
                  const autoDesc = generateDescription(formData.title, formData.category);
                  setFormData({ ...formData, description: autoDesc });
                  toast.success('Description generated automatically!');
                }}
                variant="outline"
                className="mt-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-700"
              >
                ✨ Auto Generate Description
              </Button>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Demo Video (Optional)</label>
              <div className="space-y-2">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={
                    !formData.demoVideo || formData.demoVideo === '' ? 'none' :
                    formData.demoVideo.startsWith('upload://') ? 'upload' : 
                    formData.demoVideo.startsWith('custom://') ? 'custom' : 
                    'youtube'
                  }
                  onChange={(e) => {
                    const type = e.target.value;
                    if (type === 'none') {
                      setFormData({ ...formData, demoVideo: '', demoVideoFile: null });
                    } else if (type === 'youtube') {
                      setFormData({ ...formData, demoVideo: 'https://' });
                    } else if (type === 'custom') {
                      setFormData({ ...formData, demoVideo: 'custom://' });
                    } else if (type === 'upload') {
                      setFormData({ ...formData, demoVideo: 'upload://' });
                    }
                  }}
                >
                  <option value="none">⏭️ Skip Demo Video</option>
                  <option value="upload">📤 Upload Video from Computer</option>
                  <option value="youtube">📺 YouTube Link</option>
                  <option value="custom">💾 Drive/Dropbox Link</option>
                </select>
                
                {formData.demoVideo.startsWith('upload://') ? (
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Store file temporarily
                          setFormData({ ...formData, demoVideo: `upload://${file.name}`, demoVideoFile: file });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      🎬 Upload MP4, AVI, MOV, or any video format (max 500MB)
                    </p>
                    {formData.demoVideoFile && (
                      <p className="text-sm text-green-600 mt-1">
                        ✅ Selected: {formData.demoVideoFile.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.demoVideo.replace('custom://', '')}
                      onChange={(e) => {
                        const prefix = formData.demoVideo.startsWith('custom://') ? 'custom://' : '';
                        setFormData({ ...formData, demoVideo: prefix + e.target.value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={
                        formData.demoVideo.startsWith('custom://') 
                          ? 'https://drive.google.com/file/d/...' 
                          : 'https://youtube.com/watch?v=...'
                      }
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.demoVideo.startsWith('custom://') 
                        ? '💡 Direct video link from Drive/Dropbox'
                        : '📺 YouTube video link'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Thumbnail Image (Optional)</label>
              <div className="space-y-2">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={
                    !formData.thumbnail || formData.thumbnail === '' ? 'none' :
                    formData.thumbnail.startsWith('upload://') ? 'upload' : 
                    'url'
                  }
                  onChange={(e) => {
                    if (e.target.value === 'none') {
                      setFormData({ ...formData, thumbnail: '', thumbnailFile: null });
                    } else if (e.target.value === 'upload') {
                      setFormData({ ...formData, thumbnail: 'upload://' });
                    } else {
                      setFormData({ ...formData, thumbnail: 'https://' });
                    }
                  }}
                >
                  <option value="none">⏭️ Skip Thumbnail</option>
                  <option value="upload">📤 Upload Image from Computer</option>
                  <option value="url">🔗 Image URL</option>
                </select>
                
                {formData.thumbnail.startsWith('upload://') ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, thumbnail: `upload://${file.name}`, thumbnailFile: file });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      🖼️ Upload JPG, PNG, or WEBP (max 5MB)
                    </p>
                    {formData.thumbnailFile && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 mb-2">
                          ✅ Selected: {formData.thumbnailFile.name}
                        </p>
                        <div className="border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                          <img
                            src={URL.createObjectURL(formData.thumbnailFile)}
                            alt="Preview"
                            className="w-full h-48 object-contain rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : formData.thumbnail && formData.thumbnail.startsWith('http') ? (
                  <div>
                    <input
                      type="url"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      🖼️ Image URL for product thumbnail
                    </p>
                    {formData.thumbnail && (
                      <div className="mt-3 border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img
                          src={formData.thumbnail}
                          alt="Preview"
                          className="w-full h-48 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50" font-size="14">Image not found</text></svg>';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Download Link (Full Product) *</label>
              <input
                type="url"
                required
                value={formData.downloadLink}
                onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://drive.google.com/file/d/..."
              />
              <p className="text-sm text-gray-500 mt-1">
                💡 This link will be sent to customers after payment approval
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="button" onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
