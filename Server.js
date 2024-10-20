require("dotenv").config();
// console.log('Environment Variables:', process.env);

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const urlRoutes = require('./routes/url');
const cors = require("cors")
const bodyParser = require("body-parser")
console.log('MongoDB URL:', process.env.MONGO_URL);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

    
    app.use(cors());
    app.use(bodyParser.json());
    
// Define routes
app.use('/api/url', urlRoutes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
