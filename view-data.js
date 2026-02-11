const { sequelize } = require('./config/database');
const { User, Project, Payment, ProjectFile, ActivityLog } = require('./models');

async function viewData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Users
    console.log('========================================');
    console.log('USERS');
    console.log('========================================');
    const users = await User.findAll();
    users.forEach(u => {
      console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
    });
    console.log(`Total: ${users.length}\n`);

    // Projects
    console.log('========================================');
    console.log('PROJECTS');
    console.log('========================================');
    const projects = await Project.findAll({ include: [{ model: User, as: 'user' }] });
    projects.forEach(p => {
      console.log(`ID: ${p.id} | Project ID: ${p.project_id} | Title: ${p.title}`);
      console.log(`  User: ${p.user?.name} | Status: ${p.status} | Amount: ₹${p.estimated_amount}`);
    });
    console.log(`Total: ${projects.length}\n`);

    // Payments
    console.log('========================================');
    console.log('PAYMENTS');
    console.log('========================================');
    const payments = await Payment.findAll();
    payments.forEach(p => {
      console.log(`ID: ${p.id} | Amount: ₹${p.amount} | Status: ${p.status} | Method: ${p.payment_method}`);
    });
    console.log(`Total: ${payments.length}\n`);

    // Files
    console.log('========================================');
    console.log('PROJECT FILES');
    console.log('========================================');
    const files = await ProjectFile.findAll();
    files.forEach(f => {
      console.log(`ID: ${f.id} | Project: ${f.project_id} | File: ${f.file_name}`);
    });
    console.log(`Total: ${files.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

viewData();
