const monk = require("monk");
require("dotenv").config();

const db = monk(process.env.mongo_uri);

const getCollection = (name) => {
  return db.get(name);
};

module.exports = { db, getCollection };
