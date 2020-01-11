const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');

const app = express();

// Connect DB
connectDB();

//Init middleware
app.use(express.json( { extended: false }));    // because exteded is false you cannot post a nested object

app.use(morgan('tiny'));

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));


const PORT = process.env.PORT || 5000;      //looks for an environment variable called port (needed for deployment to Heroku). Default to port 5000 if there is no port environment variable

app.listen(PORT, () => console.log(`Now listening on port ${PORT}`));