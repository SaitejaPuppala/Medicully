var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var docregModel = require("../Models/docreg_model.js");
var patregModel = require("../Models/patreg_model.js");
var forgpassModel = require("../Models/forgpass_model.js");
var docregModel_main = require("../Models/docreg_model_main.js");
var patregModel_main = require("../Models/patreg_model_main.js");
var quesModel = require("../Models/ques_model.js");
var reqModel = require("../Models/req_model.js");
var session = require('express-session');
var multer = require('multer');

const path = require('path');
const fs = require('fs');

const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
var smtpTransport = require('nodemailer-smtp-transport');

const uuidv4 = require('uuid/v4');

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    xoauth2 : xoauth2.createXOAuth2Generator({
      user : 'noreply.medicully@gmail.com',
      clientId : '943363860322-q7k9m85il7vbm03ilr3c54evsct5u5rg.apps.googleusercontent.com',
      clientSecret : '1mRTHNgejzbHr9RLB8HbFGEp',
      refreshToken : '1//04D8TEMXrzPCjCgYIARAAGAQSNwF-L9Ir1CPthAbPPl0BqkXT8-nL0BzUg5oLOwJFTp5kBZ90V-EbxYm7Yqyt5JGNsEPQEaFALl0'
    })
  }
}));

mongoose.connect('mongodb+srv://medicully:8mW2IxjmoQhDI5aQ@medicully.cbaamnc.mongodb.net/medicully', {dbName: "medicully"}, { useNewUrlParser: true });
var date_crte = function(){
  var currentTime = new Date();
  var currentOffset = currentTime.getTimezoneOffset();
  var ISTOffset = 330;   // IST offset UTC +5:30
  var ques_date = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
  var dd = ques_date.getDate();
  var mm = ques_date.getMonth()+1;
  var yyyy = ques_date.getFullYear();
  var hr = ques_date.getHours();
  var mn = ques_date.getMinutes();
  if(dd<10){
     dd='0'+dd;
   }
  if(mm<10){
     mm='0'+mm;
   }
   if(mn<10){
     mn='0'+mn;
   }
    if(hr<10){
     hr='0'+hr;
   }
  ques_date = [dd,mm,yyyy].join('-')+' at '+[hr,mn].join(':');
  return ques_date;
};

module.exports = function(app){

 app.use(bodyparser.urlencoded({extended :true}));

 const storage = multer.diskStorage({
   destination : function(req,file,cb){
     cb(null,'./assets/uploads_mbbs/');
   },
   filename : function(req, file, cb){
     cb(null, file.fieldname +'_' + Date.now() + path.extname(file.originalname));
   }
 });

 const storage2 = multer.diskStorage({
   destination : function(req,file,cb){
     cb(null,'./assets/uploads_profile/');
   },
   filename : function(req, file, cb){
     cb(null, file.fieldname +'_' + Date.now() + path.extname(file.originalname));
   }
 });

 // const storage2 = multer.diskStorage({
 //   destination : function(req,file,cb){
 //     cb(null,'./assets/uploads_spec/');
 //   },
 //   filename : function(req, file, cb){
 //     cb(null, file.fieldname +'_' + Date.now() + path.extname(file.originalname));
 //   }
 // });

const upload1 = multer({
   storage : storage
 }).single('file1');
const upload2 = multer({
   storage : storage2
 }).single('file');

 app.get('/',function(req,res){
   res.redirect('/home');
 });

 app.get('/login',function(req,res){
   res.redirect('/home');
 });

 app.get('/pass_upd',function(req,res){
  sess = req.session;
  if(sess != undefined)
   res.render('passreset_mail');
 else
  res.redirect('/home');
 });

 app.get('/pass_upd_succ',function(req,res){
  sess = req.session;
  if(sess != undefined)
   res.render('forgpass_updation_success');
 else
  res.redirect('/home');
 });

 app.get('/verify/:oid',function(req,res){
    patregModel.findOneAndRemove({_id : req.params.oid},function(err,data){
    //console.log(req.body);
    if (err)
      console.log(err);
    //console.log(data);
    else if(data != null)
    {
      var patreg = {
        name : data.name,
        mobile : data.mobile,
        email : data.email,
        username : data.username,
        password : data.password,
        donor : data.donor,
        role : data.role,
        bloodgrp : data.bloodgrp
      };
        var new_pat = new patregModel_main(patreg);
        new_pat.save();
        res.render('email_validation_success');
     }
    else {
     docregModel.findOneAndRemove({_id:req.params.oid},function(err,data){
       if (err) throw err;
       //console.log(data);
       else if(data != null)
       {
        var docreg = {
        name : data.name,
        mobile : data.mobile,
        email : data.email,
        file1_path : data.file1_path,
        username : data.username,
        password : data.password,
        donor : data.donor,
        role : data.role,
        bloodgrp : data.bloodgrp
      };
        var new_doc = new docregModel_main(docreg);
        new_doc.save();
        res.render('email_validation_success');
        }
       else {
        res.send('LINK EXPIRED..PLEASE REGISTER AGAIN..');
       }
     });
    }
  });
 });

app.get('/password_reset/:unid',function(req,res){
    forgpassModel.findOneAndRemove({unid : req.params.unid},function(err,data){
    //console.log(req.body);
    if (err)
    {
      console.log(err);
    }
    else if(data != null)
    {
      res.render('forgpass_updation',{data:data});
    }
    else {
      res.send('LINK EXPIRED..PLEASE TRY AGAIN..');
    }
  });
 });


 app.get('/email_validation/:un',function(req,res){
  sess = req.session;
  if(sess.role == undefined)
  {
    patregModel.findOne({username : req.params.un},function(err,data){
    //console.log(req.body);
    if (err)
      console.log(err);
    //console.log(data);
    if(data != null)
    {
     var message = {
    from: 'medicully <noreply.medicully@gmail.com>',
    to: data.email,
    subject: 'EMAIL VERIFICATION',
    //text : 'hello'
    html :'<div style="border: 0.5px solid rgb(179,179,179);">\
    <p style="text-align:center;">\
        <img style="width: 225px;" src="cid:logo@medicully.ee" alt="logo"></p>\
    <div style="margin-left:40px;margin-right:40px;">\
    <div>\
      <h2 style="color: #29a329">EMAIL ADDRESS VERIFICATION</h2>\
      <p style="font-size: 18px;">Hello <b>'+ data.name +'</b>,</p>\
      <p style="text-indent:50px;">\
       Welcome to <b style="color: #29a329;">MEDICULLY</b>.\
       Please click the below VERIFY button to verify your email address.</p><br/>\
      <p style="text-align:center;">\
      <form style="text-align:center;" action="https://medicully.herokuapp.com/verify/'+ data._id +'">\
      <input style="color: white;background-color: #29a329;padding: 10px" type="submit" value="VERIFY" />\
      </form>\
      </p>\
    </div>\
    </div>\
    </div>',
      attachments: [{
        filename: 'logo_light.PNG',
        path: 'https://medicully.herokuapp.com/public/logo_light.PNG',
        cid: 'logo@medicully.ee'
    }]
   };
   transporter.sendMail(message, function(err, resp){
    if(err)
    {
      console.log(err);
      res.send('ERROR IN SENDING MAIL..PLEASE TRY AGAIN');
    }
    else
    {
      console.log('EMAIL SENT');
      res.render('email_validation');
    }
   });
    }
    else {
     docregModel.findOne({username : req.params.un},function(err,data){
       if (err) throw err;
       //console.log(data);
       if(data != null)
      {
    var message = {
    from: 'medicully <noreply.medicully@gmail.com>',
    to: data.email,
    subject: 'EMAIL VERIFICATION',
    //text : 'hello'
    html :'<div style="border: 0.5px solid rgb(179,179,179);">\
    <p style="text-align:center;">\
        <img style="width: 225px;" src="cid:logo@medicully.ee" alt="logo"></p>\
    <div style="margin-left:40px;margin-right:40px;">\
    <div>\
      <h2 style="color: #29a329">EMAIL ADDRESS VERIFICATION</h2>\
      <p style="font-size: 18px;">Hello <b>'+ data.name +'</b>,</p>\
      <p style="text-indent:50px;">\
       Welcome to <b style="color: #29a329;">MEDICULLY</b>.\
       Please click the below VERIFY button to verify your email address.</p><br/>\
      <p style="text-align:center;">\
      <form style="text-align:center;" action="https://medicully.herokuapp.com/verify/'+ data._id +'">\
      <input style="color: white;background-color: #29a329;padding: 10px" type="submit" value="VERIFY" />\
      </form>\
      </p>\
    </div>\
    </div>\
    </div>',
      attachments: [{
        filename: 'logo_light.PNG',
        path: 'https://medicully.herokuapp.com/public/logo_light.PNG',
        cid: 'logo@medicully.ee'
    }]
   };
   transporter.sendMail(message, function(err, resp){
    if(err)
    {
      console.log(err);
      res.send('ERROR IN SENDING MAIL..PLEASE TRY AGAIN');
    }
    else
    {
      console.log('EMAIL SENT');
      res.render('email_validation');
    }
   });
      }
       else {
        res.send('ERROR OCCURED..PLEASE REGISTER AGAIN');
       }
     });
    }
  });
    }
    else
  {
   res.redirect('/home');
  }
 });

 app.get('/question_form',function(req,res){
   sess = req.session;
   if(sess.type != undefined)
   {
     res.render('post_ques',{name : sess.name,role:sess.role,pic_path:sess.pic_path,username:sess.username,type:sess.type,post_as:sess.post_as});
   }
   else {
     res.redirect('/home');
   }
 });

 app.get('/home',function(req, res){
   sess = req.session;
   //console.log('hom here');
   if(sess.name!= undefined)
    {
      //console.log(sess);
      if(sess.role == 'patient')
      res.render('user',{name : sess.name,role:sess.role,username:sess.username,pic_path:sess.pic_path});
      else if(sess.role == 'doctor')
      res.render('doc_user',{name : sess.name,role:sess.role,username:sess.username,pic_path:sess.pic_path});
    }
   else
   res.render('index');
 });

 app.get('/about',function(req, res){
   res.render('about');
 });

 app.get('/blood_donors',function(req, res){
   sess = req.session;
   if(sess.name != undefined)
   res.render('loggedin_blddnrpage',{name : sess.name,username:sess.username,role:sess.role,pic_path:sess.pic_path});
   else
   res.render('blood_donors');
 });

 app.post('/docreg',function(req, res){
  sess = req.session;
  upload1(req, res, function(err){
    if (err)
      console.log(err);
    else{
      var file1 = req.file.filename;
      var docreg;
        if(req.body.Donor == 'on')
        {
         docreg = {
        name : req.body.name,
        mobile : req.body.mobile,
        email : req.body.email,
        file1_path : '/uploads_mbbs/'+file1,
        username : req.body.username,
        password : req.body.password,
        donor : req.body.Donor,
        role : 'doctor',
        bloodgrp : req.body.bloodgrp
      };}
      else{
        docreg = {
        name : req.body.name,
        mobile : req.body.mobile,
        email : req.body.email,
        file1_path : '/uploads_mbbs/'+file1,
        username : req.body.username,
        password : req.body.password,
        donor : 'off',
        role : 'doctor',
        bloodgrp : 'NA'
      };
      }
      var new_doc = new docregModel(docreg);
      new_doc.save();
      //console.log(sess);
      res.redirect('/email_validation/'+req.body.username);
    }
  });
 });

 app.post('/patreg',function(req, res){
   sess = req.session;
   var patreg;
   if(req.body.Donor == 'on'){
   patreg = {
     name : req.body.name,
     mobile : req.body.mobile,
     email : req.body.email,
     username : req.body.username,
     password : req.body.password,
     donor : req.body.Donor,
     role : 'patient',
     bloodgrp : req.body.bloodgrp
   };}
   else {
     patreg = {
       name : req.body.name,
       mobile : req.body.mobile,
       email : req.body.email,
       username : req.body.username,
       password : req.body.password,
       donor : 'off',
       role : 'patient',
       bloodgrp : 'NA'
     };
   }
  var new_pat = new patregModel(patreg);
  new_pat.save();
  res.redirect('/email_validation/'+req.body.username);
  //res.redirect('/home');
 });

 app.post('/login',function(req, res){
   sess = req.session;
  patregModel_main.findOne({username : req.body.username , password : req.body.password},function(err,data){
    //console.log(req.body);
    if (err)
      console.log(err);
    //console.log(data);
    if(data != null)
    {
      //console.log('inside');
      sess.name = data.name;
      sess.username = data.username;
      sess.role = data.role;
      sess.pic_path = data.pic_path;
      //console.log('success');
      res.send('1');
     }
    else {
     docregModel_main.findOne({username : req.body.username , password : req.body.password},function(err,data){
       if (err) throw err;
       //console.log(data);
       if(data != null)
       {
         sess.name = data.name;
         sess.username = data.username;
         sess.role = data.role;
         sess.pic_path = data.pic_path;
         res.send('1');
        }
       else {
        res.send('0');
       }
     });
    }
  });
 });

 app.get('/logout',function(req,res){
   req.session.destroy(function(err) {
  if(err)
    console.log(err);
  else {
    res.redirect('/home');
  }
});
 });

 app.get('/blood_dnrs',function(req,res){
  var data_file  = [];
   patregModel_main.find({donor : 'on'},function(err,data1){
     if (err)
      console.log(err);
    // console.log(data1);
    else
      {
        docregModel_main.find({donor : 'on'},function(err,data2){
              if (err) throw err;
          // console.log(data2);
              data_file[0] = data1;
              data_file[1] = data2;
            //  console.log(JSON.parse(JSON.stringify(data_file)));
              res.json(data_file);
            });}
    });
   });

app.get('/request/:usrname',function(req,res){
 sess = req.session;
 if(sess.name != undefined && sess.username != req.params.usrname)
 {
   patregModel_main.findOne({username : req.params.usrname},{_id:0,name:1},function(err,data){
     if (err)
      console.log(err);
    else if(data != null)
     {
       var reqst = {
         req_from : sess.username,
         req_from_name : sess.name,
         req_to : req.params.usrname,
         req_to_name : data.name,
         status : '0',
         type : '0'
       };
       var new_req = new reqModel(reqst);
       new_req.save();
       res.send('1');
     }
     else {
      docregModel_main.findOne({username : req.params.usrname},{_id:0,name:1},function(err,data){
        if (err) throw err;
        if(data != null)
        {
          var reqst = {
            req_from : sess.username,
            req_from_name : sess.name,
            req_to : req.params.usrname,
            req_to_name : data.name,
            status : '0',
            type : '0'
          };
         var new_req = new reqModel(reqst);
          new_req.save();
          res.send('1');
        }
        else {
          res.redirect('/home');
        }
      });
     }
   });
 }
 else {
   res.send('0');
 }
 });

 app.get('/my_request',function(req,res){
   sess = req.session;
   //console.log(req.params.usn);
   if(sess.role != undefined)
   {
       res.render('req_page',{name : sess.name,role:sess.role,username:sess.username,pic_path:sess.pic_path});
   }
   else {
     res.redirect('/home');
   }
 });

 app.get('/my_request/:usn',function(req,res){
   sess = req.session;
   //console.log(req.params.usn);
   if(sess.role != undefined)
   {
     reqModel.find({req_to:sess.username,status:'0'},{_id:0},function(err,data){
       if (err)
       {
        console.log(err);
       }
       res.json(data);
       });
   }
   else {
     res.redirect('/home');
   }
 });

 app.get('/acc_req/:usn/:ty',function(req,res){
   sess = req.session;
   if(sess.role != undefined)
   {
     reqModel.updateOne({req_from:req.params.usn,req_to:sess.username},{$set: { "status" : "1","type" : req.params.ty }},{upsert:false}, function(error, result){
       if(error)
       {
         console.log('error is ', error);
       }
       else {
         console.log('success');
         res.redirect('/my_request');
       }
     });
   }
   else {
     res.redirect('/home');
   }
 });

  app.get('/del_req/:usn',function(req,res){
   sess = req.session;
   if(sess.role != undefined)
   {
     reqModel.findOneAndRemove({req_from:req.params.usn,req_to:sess.username}, function(error, result){
       if(error)
       {
         console.log('error is ', error);
       }
       else {
         //console.log('success');
         res.redirect('/my_request');
       }
     });
   }
   else {
     res.redirect('/home');
   }
 });

 app.get('/qsns_home',function(req,res){
   sess = req.session;
   //console.log('inside here');
   if(sess.name != undefined)
   {
     quesModel.find({},function(err,data){
      if(err)
      {
        console.log(err);
      }
       //console.log(data);
       res.json(data);
     });
   }
   else {
     quesModel.find({},{answs:0},function(err,data){
       res.json(data);
     });
   }
   });

 app.post('/email_check',function(req,res){
   patregModel_main.findOne({email : req.body.email },function(err,data){
     if (err)
     {
      console.log(err);
     }
     //console.log(data);
     if(data != null)
     {
       res.send('0');
      }
     else {
      docregModel_main.findOne({email : req.body.email},function(err,data){
        if (err)
        {
          console.log(err);
        }
        //console.log(data);
        if(data != null)
        {
          res.send('0');
         }
        else {
         res.send('1');
        }
      });
     }
   });
 });

app.post('/forgot_password',function(req,res){
   patregModel_main.findOne({email : req.body.email },function(err,data){
     if (err)
     {
      console.log(err);
     }
     //console.log(data);
     if(data != null)
     {
      var unid = uuidv4();
      var forgpass = {
        name : data.name,
        username : data.username,
        role : data.role,
        unid : unid
      };
        var new_forgpass = new forgpassModel(forgpass);
        new_forgpass.save();
        var message = {
    from: 'medicully <noreply.medicully@gmail.com>',
    to: data.email,
    subject: 'PASSWORD RESET EMAIL',
    //text : 'hello'
    html :'<div style="border: 0.5px solid rgb(179,179,179);">\
    <p style="text-align:center;">\
        <img style="width: 225px;" src="cid:logo@medicully.ee" alt="logo"></p>\
    <div style="margin-left:40px;margin-right:40px;">\
    <div>\
      <h2 style="color: #29a329">PASSWORD RESET EMAIL</h2>\
      <p style="font-size: 18px;">Hello <b>'+ data.name +'</b>,</p>\
      <p style="text-indent:50px;">\
       Please click the below RESET button to reset your password.</p><br/>\
      <p style="text-align:center;">\
      <form style="text-align:center;" action="https://medicully.herokuapp.com/password_reset/'+ unid +'">\
      <input style="color: white;background-color: #29a329;padding: 10px" type="submit" value="RESET" />\
      </form>\
      </p>\
    </div>\
    </div>\
    </div>',
      attachments: [{
        filename: 'logo_light.PNG',
        path: 'https://medicully.herokuapp.com/public/logo_light.PNG',
        cid: 'logo@medicully.ee'
    }]
   };
   transporter.sendMail(message, function(err, resp){
    if(err)
    {
      console.log(err);
      res.send('ERROR IN SENDING MAIL..PLEASE TRY AGAIN');
    }
    else
    {
      console.log('EMAIL SENT');
      res.send('1');
    }
   });
      }
     else {
      docregModel_main.findOne({email : req.body.email},function(err,data){
        if (err)
        {
          console.log(err);
        }
        //console.log(data);
        if(data != null)
        {
         var unid = uuidv4();
      var forgpass = {
        name : data.name,
        username : data.username,
        role : data.role,
        unid : unid
      };
        var new_forgpass = new forgpassModel(forgpass);
        new_forgpass.save();
        var message = {
    from: 'medicully <noreply.medicully@gmail.com>',
    to: data.email,
    subject: 'PASSWORD RESET EMAIL',
    //text : 'hello'
    html :'<div style="border: 0.5px solid rgb(179,179,179);">\
    <p style="text-align:center;">\
        <img style="width: 225px;" src="cid:logo@medicully.ee" alt="logo"></p>\
    <div style="margin-left:40px;margin-right:40px;">\
    <div>\
      <h2 style="color: #29a329">PASSWORD RESET EMAIL</h2>\
      <p style="font-size: 18px;">Hello <b>'+ data.name +'</b>,</p>\
      <p style="text-indent:50px;">\
       Please click the below RESET button to reset your password.</p><br/>\
      <p style="text-align:center;">\
      <form style="text-align:center;" action="https://medicully.herokuapp.com/password_reset/'+ unid +'">\
      <input style="color: white;background-color: #29a329;padding: 10px" type="submit" value="RESET" />\
      </form>\
      </p>\
    </div>\
    </div>\
    </div>',
      attachments: [{
        filename: 'logo_light.PNG',
        path: 'https://medicully.herokuapp.com/public/logo_light.PNG',
        cid: 'logo@medicully.ee'
    }]
   };
   transporter.sendMail(message, function(err, resp){
    if(err)
    {
      console.log(err);
      res.send('ERROR IN SENDING MAIL..PLEASE TRY AGAIN');
    }
    else
    {
      console.log('EMAIL SENT');
      res.send('1');
    }
   });
         }
        else {
         res.send('0');
        }
      });
     }
   });
 });

app.post('/qsn_submit',function(req,res){
  sess = req.session;
  if(sess.type != undefined)
  {
   var postques = {
      name : sess.name,
      username : sess.username,
      date : date_crte(),
      post_as : sess.post_as,
      qsn : req.body.question,
      answs : []
    };
    var new_qsn = new quesModel(postques);
    new_qsn.save();
    res.redirect('/home');
  }
});

 app.post('/uname_check',function(req,res){
   patregModel_main.findOne({username : req.body.uname },function(err,data){
     if (err)
     {
      console.log(err);
     }
     //console.log(data);
     if(data != null)
     {
       res.send('0');
      }
     else {
      docregModel_main.findOne({username : req.body.uname},function(err,data){
        if (err)
        {
          console.log(err);
        }
        //console.log(data);
        if(data != null)
        {
          res.send('0');
         }
        else {
         res.send('1');
        }
      });
     }
   });
 });

  app.post('/forgpass_upd',function(req,res){
    if(req.body.role == 'patient')
    {
       patregModel_main.updateOne({username : req.body.username },{$set: { "password" : req.body.passnew}},function(err,data){
     if (err)
     {
      console.log(err);
     }
     //console.log(data);
     if(data != null)
     {
       res.send('1');
      }
     else {
      res.send('0');
     }
   });
    }
    else if(req.body.role == 'doctor')
    {
      docregModel_main.updateOne({username : req.body.username},{$set: { "password" : req.body.passnew}},function(err,data){
        if (err)
        {
          console.log(err);
        }
        //console.log(data);
        if(data != null)
        {
           res.send('1');
         }
        else {
         res.send('0');
        }
      });
    }
 });

app.post('/post_ques',function(req,res){
  sess = req.session;
  //console.log('inside');
  //console.log(sess.role);
  if(sess.name != undefined)
  {
    if(req.body.type == 1)
    {
      //console.log('inside type 1');
      sess.type = '1';
      sess.post_as = sess.name;
    }
    else {
      //console.log('inside type 0');
      sess.type = '0';
      sess.post_as = '*ANONYMOUS USER';
    }
    res.send('1');
  }
  else {
    res.send('0');
  }
});

app.get('/ans_sub/:oid',function(req,res){
  sess = req.session;
  if(sess.name != undefined)
  {
    //console.log(req.params.un);
    //console.log(req.params.dt);
    var ansr = {
      ans : req.query['answer'],
      ans_date : date_crte(),
      ans_by : sess.name,
      ans_by_username : sess.username,
      upvote_no : 0,
      downvote_no : 0
    };
    //console.log(ansr);
    quesModel.findOne({_id:req.params.oid},{_id:0,answs:1},function(err,data){
      if (err)
      {
        console.log(err);
      }
     // console.log(data.answs);
        data.answs.push(ansr);
       // console.log(data.answs);
        quesModel.updateOne({_id:req.params.oid},{$set: { "answs" : data.answs }},{upsert:false}, function(error, result){
          if(error)
          {
            console.log('error is ', error);
          }
          else {
            console.log('sucess');
            res.redirect('/qsn_answrs/'+req.params.oid);
          }
        });
    });
  }
  else {
    res.redirect('/home');
  }
});

app.get('/req_get',function(req,res){
  sess = req.session;
  if(sess.role != undefined)
  {reqModel.find({req_from:sess.username},{_id:0},function(err,data){
    if (err)
    {
      console.log(err);
    }
  //console.log(data);
      res.json(data);
  });
 }
  else {
    res.redirect('/home');
  }
});

app.get('/my_profile',function(req, res){
   sess = req.session;
   //console.log('hom here');
   if(sess.name!= undefined)
    {
      res.render('myprofile_page',{name : sess.name,role:sess.role,username:sess.username,pic_path:sess.pic_path});
    }
   else
   res.render('index');
 });

app.get('/my_profile/info',function(req,res){
  sess = req.session;
  if(sess.role == 'doctor')
  {
    docregModel_main.findOne({username:sess.username},{_id:0},function(err,data){
    if (err)
    {
      console.log(err);
    }
  //console.log(data);
    if(data != null)
    {
      res.json(data);
    }
  });
  }
  else if(sess.role == 'patient')
  {
    patregModel_main.findOne({username:sess.username},{_id:0},function(err,data){
    if (err)
      {
      console.log(err);
    }
  //console.log(data);
    if(data != null)
    {
      res.json(data);
    }
  });
  }
  else {
    res.redirect('/home');
  }
});

app.get('/my_profile/qsns_asked',function(req,res){
  sess = req.session;
  if(sess.role != undefined)
  {
    quesModel.find({username:sess.username},function(err,data){
    if (err)
      console.log(err);
      res.json(data);
  });
  }
  else {
    res.redirect('/home');
  }
});

app.get('/my_profile/qsns_answered',function(req,res){
  sess = req.session;
  if(sess.role != undefined)
  {
    quesModel.find({"answs.ans_by_username":sess.username},function(err,data){
    if (err)
      console.log(err);
  //console.log(data);
      res.json(data);
  });
  }
  else {
    res.redirect('/home');
  }
});

app.get('/my_profile/request_info',function(req,res){
  sess = req.session;
  var data = [];
  if(sess.role != undefined)
  {
    reqModel.find({req_to:sess.username,status : '1'},{_id:0},function(err,dat){
    if (err)
      console.log(err);
    else
    {
      data[0] = dat;
      reqModel.find({req_from:sess.username,status : '1'},{_id:0},function(err,dat2){
    if (err)
      console.log(err);
    else
    {
      data[1] = dat2;
    }
      res.json(data);
  });
    }
  });
  }
  else {
    res.redirect('/home');
  }
});

app.post('/update_picture',function(req,res){
  sess = req.session;
  if(sess.role == 'doctor')
  {
   upload2(req,res,function(err){
    if(err)
      console.log(err);
    else
    {
      var file = req.file.filename;
      if(sess.pic_path == '/public/doctor.PNG')
      {

      docregModel_main.updateOne({username:sess.username},{$set: { "pic_path" : '/uploads_profile/'+ file }},{upsert:false}, function(err2, result){
         if(err2)
        {
          console.log(err2);
        }
        else
        {
         sess.pic_path = '/uploads_profile/'+ file;
         res.redirect('/my_profile');
        }
       });
      }
       else
       {
      docregModel_main.updateOne({username:sess.username},{$set: { "pic_path" : '/uploads_profile/'+ file }},{upsert:false}, function(err2, result){
         if(err2)
        {
          console.log(err2);
        }
        else
        {
          fs.unlink('./assets'+sess.pic_path, function(error){
          if (error){
            console.log(error);
          }
          sess.pic_path = '/uploads_profile/'+ file;
          res.redirect('/my_profile');
        });
        }
       });
     }
    }
   });
  }
  else if(sess.role == 'patient')
  {
   upload2(req,res,function(err){
    if(err)
      console.log(err);
    else
    {
      var file = req.file.filename;
      if(sess.pic_path == '/public/person.jpg')
      {
      patregModel_main.updateOne({username:sess.username},{$set: { "pic_path" : '/uploads_profile/'+ file }},{upsert:false}, function(err2, result){
         if(err2)
        {
          console.log(err2);
        }
        else
        {
         sess.pic_path = '/uploads_profile/'+ file;
         res.redirect('/my_profile');
        }
       });
      }
       else
       {
          patregModel_main.updateOne({username:sess.username},{$set: { "pic_path" : '/uploads_profile/'+ file }},{upsert:false}, function(err2, result){
         if(err2)
        {
          console.log(err2);
        }
        else
        {
          fs.unlink('./assets'+sess.pic_path, function(error){
          if (error){
            console.log(error);
          }
          sess.pic_path = '/uploads_profile/'+ file;
          res.redirect('/my_profile');
        });

        }
       });

    }
    }
   });
  }
  else
  {
    res.redirect('/home');
  }
});

app.get('/picpath/:un',function(req,res){
  docregModel_main.findOne({username : req.params.un},function(err,result){
    if(err)
    {
      console.log(err);
    }
    else if(result != null)
    {
      var path_is = result.pic_path;
      res.json(path_is);
    }
    else
    {
      patregModel_main.findOne({username : req.params.un},function(err,result){
        if(err)
        {
          console.log(err);
        }
        else
        {
         var path_is = result.pic_path;
          res.json(path_is);
        }
      });
    }
  });
});

app.post('/update_password',function(req,res){
  sess = req.session;
  if(sess.role == 'doctor')
  {
   docregModel_main.findOne({username:sess.username,password:req.body.passold}, function(error, result){
       if(error)
        {
          console.log(error);
        }
       else if(result == null)
       {
         res.send('0');
       }
       else {
         docregModel_main.updateOne({username:sess.username,password:req.body.passold},{$set: { "password" : req.body.passnew }},{upsert:false}, function(err, result){
         if(err)
        {
          console.log(err);
        }
         res.send('1');
       });
       }
     });
  }
  else if(sess.role == 'patient')
  {
   patregModel_main.findOne({username:sess.username,password:req.body.passold}, function(error, result){
       if(error)
        {
          console.log(error);
        }
       else if(result == null)
       {
         res.send('0');
       }
       else {
         patregModel_main.updateOne({username:sess.username,password:req.body.passold},{$set: { "password" : req.body.passnew }},{upsert:false}, function(err, result){
         if(err)
        {
          console.log(err);
        }
         res.send('1');
       });
       }
     });
  }
  else {
    res.redirect('/home');
  }
});

app.get('/qsn_answrs/:oid',function(req,res){
  sess = req.session;
  if(sess.role != undefined)
  {
    res.render('ans_page',{name : sess.name,role:sess.role,username:sess.username,pic_path:sess.pic_path,oid : req.params.oid});
  }
  else {
    res.redirect('/home');
  }
});

app.get('/answs/:oid',function(req,res){
  sess = req.session;
 // console.log('heyyy');
  if(sess.role != undefined)
  {
    quesModel.findOne({_id:req.params.oid},function(err,data){
    if (err) throw err;
  //console.log(data);
      res.json(data);
  });}
  else {
    res.redirect('/home');
  }
});

app.get('/prof_page/:un',function(req,res){
  sess = req.session;
  if(sess.role != undefined && sess.username != req.params.un)
  {
    res.render('profile_page',{name : sess.name,role:sess.role,username:sess.username,pic_path:sess.pic_path,un : req.params.un});
  }
  else if(sess.role != undefined && sess.username == req.params.un)
  {
    res.redirect('/my_profile');
  }
  else {
    res.redirect('/home');
  }
});

app.get('/get_type/:un',function(req,res){
  sess = req.session;
 // console.log('heyyy');
  if(sess.role != undefined)
  {
    reqModel.findOne({req_to:req.params.un,req_from:sess.username},function(err,data){
    if (err)
      {
        console.log(err);
      }
  //console.log(data);
      res.json(data);
  });}
  else {
    res.redirect('/home');
  }
});

app.get('/profile/:un',function(req,res){
  sess = req.session;
 // console.log('heyyy');
  if(sess.role != undefined)
  {
    docregModel_main.findOne({username:req.params.un},function(err,data){
    if (err)
    {
      console.log(err);
    }
    else if(data != null)
    {
      res.json(data);
    }
    else
    {
      patregModel_main.findOne({username:req.params.un},function(err,data){
        if(err)
          console.log(err);
        else
        {
          res.json(data);
        }
      });
    }
  });}
  else {
    res.redirect('/home');
  }
});

app.get('/detupd/:name/:mobile/:donor/:bloodgrp',function(req,res){
  sess = req.session;
  if(sess.role == 'doctor')
  {
         docregModel_main.updateOne({username:sess.username},{$set: { "name" : req.params.name,"mobile" : req.params.mobile,"donor":req.params.donor,"bloodgrp":req.params.bloodgrp }},{upsert:false}, function(err, result){
         if(err)
        {
          console.log(err);
          res.send('0');
        }
        else
        {
         res.send('1');
        }
     });
  }
  else if(sess.role == 'patient')
  {
         patregModel_main.updateOne({username:sess.username},{$set: {"name" : req.params.name,"mobile" : req.params.mobile,"donor":req.params.donor,"bloodgrp":req.params.bloodgrp }},{upsert:false}, function(err, result){
         if(err)
        {
          console.log(err);
          res.send('0');
        }
        else
        {
         res.send('1');
        }
       });
  }
  else {
    res.redirect('/home');
  }
});

};






//extra code

// sendmail({
//     from: 'noreply.medicully@gmail.com',
//     to: req.params.em,
//     subject: 'Email Verification',
//     html: 'hehe',
//     '<!DOCTYPE html>\
//       <html>\
//       <head>\
//         <meta charset="utf-8">\
//         <meta name="viewport" content="width=device-width, initial-scale=1">\
//           <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">\
//           <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">\
//           <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>\
//           <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js"></script>\
//           <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"></script>\
//         <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">\
//       </head>\
//       <body>\
//         <p style="text-align:center;"><img src="/public/logo_light.PNG" alt="logo"></p>\
//         <div class="card" style="margin-left:40px;margin-right:40px;">\
//         <div class="card-body">\
//           <h2 style="text-align:center;">Email Address Verification</h3><br/>\
//           <h3 class="card-title">Hello '+ req.params.nm +'</h3><br/>\
//           <pre class="card-text">         Welcome to MEDICULLY. To verify your email address, please click the below verify button.</pre><br/>\
//           <a href="/verify/" class="btn btn-success">VERIFY</a>\
//         </div>\
//       </div>\
//       </body>\
//       </html>',
//   }, function(err, reply) {
//     if(err)
//     {
//       console.log(err && err.stack);
//       console.dir(reply);
//     }
//     else
//     res.render('email_validation');
// });

//   }
//   else
//   {
//    res.redirect('/home');
//   }
