const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = {
  sign: (password) => {
    return bcrypt.hash(password, parseInt(process.env.salt));
  },
  auth: async (passwordDB, passwordBody) => {
    return await bcrypt.compareSync(passwordBody, passwordDB);
  },
};
