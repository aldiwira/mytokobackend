const jwt = require("jsonwebtoken");
const moment = require("moment");
const datenow = moment().format();
const key = process.env.apikey;
module.exports = {
  sign: (id, rule) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { _id: id, rule: rule, createdAt: datenow },
        key,
        (err, token) => {
          resolve(token);
          reject(err);
        }
      );
    });
  },
  auth: (req, res, next) => {
    const headertoken = req.headers.authorization;
    const token = headertoken ? headertoken.split(" ")[1] : undefined;
    try {
      if (token) {
        jwt.verify(token, key, (err, decode) => {
          if (err) {
            throw new Error(err);
          } else {
            req.payload = decode;
            next();
          }
        });
      } else {
        throw new Error("Invalid Signature");
      }
    } catch (error) {
      next(error);
    }
  },
};
