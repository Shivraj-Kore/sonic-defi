const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const { auth } = require('express-openid-connect');
const router = require('./routes/index');
const mongoose = require('mongoose')
dotenv.config();

const app = express();
const cors = require('cors');
app.use(cors()); 

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const config = {
    authRequired: false,
    auth0Logout: true,
    authorizationParams: {
        scope: "openid profile email"
    }
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
    config.baseURL = `http://localhost:${port}`;
}

app.use(auth(config));

// Middleware to make user data available globally
app.use((req, res, next) => {
    res.locals.user = req.oidc.user;
    next();
});

app.use('/', router);

// Serve index.html for any unknown route (SPA-like behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
http.createServer(app).listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
});
