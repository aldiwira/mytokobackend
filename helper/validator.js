const yup = require("yup");

module.exports = {
  LoginValidator: () => {
    return yup.object().shape({
      username: yup.string().trim().required(),
      password: yup.string().trim().required(),
    });
  },
  RegisterValidator: () => {
    return yup.object().shape({
      username: yup.string().trim().required(),
      password: yup.string().trim().required(),
      name: yup.string().trim().required(),
    });
  },
};
