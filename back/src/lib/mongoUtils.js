const { MongoClient } = require("mongodb");

const uri = process.env.mongourl;
const conn = MongoClient.connect(uri, { useUnifiedTopology: true });

module.exports = conn;
