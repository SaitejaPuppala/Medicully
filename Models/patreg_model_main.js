const mongoose = require("mongoose");

const patregSchema_main = new mongoose.Schema({
  name : String,
  mobile : String,
  email : String,
  username : String,
  password : String,
  donor : String,
  role : String,
  bloodgrp : String,
  pic_path : {type: String, default : '/public/person.jpg'}
});

const patreg_Model_main = mongoose.model("patreg_Model_main", patregSchema_main);
module.exports = patreg_Model_main;