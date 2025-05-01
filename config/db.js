const mongoose = require('mongoose');

// MongoDB connection URI from your MongoDB Atlas
const uri = "mongodb+srv://vaishnupriya0811:reminder@cluster0.7z1f2yz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = () => {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('MongoDB Connected');
    })
    .catch((err) => {
      console.log('MongoDB connection failed:', err);
    });
};

module.exports = connectDB;  // Export the function
