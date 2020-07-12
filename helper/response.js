module.exports = {
  set: (code, msg, data) => {
    data ? data : null;
    return {
      code: code,
      message: msg,
      data: data,
    };
  },
};
