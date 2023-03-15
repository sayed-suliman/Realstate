/* NODE CACHE  */
const NodeCache = require("node-cache");
const { hexToRgba } = require("../helper/colorConverter");
const Setting = require("../models/setting");
const Theme = require("../models/theme");
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 * 14 }); //TTL is in seconds i.e:14days
let { theme, site } = require("./theme");

/* ==// CACHING THEME FROM THE DATABASE OR FROM THE CONFIG FILE //== */
Theme.findOne()
  .then((data) => {
    if (data) {
      data = data.toObject();
      delete data._id;
      delete data.__v;

      data.colors["primaryShadow"] = hexToRgba(data.colors.primary, 0.25);
      cache.set("theme", data); // caching the theme to node cache
    } else {
      theme.colors["primaryShadow"] = hexToRgba(theme.colors.primary, 0.25);
      cache.set("theme", theme); // caching the theme to node cache
    }
  })
  .catch((err) => console.log(err));

/* ==// CACHING SITE TITLE FROM THE DATABASE OR FROM THE CONFIG FILE //== */
Setting.findOne().then((setting) => {
  if (setting) {
    cache.set("site", {
      name: setting.collegeName ?? site.name,
      logo: setting.logoPath ?? site.logo,
    });
  } else {
    cache.set("site", site);
  }
});

module.exports = {
  cache: function () {
    return cache;
  },
};
