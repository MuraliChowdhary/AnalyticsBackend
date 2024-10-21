const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const shortid = require('shortid');
const Url = require('../models/Url');

const BASE_URL = 'https://analyticsbackend-1.onrender.com/api/url';

const generateUrlCode = () => shortid.generate();

// Middleware to validate long URL format
const validateLongUrl = (longUrl) => {
    return validUrl.isUri(longUrl);
};

// Route to shorten a URL
router.post('/shorten', async (req, res) => {
    const { longUrl, fingerprint, userDetails } = req.body;

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
        shortId: urlCode,
        fingerprint,
        userDetails: [{ // Store user details as an array
            VisitorId: userDetails.VisitorId,
            userAgent: userDetails.userAgent,
            language: userDetails.language,
            location: {
                city: userDetails.location.city,
                latitude: userDetails.location.latitude,
                longitude: userDetails.location.longitude,
            },
        }],
        clickCount: 0,
        clickData: {},
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
    const url = await Url.findOne({ shortId: req.params.code });

    if (!url) {
        return res.status(404).json({ error: 'URL not found' });
    }

    const fingerprint = req.query.fingerprint;

    // Ensure clickData is initialized
    url.clickData = url.clickData || {};

    // Initialize fingerprint data if it doesn't exist
    if (!url.clickData[fingerprint]) {
        url.clickData[fingerprint] = { lastClick: null, userDetails: [] }; // Initialize lastClick and userDetails
    }

    const lastClickTime = url.clickData[fingerprint].lastClick;
    const currentTime = Date.now();

    // Check if the click is within the timeframe (1 minute)
    if (lastClickTime && (currentTime - lastClickTime < 60000)) {
        return res.redirect(url.longUrl);
    }

    // Update click data
    url.clickData[fingerprint].lastClick = currentTime;

    // Record user details for the click
    url.clickData[fingerprint].userDetails.push({
        VisitorId: req.query.VisitorId, // Assuming you send this in the query
        userAgent: req.headers['user-agent'],
        language: req.headers['accept-language'],
        timestamp: new Date(),
    });

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
