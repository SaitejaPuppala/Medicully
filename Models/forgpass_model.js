const mongoose = require("mongoose");

const forgpassSchema = new mongoose.Schema({
  name : String,
  username : String,
  role : String,
  unid : String,
  createdAt: { type: Date, expires: 86400, default: Date.now }
});

const forgpass_Model = mongoose.model("forgpass_Model", forgpassSchema);
module.exports = forgpass_Model;