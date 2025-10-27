import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Video } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { demoVideosAPI, uploadAPI } from '../../services/api';

interface DemoVideo {
  id: number;
  title: string;
  video_url: string;
  thumbnail: string;
  display_order: number;
  is_active: boolean;
}

export function DemoVideoManagement() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<DemoVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    thumbnail: '',
    displayOrder: 0,
    isActive: true,
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    videoType: 'youtube' as 'youtube' | 'upload'
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await demoVideosAPI.getAll();
      if (response.success) {
        setVideos(response.videos || []);
      }
    } catch (error) {
      console.error('Failed to load demo videos:', error);
      toast.error('Failed to load demo videos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let videoUrl = formData.videoUrl;
      let thumbnailUrl = formData.thumbnail;

      // Upload video file if selected
      if (formData.videoFile) {
        toast.info(`Uploading video: ${formData.videoFile.name}...`);
        const uploadResult = await uploadAPI.uploadFile(formData.videoFile);
        videoUrl = `http://localhost:5001${uploadResult.url}`;
        toast.success('Video uploaded successfully!');
      }

      // Upload thumbnail file if selected
      if (formData.thumbnailFile) {
        toast.info(`Uploading thumbnail...`);
        const uploadResult = await uploadAPI.uploadFile(formData.thumbnailFile);
        thumbnailUrl = `http://localhost:5001${uploadResult.url}`;
        toast.success('Thumbnail uploaded successfully!');
      }
      
      const videoData = {
        title: formData.title,
        videoUrl: videoUrl,
        thumbnail: thumbnailUrl,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive
      };

      if (editingVideo) {
        await demoVideosAPI.update(editingVideo.id, videoData);
        toast.success('Demo video updated successfully!');
      } else {
        await demoVideosAPI.create(videoData);
        toast.success('Demo video added successfully!');
      }
      
      resetForm();
      loadVideos();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save demo video');
    }
  };

  const handleEdit = (video: DemoVideo) => {
    setEditingVideo(video);
    const isYouTube = video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be');
    setFormData({
      title: video.title,
      videoUrl: video.video_url,
      thumbnail: video.thumbnail || '',
      displayOrder: video.display_order,
      isActive: video.is_active,
      videoFile: null,
      thumbnailFile: null,
      videoType: isYouTube ? 'youtube' : 'upload'
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this demo video?')) {
      try {
        await demoVideosAPI.delete(id);
        toast.success('Demo video deleted successfully!');
        loadVideos();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete demo video');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      videoUrl: '',
      thumbnail: '',
      displayOrder: 0,
      isActive: true,
      videoFile: null,
      thumbnailFile: null,
      videoType: 'youtube'
    });
    setEditingVideo(null);
    setShowDialog(false);
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demo Videos</h2>
          <p className="text-gray-600">Manage demo videos shown on homepage</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Demo Video
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => {
          const videoId = getVideoId(video.video_url);
          return (
            <Card key={video.id} className="overflow-hidden">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {videoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Order: {video.display_order}</span>
                  <span className={video.is_active ? 'text-green-600' : 'text-red-600'}>
                    {video.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(video)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(video.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No demo videos found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open: boolean) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? 'Edit Demo Video' : 'Add Demo Video'}
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
                placeholder="e.g., Product Demo 1"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Video Source *</label>
              <select
                value={formData.videoType}
                onChange={(e) => setFormData({ ...formData, videoType: e.target.value as 'youtube' | 'upload', videoUrl: '', videoFile: null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="youtube">📺 YouTube Video URL</option>
                <option value="upload">📤 Upload Video File</option>
              </select>
            </div>

            {formData.videoType === 'youtube' ? (
              <div>
                <label className="block text-gray-700 mb-2">YouTube Video URL *</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  📺 Paste YouTube video URL
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 mb-2">Upload Video File *</label>
                <input
                  type="file"
                  accept="video/*"
                  required={!editingVideo}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, videoFile: file });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formData.videoFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Selected: {formData.videoFile.name}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  🎬 Upload MP4, WebM, AVI, MOV, MKV or other video formats (max 2GB)
                  <br />
                  📐 Supports both 16:9 (landscape) and 9:16 (portrait/vertical) formats
                </p>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Thumbnail Image *</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, thumbnailFile: file, thumbnail: '' });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formData.thumbnailFile && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 mb-2">
                      ✅ Selected: {formData.thumbnailFile.name}
                    </p>
                    <img
                      src={URL.createObjectURL(formData.thumbnailFile)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  🖼️ Upload thumbnail image (JPG, PNG, WebP)
                  <br />
                  💡 Use same aspect ratio as your video (16:9 for landscape, 9:16 for portrait)
                </p>
              </div>
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
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600"
              />
              <label className="text-gray-700">Active (show on homepage)</label>
            </div>

            <div className="flex gap-4">
              <Button type="button" onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {editingVideo ? 'Update Video' : 'Add Video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
