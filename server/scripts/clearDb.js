const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function clearDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  try {
    console.log('🔗 Connecting to MongoDB...');
    const conn = await mongoose.connect(uri);
    console.log(`✅ Connected: ${conn.connection.host}/${conn.connection.name}`);

    console.log('⚠️  Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('🧹 Database dropped successfully.');
  } catch (err) {
    console.error('❌ Failed to clear database:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

clearDatabase();







