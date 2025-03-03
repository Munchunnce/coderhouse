const mongoose = require('mongoose');


function DbConnect() {
    mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log('Connected to MongoDB');
    }).on('error', (error) => {
        console.log('Error connecting to MongoDB:', error);
    }); 
}

module.exports = DbConnect;