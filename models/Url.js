// 

const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
    VisitorId: { type: String },
    userAgent: { type: String },
    language: { type: String },
    timestamp: { type: Date, default: Date.now },
    location: { // Field for user's location
        latitude: { type: Number },
        longitude: { type: Number },
        city: { type: String }, 
    }
}, { _id: false }); // Prevent creation of a separate _id for this sub-document

const UrlSchema = new mongoose.Schema({
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    shortId: { type: String, required: true },
    fingerprint: { type: String, required: true },
    userDetails: [UserDetailsSchema], // Array of user detail objects
    clickData: { type: Object, default: {} },
    clickCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Url', UrlSchema);
