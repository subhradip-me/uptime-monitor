import User from '../models/User.js';

export const initializeDefaultUser = async () => {
  try {
    // Check if any users exist
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('📝 No users found, creating default admin user...');
      
      const defaultUser = new User({
        username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
      });
      
      await defaultUser.save();
      
      console.log(`✅ Default admin user created: ${defaultUser.username}`);
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('👤 Users already exist in database');
    }
  } catch (error) {
    console.error('❌ Error initializing default user:', error);
  }
};