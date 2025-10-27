import { X, ShoppingCart, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  thumbnail: string;
  demoVideo: string;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} - ${product.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const hasVideo = product.demoVideo && 
                  !product.demoVideo.startsWith('upload://') && 
                  product.demoVideo !== '';
  const isCustomVideo = hasVideo && product.demoVideo.startsWith('custom://');
  const videoUrl = isCustomVideo ? product.demoVideo.replace('custom://', '') : product.demoVideo;
  const videoId = hasVideo && !isCustomVideo ? getVideoId(videoUrl) : null;

  // Debug logging
  console.log('🖼️ ProductModal Debug:', {
    title: product.title,
    hasThumbnail: !!product.thumbnail,
    thumbnailValue: product.thumbnail,
    thumbnailLength: product.thumbnail?.length,
    hasVideo,
    videoId
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Image - SHOW IF EXISTS */}
          <div className="w-full bg-gray-50 rounded-lg p-4 border-2 border-indigo-200">
            <div className="relative bg-white rounded-lg" style={{ minHeight: '400px', maxHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.thumbnail && 
               product.thumbnail.trim() !== '' && 
               !product.thumbnail.startsWith('upload://') &&
               (product.thumbnail.startsWith('http://') || product.thumbnail.startsWith('https://')) ? (
                <img 
                  src={product.thumbnail} 
                  alt={product.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ display: 'block' }}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', product.thumbnail);
                    e.currentTarget.parentElement!.innerHTML = `
                      <div style="text-align: center; padding: 40px; color: #6b7280;">
                        <p style="font-size: 48px; margin-bottom: 10px;">🖼️</p>
                        <p style="font-size: 16px; font-weight: 600;">Image not available</p>
                        <p style="font-size: 12px; margin-top: 10px; color: #9ca3af;">URL: ${product.thumbnail}</p>
                      </div>
                    `;
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', product.thumbnail);
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <p style={{ fontSize: '48px', marginBottom: '10px' }}>📦</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>No image available</p>
                  {product.thumbnail && product.thumbnail.startsWith('upload://') && (
                    <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '10px' }}>
                      ⚠️ File was uploaded but not properly saved<br/>
                      Please edit product and add image URL
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Video Preview (if available) */}
          {hasVideo && videoId && (
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={product.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          {hasVideo && isCustomVideo && (
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-full"
                poster={product.thumbnail}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Product Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full text-sm">
                {product.category}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center text-gray-600 hover:text-indigo-600 transition"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>
            </div>
            
            <h3 className="text-gray-900 mb-3 font-semibold">Description</h3>
            <div className="text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
              {product.description}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-500 text-sm">Price</p>
                <p className="text-indigo-600">₹{product.price}</p>
              </div>
              <Button
                onClick={onAddToCart}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-4">What's Included:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                High-quality video content
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Instant download access after payment approval
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Lifetime access to downloaded content
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Professional invoice provided
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
