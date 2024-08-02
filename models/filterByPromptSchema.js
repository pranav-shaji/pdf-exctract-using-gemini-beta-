const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: String,
  skills: [String],
});
module.exports = mongoose.model("Skill", skillSchema);
