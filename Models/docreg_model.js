const mongoose = require("mongoose");

const docregSchema = new mongoose.Schema({
  name : String,
  mobile : String,
  email : String,
  file1_path : String,
  username : String,
  password : String,
  donor : String,
  role : String,
  bloodgrp : String,
  pic_path : {type: String, default : '/public/doctor.PNG'},
  createdAt: { type: Date, expires: 86400, default: Date.now }
});

const docreg_Model = mongoose.model("docreg_Model", docregSchema);
module.exports = docreg_Model;
