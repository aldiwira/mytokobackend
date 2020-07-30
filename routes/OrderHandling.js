const router = require("express").Router();
const { db, response, validator } = require("../helper");
const { auth } = require("../helper/jwt");

/* TODO
1. Get all order by user
2. Get order by user
3. Create order
4. Edit Order
*/

router.get("/", auth, async (req, res, next) => {
  const { _id, rule } = req.payload;
});

module.exports = router;
