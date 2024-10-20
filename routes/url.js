const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const shortid = require('shortid');
const Url = require('../models/Url');

// Base URL for generating short URLs
const BASE_URL = 'http://localhost:5000/api/url';

// Generate a unique URL code using shortid
const generateUrlCode = () => shortid.generate();

// Middleware to validate long URL format
const validateLongUrl = (longUrl) => {
    return validUrl.isUri(longUrl);
};

// Route to shorten a URL
router.post('/shorten', async (req, res) => {
    const { longUrl, fingerprint,userDetails} = req.body;
         const {VisitorId,userAgent,language,location,timestamp} = userDetails;
       const  {city,latitude,longitude} = location;
    // Validate the provided long URL
    if (!validateLongUrl(longUrl)) {
        return res.status(400).json({ error: 'Invalid long URL' });
    }

    // Generate short URL
    const urlCode = generateUrlCode();
    const shortUrl = `${BASE_URL}/${urlCode}`;

    // Create a new URL document
    const newUrl = new Url({
        longUrl,
        shortUrl,
        shortId:urlCode,    
        fingerprint,
         userDetails:{
            fingerprint,
            VisitorId,
            userAgent,
            language,
            location:{
                city,
                latitude,
                longitude
            }
         },
        clickCount: 0,
        clickData: {},
        timestamp
    });

    try {
        // Save the new URL to the database
        await newUrl.save();
        return res.json(newUrl);
    } catch (error) {
        console.error('Error saving URL:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to redirect from short URL to long URL
router.get('/:code', async (req, res) => {
     
    const url = await Url.findOne({ shortId:req.params.code });
console.log(req.params.code)
    if (!url) {
        return res.status(404).json({ error: 'URL not found' });
    }

    const fingerprint = req.query.fingerprint;
    console.log(fingerprint)  
    const currentTime = Date.now();

    // Ensure clickData is initialized
    url.clickData = url.clickData || {};

    // Initialize fingerprint data if it doesn't exist
    if (!url.clickData[fingerprint]) {
        url.clickData[fingerprint] = { lastClick: null }; // Initialize lastClick
    }

    const lastClickTime = url.clickData[fingerprint].lastClick;

    // Check if the click is within the timeframe (1 minute)
    if (lastClickTime && (currentTime - lastClickTime < 60000)) {
        return res.redirect(url.longUrl);
    }

    // Update click data
    url.clickData[fingerprint].lastClick = currentTime;

    // Increment the click count if this is a unique click
    if (!lastClickTime) {
        url.clickCount++;
    }

    try {
       
        await url.save();
        return res.redirect(url.longUrl);
    } catch (error) {
        console.error('Error updating URL click data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
