const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect DB
connectDB();

app.get('/', (req, res) => {
    res.send('Splash Page');
})

const PORT = process.env.PORT || 5000;      //looks for an environment variable called port (needed for deployment to Heroku). Default to port 5000 if there is no port environment variable

app.listen(PORT, () => console.log(`Now listening on port ${PORT}`));