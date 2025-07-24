const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const certRoutes = require('./routes/certRoutes');
app.use('/certs', certRoutes);


const sessionRoutes = require('./routes/sessionRoutes');
app.use('/session', sessionRoutes);


const messageRoutes = require('./routes/messageRoutes');
app.use('/messages', messageRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Secure Chat Backend is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
