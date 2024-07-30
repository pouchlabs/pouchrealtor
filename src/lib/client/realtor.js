import WebSocket from "isomorphic-ws";
import EventEmitter from "eventemitter3";
import { encode} from "@msgpack/msgpack";
import { checktype,decodeFromBlob } from "../utils/index.js"; 
import isOnline from "is-online";
import { nanoid } from "nanoid";


let Emmiter = new EventEmitter();
let id = nanoid(16);
//checknet 
async function checkNet(cb){
  if(await isOnline()){
    return cb('online');
  }else{
   return cb('offline');
  }
}

//wsURL - the string URL of the websocket
//waitTimer - the incrementing clock to use if no connection made
//waitSeed - used to reset the waitTimer back to default on a successful connection
//multiplier - how quickly you want the timer to grow on each unsuccessful connection attempt

const openSocket = (wsURL, waitTimer, waitSeed, multiplier,id) =>{
  let ws = new WebSocket(wsURL)
  ws.onerror = () => {
  
    //increaese the wait timer if not connected, but stop at a max of 2n-1 the check time
    if(waitTimer < 60000) waitTimer = waitTimer * multiplier; 
    Emmiter.emit('custom_error',`error opening connection ${ws.url}, next attemp in : ${waitTimer/1000} seconds`); 
    setTimeout(()=>{openSocket(ws.url, waitTimer, waitSeed, multiplier)}, waitTimer);
  }
 Emmiter.emit('connecting') 
  ws.onopen = () => {
    //todo
   
      waitTimer = waitSeed; //reset the waitTimer if the connection is made
      ws.send(encode({event:'set_id',id}))
     let timer = setTimeout(()=>{
      Emmiter.removeListener('connecting')
      Emmiter.emit('connected')
       clearTimeout(timer)
       Emmiter.removeListener('connected')
     },waitSeed)
     ws.onmessage=async (msg)=>{
      Emmiter.emit('custom_msg',msg.data)
     }
      ws.onclose = () => {
        ws.close() 
        Emmiter.emit('close',`connection closed to: ${ws.url}`)
        openSocket(ws.url, waitTimer, waitSeed, multiplier);
      };  
  };
  return ws
}

function CreateClient(uri){
 let validurl; 
 let regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
if( regex.test(uri) && uri.length > 0){
  validurl = uri;
let client = {};
client.id=id;
let ws = openSocket(validurl, 1000, 1000, 2,id)  
  //listener
  client.on = (ev,cb)=>{
    if(ev && typeof ev === 'string' && cb && typeof cb === 'function'){

        Emmiter.on('custom_msg',async (msg)=>{
        let {event,data} = await decodeFromBlob(msg);
        //check match
        if(ev === event){
          //Emmiter.removeListener('message')
          return cb(data)
        }
    })
  }
  }
  //emitter
  client.emit = function(ev,data,cb){ 
     if(ev && typeof ev === 'string' && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
      //little trick
       if (ws.readyState === ws.OPEN) {  
        //ready to send 
        if(!ws.send) return;
         ws.send(encode({event:ev,data:data}))
          return cb({iserror:false,msg:'success'})
       }else{
       return cb({iserror:true,msg:'not sent'})
       }
    } 
  }  
  //helper methods
  client.onError = async (cb)=>{
    if(cb && typeof cb === 'function' ){
      Emmiter.once('custom_error',(res)=>{
        return cb(res)
      })
    }
  }

  client.onConnecting = async (cb)=>{
    if(cb && typeof cb === 'function' ){
      Emmiter.on('connecting',()=>{
        return cb()
      })
    }
    
  }
  //
  client.onConnected =  async (cb)=>{
    if(cb && typeof cb === 'function' ){
      Emmiter.on('connected',()=>{ 
        return cb() 
      }) 
    } 
  }
  client.onClose =  async (cb)=>{
    if(cb && typeof cb === 'function' ){
      Emmiter.on('close',(res)=>{
        return cb(res)
      })
    } 
  }
  client.checkNet = checkNet
  return client
}
}

export{
  CreateClient
}


