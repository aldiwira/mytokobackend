const express = require("express");
const validator = require("../helper/validator");
const db = require("../helper/db");
const response = require("../helper/response");
const encrypt = require("../helper/encrypt");
const { auth, sign } = require("../helper/jwt");

const router = express.Router();
const ownerM = db.get("owner");

const existing = async (model, conditon) => {
  return await model.findOne(conditon);
};

//owner login and register
router.post("/login", async (req, res, next) => {
  let { username, password } = req.body;
  console.log(req.body);
  try {
    await validator.LoginValidator().validate({ username, password });
    const exist = await ownerM.findOneAndUpdate(
      {
        $or: [{ username: username }],
      },
      { $set: { updatedAt: response.dateNow() } }
    );
    if (exist) {
      const confirmedPass = await encrypt.auth(exist.password, password);
      if (confirmedPass) {
        const token = await sign(exist._id, "owner");
        res.status(200).json(
          response.set(200, "Success login account owner", {
            data: exist,
            token: token,
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
  try {
    await validator.RegisterValidator().validate({ username, password, name });
    const exist = await existing(ownerM, {
      $or: [{ username: username }, { name: name }],
    });
    console.log();
    if (!exist) {
      const cryptedPassword = await encrypt.sign(password);
      console.log(encrypt);
      const ownerD = await ownerM.insert({
        username,
        password: cryptedPassword,
        name,
        createdAt: response.dateNow(),
        updatedAt: response.dateNow(),
      });
      const apitoken = await sign(ownerD._id, "owner");
      res.status(200).json(
        response.set(201, "Your account created", {
          data: ownerD,
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

//fetch account info
router.get("/", auth, async (req, res, next) => {
  let { _id } = req.payload;
  try {
    const userdata = await ownerM.findOne(_id);
    if (userdata) {
      res
        .status(200)
        .json(response.set(200, "Success fetch user data", userdata));
    } else {
      throw new Error("Your account not found");
    }
  } catch (error) {
    next(error);
  }
});
//change info account
router.put("/changeinfo", auth, async (req, res, next) => {
  let { username, name } = req.body;
  let { _id } = req.payload;
  try {
    const exist = await existing(ownerM, { $or: [{ _id: _id }] });
    if (exist) {
      await ownerM
        .findOneAndUpdate(
          { _id: _id },
          {
            $set: {
              username: username,
              name: name,
              updatedAt: response.dateNow(),
            },
          }
        )
        .then((value) => {
          res
            .status(200)
            .json(response.set(200, "Your account information changed", value));
        });
    } else {
      throw new Error("Your account not found");
    }
  } catch (error) {
    next(error);
  }
});
//change password account
router.put("/changepassword", auth, async (req, res, next) => {
  let { oldpassword, newpassword } = req.body;
  let { _id } = req.payload;
  try {
    await validator.changePassword().validate({ oldpassword, newpassword });
    const exist = await existing(ownerM, {
      $or: [{ _id: _id }],
    });
    if (exist) {
      const checkpassword = await encrypt.auth(exist.password, oldpassword);
      if (checkpassword) {
        const newpass = await encrypt.sign(newpassword);
        await ownerM
          .findOneAndUpdate(
            { _id: _id },
            { $set: { password: newpass, updatedAt: response.dateNow() } }
          )
          .then((value) => {
            res
              .status(200)
              .json(response.set(200, `Success change accout password`, value));
          });
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

module.exports = router;
