const express = require("express");
const moment = require("moment");
const validator = require("../helper/validator");
const db = require("../helper/db");
const response = require("../helper/response");
const encrypt = require("../helper/encrypt");

const router = express.Router();
const userM = db.get("users");

router.post("/login", async (req, res, next) => {
  let { username, password } = req.body;
  try {
    await validator.LoginValidator().validate({ username, password });
    const existing = await userM.findOne({
      $or: [{ username: username }],
    });
    const checkpassword = await encrypt.auth(existing.password, password);
    if (existing) {
      if (checkpassword) {
        res.status(200).json(response.set(200, "Success login", existing));
      } else {
        throw new Error("Wrong password");
      }
    } else {
      throw new Error("Your account not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  let { username, password, name } = req.body;
  const createdAt = moment().format();
  const cryptedPassword = await encrypt.sign(password);
  try {
    await validator.RegisterValidator().validate({ username, password, name });
    const existing = await userM.findOne({
      $or: [{ username: username }, { name: name }],
    });
    if (!existing) {
      const userD = await userM.insert({
        username,
        password: cryptedPassword,
        name,
        createdAt,
      });
      res.status(200).json(response.set(200, "Your account created", userD));
    } else {
      throw new Error("Your account was available");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
