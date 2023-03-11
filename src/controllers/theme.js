const { fonts } = require("../config/fonts");
const { cache } = require("../config/cache");
const { hexToRgba } = require("../helper/colorConverter");
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Theme = require("../models/theme");

exports.theme = async (req, res) => {
  try {
    var msgToken = req.query.msg;
    var msg = {};
    if (msgToken) {
      msg = decodeMsg(msgToken);
    }
    res.render("dashboard/examples/theme-setting", {
      title: "Dashboard | Theme",
      toast: Object.keys(msg).length == 0 ? undefined : msg,
      themeData: await Theme.findOne(),
      fonts,
    });
  } catch (error) {
    var msg = encodeMsg(error.message, "danger", 500);
    res.redirect("/dashboard?msg=" + msg);
  }
};

exports.doTheme = async (req, res) => {
  try {
    let themeObject = {
      colors: {
        primary: req.body.primaryColor,
        secondary: req.body.secondaryColor,
      },
      fontFamily: {
        name: req.body.font,
      },
    };

    // if error
    let error = req.flash("font_error");
    if (error.length) {
      return res.render("dashboard/examples/theme-setting", {
        error: { font: error[0] },
        themeData: themeObject,
      });
    }

    let result;
    if (req.body.id) {
      result = await Theme.findByIdAndUpdate(req.body.id, themeObject, {
        new: true,
        upsert: true,
      });
    } else {
      result = await Theme(themeObject).save();
    }
    if (result) {
      result = result.toObject();

      delete result._id;
      delete result.__v;

      result.colors["primaryShadow"] = hexToRgba(result.colors.primary, 0.25);
      // caching the theme
      cache().set("theme", result);
      var msg = encodeMsg(`Theme Updated Successfully.`, "success");
      res.redirect("/dashboard/theme?msg=" + msg);
    }
  } catch (error) {
    var msg = encodeMsg(error.message, "danger", 500);
    res.redirect("/dashboard/theme?msg=" + msg);
  }
};
