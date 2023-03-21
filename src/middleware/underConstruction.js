const { cache } = require("../config/cache");

exports.underConstruction = (req, res, next) => {
  let isUnderConstruction = cache().get("isUnderConstruction");
  if (req.user?.role != "admin" && isUnderConstruction?.status) {
    return res.render("under-construction");
  }
  return next();
};
