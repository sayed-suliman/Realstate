const category = require("../models/salesperson/category");

module.exports = {
  async updateQuesInCategory(categoryId, questionId, add = true) {
    let cat = await category.findById(categoryId);
    // adding to category
    if (add && !cat.questions.includes(questionId)) {
      cat.questions.push(questionId);
      await cat.save();
    } else {
      // removing from category
      cat.questions.splice(cat.questions.indexOf(questionId), 1);
      await cat.save();
    }
  },
};
