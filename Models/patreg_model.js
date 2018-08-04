const mongoose = require("mongoose");

const patregSchema = new mongoose.Schema({
  name : String,
  mobile : String,
  email : String,
  username : String,
  password : String,
  donor : String,
  role : String,
  bloodgrp : String,
  pic_path : {type: String, default : '/public/person.jpg'},
  createdAt: { type: Date, expires: 86400, default: Date.now }
});


const patreg_Model = mongoose.model("patreg_Model", patregSchema);
module.exports = patreg_Model;
