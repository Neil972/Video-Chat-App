let express = require('express')
let socketIO=require('socket.io')
let app = express()
let httpServer=require('http').createServer(app)

// Set CORS headers manually for all HTTP routes
// app.use((req, res, next) => {

//   console.log('setting cors for :',req.url)
//   res.header('Access-Control-Allow-Origin', 'https://super-adventure-p55qxx57w7jf49p-3000.app.github.dev'); // front-end URL
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
  
  
//     console.log('cors setup successfull')
//     next();
  
// });


let io= socketIO(
  httpServer,
  {
    cors:{
      origin:'*',
      methods:['GET','POST'],
      credentials:true
    },
    transport:['polling','websocket']
  },
)

const PORT=5000

httpServer.listen(PORT,()=>{
    console.log(`httpserver listening to${PORT}` )
})

io.on('connection',(socket)=>{
socket.emit('id',socket.id)
console.log('socket.id',socket.id)


  socket.on('message',(messageObj)=>{
    if(messageObj.recieverID.length>1){
    socket.to(messageObj.recieverID).emit('messageSent',messageObj)
    console.log('messageObj',messageObj)
    }
    else{
        socket.broadcast.emit('messageSent',messageObj)
        console.log('broadcastMessage',messageObj)
    }
  })

  socket.on('callingUser',(callInfo)=>{
    console.log('callInfo',callInfo)
    io.to(callInfo.recieverID).emit('callingUser',{callsdpData:callInfo.callsdpData,callerID:callInfo.callerID})
  })

  socket.on('answeringCall',(recieveInfo)=>{
    io.to(recieveInfo.callerID).emit('callAnswered',{recievesdpData:recieveInfo.recievesdpData})
  })

})
