const monk = require("monk");
require("dotenv").config();

module.exports = monk(process.env.mongo_uri);
