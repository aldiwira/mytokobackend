const moment = require("moment");
module.exports = {
  set: (code, msg, data) => {
    data ? data : null;
    return {
      code: code,
      message: msg,
      data: data,
    };
  },
  dateNow: () => {
    return moment().format();
  },
};
