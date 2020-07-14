const express = require("express");
const moment = require("moment");
const db = require("../helper/db");
const validator = require("../helper/validator");
const response = require("../helper/response");
const { auth } = require("../helper/jwt");

const router = express.Router();
const productM = db.get("products");
const dateNow = moment().format();

const productCheck = async (condition) => {
  return await productM.findOne(condition);
};

//product models
//name of product = name
//description of pruduct = desc
//price of product = price
//stock of product = stock
//stock owner or id user = owner

// TODO
// 1. Fetch all user products
router.get("/", auth, async (req, res, next) => {
  const { _id } = req.payload;
  try {
    await productM.find({ owner: _id }).then((datas) => {
      res
        .status(200)
        .json(response.set(200, "Success fetch all products", datas));
    });
  } catch (error) {
    next(error);
  }
});
// 2. Fetch product by id product
router.get("/:id", auth, async (req, res, next) => {
  const { _id } = req.payload;
  const { id } = req.params;
  try {
    const product = await productCheck({ _id: id, owner: _id });
    if (product) {
      res.status(200).json(response.set(200, "Success fetch product", product));
    } else {
      throw new Error("Product ID not found");
    }
  } catch (error) {
    next(error);
  }
});
// 3. Create product
router.post("/", auth, async (req, res, next) => {
  const { name, price, stock, desc } = req.body;
  const { _id } = req.payload;
  try {
    await validator.productBody().validate({ name, price, stock, desc });
    const exist = await productCheck({ name: name, owner: _id });
    if (!exist) {
      await productM
        .insert({
          name,
          price,
          stock,
          desc,
          owner: _id,
          createdAt: dateNow,
          updatedAt: dateNow,
        })
        .then((value) => {
          res
            .status(200)
            .json(response.set(201, "Success created product", value));
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      throw new Error("Product was available");
    }
  } catch (error) {
    next(error);
  }
});
// 4. Edit product
router.put("/:id/edit", auth, async (req, res, next) => {
  const { name, price, stock, desc } = req.body;
  const { _id } = req.payload;
  const { id } = req.params;
  try {
    await validator.productBody().validate({ name, price, stock, desc });
    const exist = await productCheck({ _id: id, owner: _id });
    if (exist) {
      await productM
        .findOneAndUpdate(
          { _id: id },
          { $set: { name, price, stock, desc, updatedAt: dateNow } }
        )
        .then((datas) => {
          res
            .status(200)
            .json(response.set(200, "Success change products data", datas));
        });
    } else {
      throw new Error("Product ID not found");
    }
  } catch (error) {
    next(error);
  }
});
// 5. Delete product
router.delete("/:id/delete", auth, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.payload;
  try {
    const exist = await productCheck({ _id: id, owner: _id });
    if (exist) {
      await productM.findOneAndDelete({ _id: id, owner: _id }).then((datas) => {
        res
          .status(200)
          .json(response.set(200, `Success delete ${exist.name}`, true));
      });
    } else {
      throw new Error("Product ID not found");
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;
