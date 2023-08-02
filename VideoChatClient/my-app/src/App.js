import logo from './logo.svg';
import './App.css';
import React from 'react'
import {io} from 'socket.io-client'
import Peer from 'simple-peer'

let socket=io('https://video-w1np.onrender.com')

class App extends React.Component{
 constructor(props){
  super(props)
  this.state={sent:"",recieved:"",yourID:'',recieverID:'',stream:'',callerSignal:''}
  this.updtSnt=this.updateSent.bind(this)
  this.updtRcvrID=this.updateRecieverID.bind(this)
  this.sndMsg=this.sendMessage.bind(this)
  this.getVid=this.getVideo.bind(this)
  this.call=this.callUser.bind(this)
  this.answer=this.answerUser.bind(this)
  this.clientVidRef=React.createRef(null)
  this.recieverVidRef=React.createRef(null)
  }
  componentDidMount(){
    // listening for 'id' event
    socket.on('id',(grantedID)=>{
      this.setState({yourID:grantedID})
    })

    //listening for 'message' event
    socket.on('messageSent',(recievedObj)=>{
      this.setState({recieved:recievedObj.message})
      console.log('recievedObj',recievedObj)
    })
    
    //sets up caller sdp as a state for reciever
    socket.on('callingUser',(callerSDP)=>{
    this.setState({callerSignal:callerSDP.callsdpData})
    })

    //this.answerUser()
  }
  /*
  componentDidUpdate(){
    socket.on('messageSent',(recievedObj)=>{
      this.setState({recieved:recievedObj.message,recieverID:recievedObj.recieverID})
      console.log('recievedObj',recievedObj)
    })
  }*/
  updateSent(event){
   this.setState((argState)=>{
    argState.sent=event.target.value
    return argState.event
   })

   console.log('this.state.sent',this.state.sent)
  }
  
  updateRecieverID(event){
    this.setState((argState)=>{
      argState.recieverID=event.target.value
      return argState.recieverID
    })
    console.log('RecieverID',this.state.recieverID)
  }
  sendMessage(event){
    event.preventDefault()
   
    socket.emit('message',{recieverID:this.state.recieverID,message:this.state.sent})
    console.log('message',{recieverID:this.state.recieverID,message:this.state.sent})
   
  } 
  //for accessing the user webcam
  getVideo(){
    navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((prsnlStream)=>{
      this.clientVidRef.current.srcObject=prsnlStream
      this.setState((argState)=>{
        argState.stream=prsnlStream
      })
      this.clientVidRef.current.onloadedmetadata=()=>{
        this.clientVidRef.current.play()
      }
    }).catch((error)=>{
      console.log(error)
      return console.error(error)
    })
  } 
  callUser(){
    let peer=new Peer({initiator:true,trickle:false,stream:this.state.stream})
    
    peer.on('signal',(sdpData)=>{
      socket.emit('callingUser',{recieverID:this.state.recieverID,callsdpData:sdpData})
    })

    peer.on('stream',(stream)=>{
      this.recieverVidRef.current.srcObject=stream
      this.recieverVidRef.current.onloadedmetadata=()=>{
        this.recieverVidRef.current.play()
      }
    })
    //takes the reciever sdp and sets up the call
    socket.on('callAnswered',(signal)=>{
      peer.signal(signal.recievesdpData)
    })
  }
  answerUser(){
    let peer = new Peer({initiator:false,trickle:false,stream:this.state.stream})

    peer.on('signal',(sdpData)=>{
      socket.emit('answeringCall',{callerID:this.state.recieverID,recievesdpData:sdpData})
    })

    peer.on('stream',(stream)=>{
     this.recieverVidRef.current.srcObject=stream
     this.recieverVidRef.current.onloadedmetadata=()=>{
      this.recieverVidRef.current.play()
     }
    })
    //takes the caller sdp and sets up the call
    peer.signal(this.state.callerSignal)
  }
  render(){
    return(
      <div className='App'>
        <h1>Hi!</h1>
        <h1>yourID:{`${this.state.yourID}`}</h1>
        <h2><label for='txtArs'>Sent</label></h2>
        <h2><textarea id='txtArS' onChange={this.updtSnt}></textarea></h2>
        <p>
          <h3><label for='rcvrID'>Reciever's ID</label></h3>
          <input id='rcvrID' type='text' onChange={this.updtRcvrID}/>
        </p>
        <p><input type='button' value='Send-Message' onClick={this.sndMsg}/></p>
        <h2><label for='txtArR'>Recieved</label></h2>
        <h2>{`${this.state.recieved}`}</h2>
        <h3></h3>
        <p>
          <video ref={this.clientVidRef}>

          </video>

          <video ref={this.recieverVidRef}></video>

          <p>
          <input type='button' value='allowVideoCamera' onClick={this.getVid}/>
          </p>
          <h5>Both parties should exchange the random assigned Id's <br/> before calling and answering</h5>
          <p>
            <input type='button' value='call' onClick={this.call}/>
          </p>
          <p>
            <input type='button' value='answer' onClick={this.answer}/>
          </p>
        </p>
      </div>
    )
  }
} 
/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}*/

export default App;
