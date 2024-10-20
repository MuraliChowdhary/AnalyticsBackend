const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    shortId:{type:String,required:true},
    fingerprint: { type: String, required: true },
    userDetails: {
        VisitorId:{type :String},
        userAgent: { type: String },
        language: { type: String },
        timestamp: { type: Date, default: Date.now },
        location: { // New field for user's location
            latitude: { type: Number },
            longitude: { type: Number },
            city: { type: String }, 
        }

    },
    clickData: { type: Object, default: {} },
    clickCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Url', UrlSchema);
