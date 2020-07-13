const yup = require("yup");

module.exports = {
  LoginValidator: () => {
    return yup.object().shape({
      username: yup.string().trim().required(),
      password: yup.string().trim().min(7).required(),
    });
  },
  RegisterValidator: () => {
    return yup.object().shape({
      username: yup.string().trim().required(),
      password: yup.string().trim().min(7).required(),
      name: yup.string().trim().required(),
    });
  },
  changePassword: () => {
    return yup.object().shape({
      oldpassword: yup.string().trim().min(7).required(),
      newpassword: yup.string().trim().min(7).required(),
    });
  },
};
