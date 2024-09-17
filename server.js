const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3007;

// MongoDB connection
mongoose.connect('mongodb://mongodb:27017/Survey', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Schemas and Models
const overallSchema = new mongoose.Schema({
    name: String,
    empid: { type: String, unique: true },
    department: String,
    role: String,
    jobSatisfaction: Number,
    companyCulture: Number,
    managementSatisfaction: Number,
    workEnvironment: Number,
    compensationBenefits: Number,
    additionalComments: String
});

const workBalanceSchema = new mongoose.Schema({
    name: String,
    empid: { type: String, unique: true },
    department: String,
    role: String,
    shortBreaksFrequency: Number,
    workEmailsOutsideFrequency: Number,
    workLifeBalance: String,
    workload: String,
    flexibility: String,
    additionalComments: String
});

const professionalSchema = new mongoose.Schema({
  name: String,
  empid: { type: String, unique: true },
  department: String,
  role: String,
  professionalGrowth: Number,
  careerOpportunities: Number,
  accomplishment: Number,
  trainingOpportunities: Number,
  mentorship: Number,
  additionalComments: String
});

const OverallFeedback = mongoose.model('OverallFeedback', overallSchema);
const WorkBalanceFeedback = mongoose.model('WorkBalanceFeedback', workBalanceSchema);
const ProfessionalFeedback = mongoose.model('ProfessionalFeedback', professionalSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the root URL with the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve forms for each survey type
app.get('/overall-satisfaction', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overall-satisfaction.html'));
});

app.get('/work-balance', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'work.html'));
});

app.get('/professional-development', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'professional-development.html'));
});

app.get('/guide', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'guide.html'));
  });

  app.get('/support', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'support.html'));
  });
// Serve results for each survey type
app.get('/results-professional-development', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'result2.html'));
});
app.get('/thankyou', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thankyou.html'));
});
app.get('/results-overall', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'result1.html'));
});

// Handle form submissions
app.post('/submit-overall-satisfaction', async (req, res) => {
  const formData = {
      name: req.body.name,
      empid: req.body.employeeId,
      department: req.body.department,
      role: req.body.role,
      jobSatisfaction: parseInt(req.body.jobSatisfaction, 10),
      companyCulture: parseInt(req.body.companyCulture, 10),
      managementSatisfaction: parseInt(req.body.managementSatisfaction, 10),
      workEnvironment: parseInt(req.body.workEnvironment, 10),
      compensationBenefits: parseInt(req.body.compensationBenefits, 10),
      additionalComments: req.body.additionalComments
  };

  try {
      const existingFeedback = await OverallFeedback.findOne({ empid: formData.empid });
      if (existingFeedback) {
          return res.redirect('/error.html');
      }

      const feedbackData = new OverallFeedback(formData);
      await feedbackData.save();
      res.redirect('/results-overall');
  } catch (err) {
      console.error('Error saving feedback:', err.message);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/submit-work-life-balance', async (req, res) => {
  const formData = {
      name: req.body.name,
      empid: req.body.employeeId,
      department: req.body.department,
      role: req.body.role,
      shortBreaksFrequency: parseInt(req.body.shortBreaksFrequency, 10) || null,
      workEmailsOutsideFrequency: parseInt(req.body.workEmailsOutsideFrequency, 10) || null,
      workLifeBalance: req.body.workLifeBalance || 'N/A',
      workload: req.body.workload || 'N/A',
      flexibility: req.body.flexibility || 'N/A',
      additionalComments: req.body.additionalComments
  };

  try {
      const existingFeedback = await WorkBalanceFeedback.findOne({ empid: formData.empid });
      if (existingFeedback) {
          return res.redirect('/error.html');
      }

      const feedbackData = new WorkBalanceFeedback(formData);
      await feedbackData.save();
      res.redirect('/thankyou');
  } catch (err) {
      console.error('Error saving feedback:', err.message);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/submit-professional-development', async (req, res) => {
  const formData = {
      name: req.body.name,
      empid: req.body.employeeId,
      department: req.body.department,
      role: req.body.role,
      professionalGrowth: parseInt(req.body.professionalGrowth, 10),
      careerOpportunities: parseInt(req.body.careerOpportunities, 10),
      accomplishment: parseInt(req.body.accomplishment, 10),
      trainingOpportunities: parseInt(req.body.trainingOpportunities, 10),
      mentorship: parseInt(req.body.mentorship, 10),
      additionalComments: req.body.additionalComments
  };

  try {
      const existingFeedback = await ProfessionalFeedback.findOne({ empid: formData.empid });
      if (existingFeedback) {
          return res.redirect('/error.html');
      }

      const feedbackData = new ProfessionalFeedback(formData);
      await feedbackData.save();
      res.redirect('/results-professional-development');
  } catch (err) {
      console.error('Error saving feedback:', err.message);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


app.get('/api/feedback-stats/:type', async (req, res) => {
    const { type } = req.params;

    let Model;
    switch (type) {
        case 'overall':
            Model = OverallFeedback;
            break;
        case 'professional':
            Model = ProfessionalFeedback;
            break;
        default:
            return res.status(400).json({ success: false, message: 'Invalid survey type' });
    }

    try {
        const feedbackData = await Model.aggregate([
            { $group: { _id: null, ...aggregateFieldsForType(type) } }
        ]);

        if (feedbackData.length > 0) {
            const data = feedbackData[0];
            res.json(processFeedbackData(type, data));
        } else {
            res.json({});
        }
    } catch (err) {
        console.error('Error fetching feedback stats:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

function aggregateFieldsForType(type) {
    switch (type) {
        case 'overall':
            return {
                jobSatisfaction: { $push: "$jobSatisfaction" },
                companyCulture: { $push: "$companyCulture" },
                managementSatisfaction: { $push: "$managementSatisfaction" },
                workEnvironment: { $push: "$workEnvironment" },
                compensationBenefits: { $push: "$compensationBenefits" }
            };

        case 'professional':
            return {
                professionalGrowth: { $push: "$professionalGrowth" },
                careerOpportunities: { $push: "$careerOpportunities" },
                accomplishment: { $push: "$accomplishment" },
                trainingOpportunities: { $push: "$trainingOpportunities" },
                mentorship: { $push: "$mentorship" }
            };
        default:
            return {};
    }
}

function processFeedbackData(type, data) {
    const processRatings = (ratings) => ratings.reduce((counts, rating) => {
        if (rating !== null) {
            counts[rating] = (counts[rating] || 0) + 1;
        } else {
            counts['N/A'] = (counts['N/A'] || 0) + 1;
        }
        return counts;
    }, {});

    switch (type) {
        case 'overall':
            return {
                jobSatisfaction: processRatings(data.jobSatisfaction),
                companyCulture: processRatings(data.companyCulture),
                managementSatisfaction: processRatings(data.managementSatisfaction),
                workEnvironment: processRatings(data.workEnvironment),
                compensationBenefits: processRatings(data.compensationBenefits)
            };

        case 'professional':
            return {
                professionalGrowth: processRatings(data.professionalGrowth),
                careerOpportunities: processRatings(data.careerOpportunities),
                accomplishment: processRatings(data.accomplishment),
                trainingOpportunities: processRatings(data.trainingOpportunities),
                mentorship: processRatings(data.mentorship)
            };
        default:
            return {};
    }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
