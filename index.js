const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/user');
const blogRoutes = require('./routes/blog');

require('dotenv').config();

const app = express();

app.use(express.json());

const corsOptions = {
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.on('open', () => console.log("Connected to MongoDB"));

app.use("/blogs", blogRoutes);
app.use("/users", userRoutes);

if(require.main === module) {
    app.listen(process.env.PORT || 4000, () => {
        console.log("Server is running on port " + (process.env.PORT || 4000));
    })
}

module.exports = {app, mongoose};
