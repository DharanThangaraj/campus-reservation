const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// import routers
const userRoutes = require('./routes/users');
const resourceRoutes = require('./routes/resources');
const bookingRoutes = require('./routes/bookings');
const notificationRoutes = require('./routes/notifications');

app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);

// basic health check
app.get('/api/health', (req, res) => {
  res.send({ status: 'ok' });
});

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // seed default resources if none exist
    const Resource = require('./models/Resource');
    const count = await Resource.countDocuments();
    if (count === 0) {
      console.log('No resources found; seeding default hall names...');
      const names = [
        'Main Hall',
        'Conference Hall A',
        'Conference Hall B',
        'Auditorium 1',
        'Auditorium 2',
        'Seminar Hall 1',
        'Seminar Hall 2',
        'Lecture Hall 101',
        'Lecture Hall 102',
        'Multipurpose Hall'
      ];
      const docs = names.map(n => ({ name: n, type: 'HALL', capacity: 100 }));
      await Resource.insertMany(docs);
      console.log('Seeded', docs.length, 'resource halls');
    }

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });
