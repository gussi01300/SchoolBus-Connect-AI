const Database = require('better-sqlite3');

//Connect to Database
const db = new Database('data/data.db');

module.exports = db;
