const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');


const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Feedbacks', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});


// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    name: String,
    empid: {
        type: String,
        unique: true
    },
    email: String,
    pno: String,
    desig: String,
    punctuality: Number,
    clarification: Number,
    explanation: Number,
    communication: Number,
    feedback: Number,
    other: String
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Serve login.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/submit-part1', (req, res) => {
    req.session.formData = {
        name: req.body.name,
        empid: req.body.empid,
        email: req.body.email,
        pno: req.body.pno,
        desig: req.body.desig
    };
    res.redirect('/feedback2.html');
});

app.post('/submit-part2', async (req, res) => {
    const formData = req.session.formData || {};

    console.log('Form Data:', req.body);

    const feedbackData = new Feedback({
        ...formData,
        punctuality: parseInt(req.body.punctuality, 10),
        clarification: parseInt(req.body.clarification, 10),
        explanation: parseInt(req.body.explanation, 10),
        communication: parseInt(req.body.communication, 10),
        feedback: parseInt(req.body.feedback, 10),
        other: req.body.other || ''
    });

    try {
        // Check if feedback for the same empid already exists
        const existingFeedback = await Feedback.findOne({ empid: formData.empid });
        if (existingFeedback) {
            req.session.destroy();
            return res.redirect('/error.html');
        }

        // Save feedback data
        await feedbackData.save();

        // Destroy session data
        req.session.destroy();

        // Redirect to thankyou.html
        res.redirect('/thankyou.html');
    } catch (err) {
        console.error('Error saving feedback:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// Serve results.html for the /results route
app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// Fetch feedback data for results
app.get('/api/feedback-stats', async (req, res) => {
    try {
        const feedbackData = await Feedback.aggregate([
            { $group: { _id: null, punctuality: { $push: "$punctuality" }, clarification: { $push: "$clarification" }, explanation: { $push: "$explanation" }, communication: { $push: "$communication" }, feedback: { $push: "$feedback" } } }
        ]);

        if (feedbackData.length > 0) {
            const data = feedbackData[0];
            res.json({
                punctuality: countRatings(data.punctuality),
                clarification: countRatings(data.clarification),
                explanation: countRatings(data.explanation),
                communication: countRatings(data.communication),
                feedback: countRatings(data.feedback)
            });
        } else {
            res.json({});
        }
    } catch (err) {
        console.error('Error fetching feedback stats:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

function countRatings(ratings) {
    return ratings.reduce((counts, rating) => {
        counts[rating] = (counts[rating] || 0) + 1;
        return counts;
    }, {});
}


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
