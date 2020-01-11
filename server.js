const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const path = require('path');

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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // set the static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;      //looks for an environment variable called port (needed for deployment to Heroku). Default to port 5000 if there is no port environment variable

app.listen(PORT, () => console.log(`Now listening on port ${PORT}`));