const express = require('express');
const mongoose = require('mongoose');
const app = express();
const urlRoutes = require('./routes/url');
const cors = require("cors")
const bodyParser = require("body-parser")
// Connect to MongoDB
mongoose.connect('mongodb://localhost/urlshortener', {
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
