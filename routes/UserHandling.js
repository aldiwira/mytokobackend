const express = require("express");
const moment = require("moment");
const validator = require("../helper/validator");
const db = require("../helper/db");
const response = require("../helper/response");
const encrypt = require("../helper/encrypt");
const { auth, sign } = require("../helper/jwt");

const router = express.Router();
const userM = db.get("users");

const existing = async (conditon) => {
  return await userM.findOne(conditon);
};

router.get("/user/", auth, async (req, res, next) => {
  let { _id } = req.payload;
  try {
    const userdata = await userM.findOne(_id);
    if (userdata) {
      res
        .status(200)
        .json(response.set(200, "Success fetch user data", userdata));
    } else {
      throw new Error("user not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/user/changeinfo", auth, async (req, res, next) => {
  let { username, name } = req.body;
  let { _id } = req.payload;
  try {
    const exist = await existing({ $or: [{ _id: _id }] });
    if (exist) {
      await userM
        .findOneAndUpdate(
          { _id: _id },
          { $set: { username: username, name: name } }
        )
        .then((value) => {
          res
            .status(200)
            .json(response.set(200, "Your account information changed", value));
        });
    } else {
      throw new Error("Account not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/user/changepassword", auth, async (req, res, next) => {
  let { oldpassword, newpassword } = req.body;
  let { _id } = req.payload;
  try {
    await validator.changePassword().validate({ oldpassword, newpassword });
    const exist = await existing({
      $or: [{ _id: _id }],
    });
    if (exist) {
      const checkpassword = await encrypt.auth(exist.password, oldpassword);
      if (checkpassword) {
        const newpass = await encrypt.sign(newpassword);
        await userM
          .findOneAndUpdate({ _id: _id }, { $set: { password: newpass } })
          .then((value) => {
            res
              .status(200)
              .json(response.set(200, `Success change accout password`, value));
          });
      } else {
        throw new Error("Wrong password account");
      }
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  let { username, password } = req.body;
  try {
    await validator.LoginValidator().validate({ username, password });
    const exist = await existing({
      $or: [{ username: username }],
    });
    console.log(exist);
    if (exist) {
      const checkpassword = await encrypt.auth(exist.password, password);
      const apitoken = await sign(exist._id);
      if (checkpassword) {
        res.status(200).json(
          response.set(200, "Success login", {
            user: exist,
            token: apitoken,
          })
        );
      } else {
        throw new Error("Wrong password account");
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
    const exist = await existing({
      $or: [{ username: username }, { name: name }],
    });
    if (!exist) {
      const userD = await userM.insert({
        username,
        password: cryptedPassword,
        name,
        createdAt,
      });
      const apitoken = await sign(userD._id);
      res.status(200).json(
        response.set(200, "Your account created", {
          user: userD,
          token: apitoken,
        })
      );
    } else {
      throw new Error("Your account was available");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
