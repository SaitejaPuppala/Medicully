const mongoose = require("mongoose");

const reqSchema = new mongoose.Schema({
  req_from : String,
  req_from_name : String,
  req_to : String,
  req_to_name : String,
  status : String,
  type : String
});

const req_Model = mongoose.model("req_Model", reqSchema);
module.exports = req_Model;
