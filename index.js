var express = require('express');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var app = express();
var controller = require('./Controllers/controllers.js');
const PORT = process.env.PORT || 3000;

var store = new MongoDBStore({
  uri: 'mongodb://saiteja:puppala123@ds259778.mlab.com:59778/medicully',
  collection: 'mySessions'
});

store.on('connected', function() {
  store.client; // The underlying MongoClient object from the MongoDB driver
});
 
// Catch errors
// store.on('error', function(error) {
//   assert.ifError(error);
//   assert.ok(false);
// });

app.set('view engine','ejs');
app.use(express.static('./assets'));
app.use(session({
  secret: 'ssshhh_secretkeyishere',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  saveUninitialized:false,
  resave:true
 })
);

controller(app);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
