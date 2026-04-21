const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ContactSchema = new mongoose.Schema({
    message: String,
    impactScore: Number,
    impactLevel: String
}, { collection: 'contacts' });

const Contact = mongoose.model('Contact', ContactSchema);

const calculateImpactScore = (rating, category, comment = '') => {
    let score = 0;
    if (rating === 1) score += 50;
    else if (rating === 2) score += 35;
    const negativeKeywords = ['bad', 'worst', 'poor', 'terrible', 'rude', 'slow', 'dirty', 'cold', 'expensive', 'unhealthy', 'hair', 'stale'];
    const lowerComment = (comment || '').toLowerCase();
    negativeKeywords.forEach(kw => { if (lowerComment.includes(kw)) score += 10; });
    score = Math.min(score, 100);
    let level = 'Low';
    if (score >= 70) level = 'High';
    else if (score >= 40) level = 'Medium';
    return { score, level };
};

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    const contacts = await Contact.find({});
    for (const c of contacts) {
        const { score, level } = calculateImpactScore(0, 'Contact', c.message);
        c.impactScore = score;
        c.impactLevel = level;
        await c.save();
        console.log(`Updated contact ${c._id}: Score ${score}`);
    }
    process.exit(0);
}

migrate();
