const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://aviralpaliwal007_db_user:lxZI9oFYgkC3qiUG@cluster0.rrtfyju.mongodb.net/streamingapp';
    if (!mongoose.connection.readyState) {
      console.log('[common/db] Connecting to MongoDB at:', uri);
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('[common/db] MongoDB connection established');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  mongoose,
};
