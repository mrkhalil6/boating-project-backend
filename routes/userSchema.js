var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    firstName:String,
    lastName:String,
    username: String,
    password: String,
    dob: Date,
    gender:String,
    secretToken: String,
    active: Boolean,
    
  });
  module.exports = mongoose.model('User', UserSchema);
 