var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var dbUrl = 'mongodb://localhost:27017/boatingproject';
var User= require('./userSchema');
const nodemailer = require("nodemailer");
var randomstring= require('randomstring');

//Verification Mail
function sendVerificationMail(user){
  async function main(){

    let testAccount = await nodemailer.createTestAccount();
    console.log(user.username);
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'TahaBohra', 
        pass: '@Letmein786' 
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Boating Service" <mrmunir235@gmail.com>', // sender address
      to: user.username, // list of receivers
      subject: "Please Verify Your Email Address ! ✔", // Subject line
      html: `<h1>Welcome ${user.firstName} </h1><p> We are glad to have you with us.<br>
       Please enter the following verification code in order to verify your account:<br>
       <b>${user.secretToken}</b> <br>
       Have a nice day !
       `
    });

    console.log("SENT MAIL !");
    
  }

  main().catch(console.error);

}

//Reset Mail
function sendResetMail(user){
  async function main(){
  
    let testAccount = await nodemailer.createTestAccount();
    console.log(user.username);
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'TahaBohra', 
        pass: '@Letmein786' 
      }
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Boating Service" <mrmunir235@gmail.com>', // sender address
      to: user.username, // list of receivers
      subject: "Password reset Instructions !", // Subject line
      html: `<h1>Hello ${user.firstName} </h1><p> It looks like you requested to reset your password.<br>
       Please enter the following verification code in order to reset your password:<br>
       <b>${user.secretToken}</b> <br>
       Have a nice day !
       `
    });
  }
  main().catch(console.error);
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/test', function(req, res, next) {
  var post_data=req.body
  var xyz=post_data.test
  var a=post_data.asd
  console.log(a)
  console.log(xyz)
  //connect with DB
  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
    //create new object of above User model
    if(err){
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    }
    else{
          
          var user=new User({'firstName':xyz,'lastName':a});
            
            console.log("NAME IN SIGN UP : "+user.firstName);
            
            //save it
            user.save();
      
  }});
  
});



//Create Account Route
router.post('/signup',function(req,res,next){
  console.log("====================================SIGN UP REQUEST !!!!")
  //fetch values from request
  var post_data=req.body;
  var usrnm=post_data.username;
  var passwd=post_data.password;
  var firstName=post_data.firstName;
  var lastName=post_data.lastName;
  var dob=post_data.dob;
  var gender=post_data.gender;
  
  //connect with DB
  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
  //create new object of above User model
  if(err){
    console.log("Error in communicating with database");
    return res.json("Error in communicating with database");
  }
  else{
    User.findOne({'username':usrnm},function(err,data){

      if(err){
        throw err;
      }
      else{
        if(data===null)
        {
          var secretToken=randomstring.generate();
          //Create User and assign secret token and set it inactive as well
          var user=new User({'firstName':firstName,'lastName':lastName,'username':usrnm,'password':passwd,'dob':dob, 'gender':gender });
          user.secretToken=secretToken;
          user.active=false;
          
          console.log("NAME IN SIGN UP : "+user.firstName);
          
          //save it
          user.save(function(err,usrr){
          if(err){
            console.log("Error while creating your account.");
            return res.json("Error while creating your account.");
          }
          else{
            sendVerificationMail(user);
           
            console.log("Verification email sent.");
            return res.json("Sign up successfull. Please check your email for verification code.");
          }
        });
        }
        else{
          console.log("Already Registered.");
          return res.json("Already registered.");
        }
      }


    });
    
}});
});

router.post('/login',function(req,res,next){
  
  //fetch values from request
  var post_data=req.body;
  var usrnm=post_data.username;
  var passwd=post_data.password;
  console.log("Data"+post_data);
  console.log("Username: "+usrnm+" Password: "+passwd);

  //connect with DB
  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
  //create new object of above User model
  if(err){
    console.log("Error in communicating with database");
    return res.json("Error in communicating with database");
  }
  else{
    User.findOne({'username':usrnm,'password':passwd},function(err,data){
      if(err){
        throw err; 
      }
      else{
        if(data===null){
          var respondWithJson={
            'message':"Invalid Username/Password Combination."
          }
            console.log("Incorrect Username/Password combination.");
            return res.json(respondWithJson);    
        }else{
    
              if(data.active){
                  console.log("Login Successfull.");
                  var objid=data.id;
                  var parentName=data.firstName;
                  
                  var respondWithJson={
                    'id':objid,
                    'Name':parentName,
                    'message':"Login Successfull."
                  }
                  console.log("Name of logged in user:"+respondWithJson.parentName);
                  return res.json(respondWithJson);       
              }
              else{
                  console.log("Account not activated yet/Email not verified yet.");
                  return res.json("Please verify your email first.");
              }
        }
      }
      }
    );
}});
});

//Verify Email Route
router.post('/verifyEmail',function(req,res,next){

  //fetch values
  var post_data=req.body;
  var usrnm=post_data.username;
  var secretToken=post_data.secretToken;

  mongoose.connect(dbUrl,{useNewUrlParser: true}, function(err){
    if(err){
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    }else{
      User.findOne({'username':usrnm,'secretToken':secretToken},function(err,data){
       
        if(err){
          throw err; 
        }
        else{
          if(data===null){
              console.log("Invalid Username / Verification Code Combination.");
              return res.json("Invalid Username / Verification Code Combination.");    
          }else{
            data.secretToken=randomstring.generate();
            data.active=true;
            data.save(function(err,usrr){
              if(err){
                console.log("Error while verifying your account.");
                return res.json("Error while verifying your account.");
              }
              else{
                console.log("Verification Successful.");
                return res.json("Verification Successful.");
              }
            });   
          }
      }});
    }
  });

});


//Generate Forget Password Email
router.post('/forgetPassword',function(req,res,next){
  //fetch values from request
  var post_data=req.body;
  var usrnm=post_data.username;
  //connect with DB
  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
  //create new object of above User model
  if(err){
    console.log("Error in communicating with database");
    return res.json("Error in communicating with database");
  }
  else{
    User.findOne({'username':usrnm},function(err,user){

      if(err){
        throw err;
      }
      else{
        if(user===null)
        {
          console.log("Email not registered.");
          return res.json("Email not registered.");
        }
        else{
          
          var secretToken=randomstring.generate();
         
          user.secretToken=secretToken;
          console.log(user.firstName);

          //save it
          user.save(function(err,usrr){
          if(err){
            console.log("Error while sending email.");
            return res.json("Error while sending email.");
          }
          else{
            sendResetMail(user);
            console.log("Please Check your email for reset code code.");
            return res.json("Please Check your email for reset code.");
          }
        });
        }
      }


    });
    
}});
});

//Reset Pass
router.post('/resetForgotPassword',function(req,res,next){
  
  //fetch values from request
  var post_data=req.body;
  var usrnm=post_data.username;
  var secretToken=post_data.secretToken;
  var NewPassword=post_data.newPassword;
  
  //connect with DB
  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
  //create new object of above User model
  if(err){
    console.log("Error in communicating with database");
    return res.json("Error in communicating with database");
  }
  else{

    User.findOneAndUpdate({'username':usrnm,'secretToken':secretToken},{'password':NewPassword},function(err,data){
      if(err){
        throw err; 
      }
      else{
        if(data===null){
          console.log("Invalid Username / Verification Code !");
         return res.json("Invalid Username / Verification Code !");    
        }else{
          var secretToken=randomstring.generate();
          data.secretToken=secretToken;
          data.save()
          console.log("Password Reset Successfully");
          return res.json("Password Reset Successfully");
        }
      }
      }

    );

}});
});


router.post('/getProfile',function(req,res,next){
  
  //fetch values from request
  var post_data=req.body;
  var usrnm=post_data.id;
  console.log("Data"+post_data);
  console.log("Username: "+usrnm);

  //connect with DB
  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
  //create new object of above User model
  if(err){
    console.log("Error in communicating with database");
    return res.json("Error in communicating with database");
  }
  else{
    User.findOne({'_id':usrnm},function(err,data){
      if(err){
        throw err; 
      }
      else{
        if(data===null){
          var respondWithJson={
            'message':"Cannot find user with username: "+usrnm
          }
            console.log("Error finding user with username : "+usrnm);
            return res.json(respondWithJson);    
        }else{
                console.log("Found USER !!!!!!");
                
                
                console.log("USER DETAILS: "+data);
                return res.json(data);       
              
        }
      }
      }
    );
}});
});

module.exports = router;
