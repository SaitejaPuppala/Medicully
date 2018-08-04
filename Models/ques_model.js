const mongoose = require("mongoose");

const quesSchema = new mongoose.Schema({
  name : String,
  username : String,
  date : String,
  post_as : String,
  qsn : String,
  answs : [{
     ans : String,
     ans_date : String,
     ans_by : String,
     ans_by_username : String,
     upvote_no : { type: Number, min: 0},
     downvote_no : { type: Number, min: 0}
  }]
});

const ques_Model = mongoose.model("ques_Model", quesSchema);
module.exports = ques_Model;
