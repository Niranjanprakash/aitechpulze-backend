const express = require('express');
const path = require('path');
const fs = require('fs');
const { Project, ProjectFile } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get User Files
router.get('/my-files', auth, async (req, res) => {
  try {
    const files = await ProjectFile.findAll({
      include: [{
        model: Project,
        as: 'project',
        where: { user_id: req.user.id },
        attributes: ['project_id']
      }],
      order: [['uploaded_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        files: files.map(f => ({
          name: f.file_name,
          size: formatFileSize(f.file_size),
          date: new Date(f.uploaded_at).toLocaleDateString(),
          project: f.project?.project_id
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch files' });
  }
});

// Download File
router.get('/download/:fileName', auth, async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Verify user owns this file
    const [files] = await db.execute(
      `SELECT pf.file_path 
       FROM project_files pf
       LEFT JOIN projects p ON pf.project_id = p.id
       WHERE pf.file_name = ? AND p.user_id = ?`,
      [fileName, req.user.id]
    );

    if (files.length === 0) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = files[0].file_path;
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, fileName);
    } else {
      res.status(404).json({ success: false, message: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Download failed' });
  }
});

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;