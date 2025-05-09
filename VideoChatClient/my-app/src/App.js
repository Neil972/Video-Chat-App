import logo from './logo.svg';
import './App.css';
import React from 'react'
import {io} from 'socket.io-client'
import Peer from 'simple-peer'

let socket=io('https://video-w1np.onrender.com')
// let socket=io('https://super-adventure-p55qxx57w7jf49p-5000.app.github.dev/')

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
      this.setState((currState)=>{
        currState.callerSignal=callerSDP.callsdpData
        return currState.callerSignal
      })

      this.setState((currState)=>{
        currState.recieverID=callerSDP.callerID
        return currState.recieverID
      })
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
    return argState.sent
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
      socket.emit('callingUser',{recieverID:this.state.recieverID,callsdpData:sdpData,callerID:this.state.yourID})
    })

    peer.on('stream',(stream)=>{
      this.recieverVidRef.current.srcObject=stream
      this.recieverVidRef.current.onloadedmetadata=()=>{
        this.recieverVidRef.current.play()
      }
    })
    //takes the reciever sdp and sets up the call
    socket.on('callAnswered',(signal)=>{
      console.log('callAnswered',signal.recievesdpData)
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
          <div 
            style={{
              display:"flex",
              justifyContent:"space-between",
              flexWrap:"wrap",
              padding:"10px"
            }}>
            <div 
              className='avatar air'
              onClick={
                async ()=>{
                  try {
                    let copiedText= await navigator.clipboard.writeText(this.state.yourID??'')
                  } catch (error) {
                    console.error(error)
                  }
                }
              }
            >
              <div className='tooltip ripple'>
                <h4>Hi!!</h4>
                <span class="tooltiptext">{`${this.state.yourID}`}</span>
              </div>
            </div>
            <div 
              style={{
                display:"flex",
                justifyContent:"space-between",
                gap:"15px",
                alignItems:"center",
                flexWrap:"wrap"
              }}
            >
              {/* <h3><label for='rcvrID'>Reciever's ID</label></h3> */}
              
              <input type='button' value='call' onClick={this.call} style={{height:"30px"}}/>
              
              <input
                id='rcvrID'
                type='text' onChange={this.updtRcvrID} placeholder="Enter Reciever's ID"
                style={{
                  height: "30px"
                }}
              />
            </div>
          </div>
          <div>
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
                <input type='button' value='answer' onClick={this.answer} disabled={this.state.callerSignal === ''}/>
              </p>
            </p>
            {/* <h2><label for='txtArs'>Type here</label></h2> */}
            <h2
              style={{
                width:"80%",
                margin:"auto"
              }}
            >
              <textarea 
                id='txtArS' 
                placeholder='Type your message'
                style={{
                  height:"20vh",
                  width:"100%"
                }} 
              onChange={this.updtSnt}></textarea>
              <div
              style={{
                display:"flex",
                justifyContent:"flex-end",
                width:"100%",
                position:"relative",
                bottom:"38px",
                zIndex:"2",
              }}>
              <input 
                type='button' 
                value='Send-Message' 
                onClick={this.sndMsg} 
              />

              </div>
            </h2>
          </div>
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
