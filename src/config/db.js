// Filename: src/config/db.js
const mongoose = require('mongoose');

async function main() {
    try {
        console.log('Attempting to connect to database...');
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log('Database connection established');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

module.exports = main;