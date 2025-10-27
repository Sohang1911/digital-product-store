import db from '../database/db.js';

export const getAllDemoVideos = async (req, res) => {
  try {
    const [videos] = await db.query(
      'SELECT * FROM demo_videos WHERE is_active = true ORDER BY display_order ASC, created_at DESC'
    );

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Get demo videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching demo videos'
    });
  }
};

export const createDemoVideo = async (req, res) => {
  try {
    const { title, videoUrl, thumbnail, displayOrder } = req.body;

    const [result] = await db.query(
      'INSERT INTO demo_videos (title, video_url, thumbnail, display_order) VALUES (?, ?, ?, ?)',
      [title, videoUrl, thumbnail || '', displayOrder || 0]
    );

    const [videos] = await db.query('SELECT * FROM demo_videos WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Demo video created successfully',
      video: videos[0]
    });
  } catch (error) {
    console.error('Create demo video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating demo video'
    });
  }
};

export const updateDemoVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, thumbnail, displayOrder, isActive } = req.body;

    await db.query(
      'UPDATE demo_videos SET title = ?, video_url = ?, thumbnail = ?, display_order = ?, is_active = ? WHERE id = ?',
      [title, videoUrl, thumbnail, displayOrder, isActive, id]
    );

    const [videos] = await db.query('SELECT * FROM demo_videos WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Demo video updated successfully',
      video: videos[0]
    });
  } catch (error) {
    console.error('Update demo video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating demo video'
    });
  }
};

export const deleteDemoVideo = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM demo_videos WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Demo video deleted successfully'
    });
  } catch (error) {
    console.error('Delete demo video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting demo video'
    });
  }
};
