var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser=require("body-parser");
var db = mongoose.connection;
var Schema = mongoose.Schema;
var dbUrl = 'mongodb://localhost:27017/boatingproject';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var ChatSchema= Schema({
  sendername:String,
  sentDate:String,
  recievername:String,
  roomID:String,
  message:String 
});

var Chat = mongoose.model('Chat', ChatSchema);
router.post('/chat',function(req,res,next){
  var post_data=req.body;
  // Get room id from request
  var getRoomID=post_data.roomID;
  console.log(post_data);
  console.log("RoomID: "+getRoomID );

  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
    if(err){
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    }
    else{
      Chat.find({'roomID':getRoomID},function(err,data){
        if(err){
          throw err;
        }else{
          if(data!==null){
          console.log(data);
          return res.json(data);
        }
      
        }
      });
  
  }});
});

module.exports = function(io) {
io.on('connection', function(socket) { 
    
    socket.on('room',function(roomID){
      socket.join(roomID);
   });
    socket.on('messagedetection', function(roomIDrec,senderNickname,SDate,recievername,message){
      socket.join(roomIDrec);
      console.log(message);
      var roomID1=roomIDrec;
      mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
        if(err){
          console.log("Error in communicating with database");
          return res.json("Error in communicating with database");
        }
        else{
          var chat=new Chat({
            'roomID':roomID1,
            'sendername':senderNickname,
            'sentDate':SDate,
            'recievername':recievername,
            'message':message

         });
          chat.save();
          console.log("added " +roomID1+"/n");
      }
    });
      console.log();
    //socket.emit("message",{senderNickname:senderNickname,message:message} );
    socket.to(roomID1).emit("message",{'senderNickname':senderNickname,'recievername':recievername,'message':message,'sentDate':SDate} );
   
     console.log("helo");
    });
  
  });
  


  return router;
}