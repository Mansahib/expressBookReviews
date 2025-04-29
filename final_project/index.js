const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware
app.use(express.json());

// Session configuration
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 60 * 60 * 1000 // 1 hour
    }
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    const token = req.session.authorization.accessToken;
    const username = req.session.authorization.username;

    jwt.verify(token, "access", (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: "Session expired" });
            }
            return res.status(403).json({ message: "Invalid token" });
        }

        const users = require('./router/auth_users.js').users;
        if (!users.some(user => user.username === username)) {
            return res.status(403).json({ message: "User not found" });
        }

        req.user = { username };
        next();
    });
});

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// Server startup with port handling
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Customer routes: http://localhost:${PORT}/customer`);
    console.log(`General routes: http://localhost:${PORT}/`);
})
.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} in use, trying alternative port...`);
        const altServer = app.listen(0, () => {
            console.log(`Server running on alternative port ${altServer.address().port}`);
        });
    } else {
        console.error('Server startup error:', err);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped');
    });
});

module.exports = { app, server };