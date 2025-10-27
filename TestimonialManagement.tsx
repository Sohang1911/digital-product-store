import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { testimonialsAPI } from '../../services/api';

interface Testimonial {
  id: number;
  customer_name: string;
  customer_image: string;
  rating: number;
  feedback: string;
  display_order: number;
  is_featured: boolean;
}

export function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerImage: '',
    rating: 5,
    feedback: '',
    displayOrder: 0,
    isFeatured: false
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await testimonialsAPI.getAll();
      if (response.success) {
        setTestimonials(response.testimonials || []);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      toast.error('Failed to load testimonials');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const testimonialData = {
        customerName: formData.customerName,
        customerImage: formData.customerImage,
        rating: formData.rating,
        feedback: formData.feedback,
        displayOrder: formData.displayOrder,
        isFeatured: formData.isFeatured
      };

      if (editingTestimonial) {
        await testimonialsAPI.update(editingTestimonial.id, testimonialData);
        toast.success('Testimonial updated successfully!');
      } else {
        await testimonialsAPI.create(testimonialData);
        toast.success('Testimonial added successfully!');
      }
      
      resetForm();
      loadTestimonials();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customerName: testimonial.customer_name,
      customerImage: testimonial.customer_image || '',
      rating: testimonial.rating,
      feedback: testimonial.feedback,
      displayOrder: testimonial.display_order,
      isFeatured: testimonial.is_featured
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await testimonialsAPI.delete(id);
        toast.success('Testimonial deleted successfully!');
        loadTestimonials();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete testimonial');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerImage: '',
      rating: 5,
      feedback: '',
      displayOrder: 0,
      isFeatured: false
    });
    setEditingTestimonial(null);
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Testimonials</h2>
          <p className="text-gray-600">Manage customer feedback and reviews</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(testimonial => (
          <Card key={testimonial.id} className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                {testimonial.customer_image ? (
                  <img
                    src={testimonial.customer_image}
                    alt={testimonial.customer_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-indigo-600 font-semibold text-lg">
                    {testimonial.customer_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{testimonial.customer_name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {testimonial.is_featured && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                  Featured
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              "{testimonial.feedback}"
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Order: {testimonial.display_order}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(testimonial)}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(testimonial.id)}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:border-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No testimonials found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open: boolean) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Customer Image URL (Optional)</label>
              <input
                type="url"
                value={formData.customerImage}
                onChange={(e) => setFormData({ ...formData, customerImage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                🖼️ Leave empty to use first letter avatar
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Feedback *</label>
              <textarea
                required
                rows={4}
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Share the customer's experience and feedback..."
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-indigo-600"
              />
              <label className="text-gray-700">Featured (highlight on homepage)</label>
            </div>

            <div className="flex gap-4">
              <Button type="button" onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
