const mongoose = require("mongoose");

const docregSchema_main = new mongoose.Schema({
  name : String,
  mobile : String,
  email : String,
  file1_path : String,
  spec : String,
  file2_path : String,
  username : String,
  password : String,
  donor : String,
  role : String,
  bloodgrp : String,
  pic_path : {type: String, default : '/public/doctor.PNG'}
});

const docreg_Model_main = mongoose.model("docreg_Model_main", docregSchema_main);
module.exports = docreg_Model_main;
