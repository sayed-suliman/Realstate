const { cache } = require("../config/cache");
const { site, theme } = require("../config/theme");
const { hexToRgba } = require("../helper/colorConverter");
const Setting = require("../models/setting");
const Theme = require("../models/theme");
const { underConstructionMsgs } = require("../utils/messsages");

exports.config = async (req, res, next) => {
  let { name, logo } = site;
  let { colors } = theme;
  if (!cache().get("theme")) {
    let newTheme = await Theme.findOne();
    if (newTheme) {
      newTheme = newTheme.toObject();
      newTheme.colors["primaryShadow"] = hexToRgba(
        newTheme.colors.primary ?? colors.primary,
        0.25
      );
      delete newTheme._id;
      delete newTheme.__v;
      cache().set("theme", newTheme);
    }
  }
  res.locals.theme = cache().get("theme");

  if (!cache().get("site")) {
    let setting = await Setting.findOne();
    if (setting) {
      cache().set("site", {
        name: setting.collegeName ?? name,
        logo: setting.logoPath ?? logo,
      });
      let { stripe, paypal } = setting.payment;
      let reasons = [];
      if (
        !(stripe.publicKey && stripe.secret) ||
        !(paypal.id && paypal.secret)
      ) {
        reasons.push("missingPayment");
      }
      if (!setting.status) {
        reasons.push("maintenanceMode");
      }
      cache().set("isUnderConstruction", {
        status: reasons.length > 0,
        reasons,
      });
    }
  }
  let isUnderConstruction = cache().get("isUnderConstruction");
  if (isUnderConstruction.status && req.user?.role == "admin") {
    let messages = [];
    isUnderConstruction.reasons.forEach((reason) => {
      messages.push({
        msg: underConstructionMsgs[reason].msg,
        type: underConstructionMsgs[reason].status,
      });
    });
    res.locals.adminAlert = messages;
  }

  let siteCached = cache().get("site");
  res.locals.site_Title = siteCached.name ?? name;
  res.locals.site_logo = siteCached.logo ?? logo;
  next();
};
