const { sequelize } = require('./config/database');
const { User, Project, Payment } = require('./models');

async function testConnection() {
  console.log('========================================');
  console.log('Testing Database Connection');
  console.log('========================================\n');

  try {
    // Test 1: Database Connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Test 2: Sync Models
    await sequelize.sync();
    console.log('✅ Database models synchronized');

    // Test 3: Check Tables
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    console.log('✅ Tables created:', tables[0].map(t => t.table_name).join(', '));

    // Test 4: Check Admin User
    const adminCount = await User.count({ where: { role: 'ADMIN' } });
    console.log(`✅ Admin users: ${adminCount}`);

    console.log('\n========================================');
    console.log('All Tests Passed! ✅');
    console.log('========================================');
    console.log('\nYou can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
