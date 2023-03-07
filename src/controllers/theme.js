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
        link: req.body.fontFamilyLink,
        name: req.body.fontFamily,
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
      // theme = result.toObject();

      // delete theme._id;
      // delete theme.__v;

      // theme.colors["primaryShadow"] = hexToRgba(theme.colors.primary, 0.25);
      // res.locals.theme = theme;

      var msg = encodeMsg(`Theme Updated Successfully.`, "success");
      res.redirect("/dashboard/theme?msg=" + msg);
    }
  } catch (error) {
    var msg = encodeMsg(error.message, "danger", 500);
    res.redirect("/dashboard/theme?msg=" + msg);
  }
};
