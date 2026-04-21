const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const FeedbackSchema = new mongoose.Schema({
    rating: Number,
    category: String,
    comment: String,
    impactScore: Number,
    impactLevel: String
}, { collection: 'feedbacks' });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

const calculateImpactScore = (rating, category, comment = '') => {
    let score = 0;
    
    if (rating === 1) score += 50;
    else if (rating === 2) score += 35;
    else if (rating === 3) score += 15;
    else if (rating === 4) score += 5;

    const negativeKeywords = ['bad', 'worst', 'poor', 'terrible', 'rude', 'slow', 'dirty', 'cold', 'expensive', 'unhealthy', 'hair', 'stale'];
    const positiveKeywords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'nice', 'delicious', 'friendly', 'fast'];
    const lowerComment = (comment || '').toLowerCase();
    
    let hasNegative = false;
    negativeKeywords.forEach(kw => {
        if (lowerComment.includes(kw)) {
            score += 10;
            hasNegative = true;
        }
    });

    positiveKeywords.forEach(kw => {
        if (lowerComment.includes(kw)) {
            score -= 5;
        }
    });

    const priorityCategories = ['food', 'hygiene', 'health'];
    if (priorityCategories.includes(category?.toLowerCase())) {
        if (rating > 0 && (rating < 4 || hasNegative)) {
            score += 15;
        }
    }

    score = Math.max(0, Math.min(score, 100));
    
    let level = 'Low';
    if (score >= 70) level = 'High';
    else if (score >= 40) level = 'Medium';

    return { score, level };
};

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    const feedbacks = await Feedback.find({});
    for (const fb of feedbacks) {
        const { score, level } = calculateImpactScore(fb.rating, fb.category, fb.comment);
        fb.impactScore = score;
        fb.impactLevel = level;
        await fb.save();
        console.log(`Updated feedback ${fb._id}: Score ${score}, Level ${level}`);
    }
    process.exit(0);
}

migrate();
