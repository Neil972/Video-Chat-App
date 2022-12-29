let express = require('express')
let socketIO=require('socket.io')
let app = express()
let httpServer=require('http').createServer(app)

let io= socketIO(httpServer,
    {
    cors:{origin:'*',methods:['GET','POST']}
    }
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
    io.to(callInfo.recieverID).emit('callingUser',{callsdpData:callInfo.callsdpData})
  })

  socket.on('answeringCall',(recieveInfo)=>{
    io.to(recieveInfo.callerID).emit('callAnswered',{recievesdpData:recieveInfo.recievesdpData})
  })

})
