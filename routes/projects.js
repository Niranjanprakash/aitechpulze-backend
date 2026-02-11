const express = require('express');
const multer = require('multer');
const path = require('path');
const { User, Project } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { sendWhatsApp } = require('../utils/whatsapp');
const { sendSMS } = require('../utils/sms');
const { logActivity } = require('../utils/logger');

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: process.env.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.pdf', '.doc', '.docx'].includes(ext));
  }
});

const calculateAmount = (domain, technology, projectType) => {
  let amount = 3500;
  
  const domainMultipliers = { 'AI/ML': 1.5, 'Data Science': 1.4, 'Full Stack': 1.2 };
  const techMultipliers = { 'Python': 1.2, 'TensorFlow': 1.4, 'React': 1.1 };
  
  amount *= (domainMultipliers[domain] || 1.0);
  amount *= (techMultipliers[technology] || 1.0);
  
  return projectType === 'SOFTWARE' ? Math.min(Math.round(amount), 5500) : Math.round(amount);
};

// Admin: Get all projects
router.get('/all', adminAuth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        projects: projects.map(p => ({
          ...p.toJSON(),
          status: p.status || 'PENDING',
          progress: getProgressPercentage(p.status)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

router.post('/estimate', auth, (req, res) => {
  const { domain, technology, projectType } = req.body;
  const estimatedAmount = calculateAmount(domain, technology, projectType);
  res.json({ estimatedAmount });
});

// Create Project with comprehensive notifications
router.post('/', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { projectTitle, projectDescription, domain, technologyStack, deadline, additionalRequirements } = req.body;
    const projectId = 'ATP' + Date.now().toString().slice(-8);
    const projectType = domain === 'Hardware Integration' ? 'HARDWARE' : 'SOFTWARE';
    const estimatedAmount = calculateAmount(domain, technologyStack || 'General', projectType);
    
    const project = await Project.create({
      user_id: req.user.id,
      project_id: projectId,
      domain: domain,
      technology: technologyStack || 'General',
      project_type: projectType,
      title: projectTitle,
      description: projectDescription,
      estimated_amount: estimatedAmount
    });

    if (req.files && req.files.length > 0) {
      const { ProjectFile } = require('../models');
      for (const file of req.files) {
        await ProjectFile.create({
          project_id: project.id,
          file_name: file.originalname,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size
        });
      }
    }

    // Send notifications to user
    const userMessage = `🎉 Project Request Submitted!

Hi ${req.user.name}!

Your project request has been successfully submitted:

📋 Project: ${projectTitle}
🆔 Project ID: ${projectId}
💰 Estimated Amount: ₹${estimatedAmount}

We will message you soon on WhatsApp with project details and next steps.

Thank you for choosing AI Tech Pulze! 🚀`;

    // Send to user via all channels
    if (req.user.phone) {
      await sendWhatsApp(req.user.phone, userMessage);
      await sendSMS(req.user.phone, userMessage);
    }
    await sendEmail(req.user.email, '🎉 Project Request Submitted - AI Tech Pulze', userMessage);

    // Send admin notifications
    const adminMessage = `🔔 New Project Request!

Project Details:
📋 Title: ${projectTitle}
🆔 ID: ${projectId}
👤 Client: ${req.user.name}
📧 Email: ${req.user.email}
📱 Phone: ${req.user.phone || 'Not provided'}
🏷️ Domain: ${domain}
⚙️ Technology: ${technologyStack || 'Not specified'}
💰 Estimated: ₹${estimatedAmount}

Description: ${projectDescription}`;

    // Send to admin email only (remove WhatsApp)
    await sendEmail('admin@aitechpulze.com', '🔔 New Project Request', adminMessage);

    await logActivity(req.user.id, 'PROJECT_CREATED', `Project ${projectId} created`, req.ip);
    
    res.status(201).json({ 
      success: true, 
      message: 'Project request submitted successfully! We will message you soon on WhatsApp.',
      data: {
        project: {
          id: project.id,
          project_id: projectId,
          title: projectTitle,
          estimated_amount: estimatedAmount
        }
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Project creation failed' });
  }
});

router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        projects: projects.map(p => ({
          ...p.toJSON(),
          progress: getProgressPercentage(p.status)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// Admin: Delete project
router.delete('/:projectId', adminAuth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      where: { project_id: req.params.projectId } 
    });
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.destroy();
    
    await logActivity(req.user.id, 'PROJECT_DELETED', `Project ${req.params.projectId} deleted by admin`, req.ip);
    
    res.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

// Admin: Update project status
router.put('/update-status/:projectId', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findOne({ where: { id: req.params.projectId } });
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.status = status;
    await project.save();
    
    await logActivity(req.user.id, 'PROJECT_STATUS_UPDATED', `Project ${project.project_id} status updated to ${status}`, req.ip);
    
    res.json({ 
      success: true, 
      message: 'Project status updated successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ success: false, message: 'Failed to update project status', error: error.message });
  }
});

function getProgressPercentage(status) {
  switch (status) {
    case 'Requested': return 25;
    case 'Approved': return 40;
    case 'In Progress': return 60;
    case 'Completed': return 100;
    default: return 10;
  }
}

router.get('/:projectId', auth, async (req, res) => {
  try {
    const [projects] = await db.execute(
      'SELECT p.*, ps.status_name FROM projects p LEFT JOIN project_status ps ON p.status_id = ps.id WHERE p.project_id = ? AND p.user_id = ?',
      [req.params.projectId, req.user.id]
    );

    if (projects.length === 0) return res.status(404).json({ error: 'Project not found' });

    const [files] = await db.execute('SELECT * FROM project_files WHERE project_id = ?', [projects[0].id]);

    res.json({ project: projects[0], files });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

module.exports = router;