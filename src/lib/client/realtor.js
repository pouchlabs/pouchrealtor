import WebSocket from "isomorphic-ws";
import EventEmitter from "eventemitter3";
import { encode} from "@msgpack/msgpack";
import { checktype,decodeFromBlob } from "../utils/index.js"; 
import isOnline from "is-online";
import { BROWSER } from "esm-env";
import { nanoid } from "nanoid";
let Emmiter = new EventEmitter();
//checknet 
async function checkNet(cb){
  if(await isOnline()){
    return cb('online');
  }else{
   return cb('offline');
  }
}
async function init(){
 if(BROWSER){
//
 let item = JSON.parse(localStorage.getItem("socket_id"));
 if(item){
   return item
 }else{
  let newitem = {
    device_id:nanoid(),
    is_browser:true,
  }
  
  localStorage.setItem("socket_id",JSON.stringify(newitem))
  return newitem
 }
 }else{
  //node
  const os = await import("os")
  const path = await import("path")
   const storage = (await import("node-persist")).default;
   await storage.init({
    dir: path.join(os.homedir(),"/.realtor"),
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    // can also be custom logging function
    logging: false,  
    // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS or a valid Javascript Date object
    ttl: false,
    // every 2 minutes the process will clean-up the expired cache
    expiredInterval: 2 * 60 * 1000, 
  
      // in some cases, you (or some other service) might add non-valid storage files to your
      // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
      forgiveParseErrors: false,
    
    // instead of writing to file immediately, each "file" will have its own mini queue to avoid corrupted files, keep in mind that this would not properly work in multi-process setting.
    writeQueue: true, 
    
    // how often to check for pending writes, don't worry if you feel like 1s is a lot, it actually tries to process every time you setItem as well
    writeQueueIntervalMs: 1000, 
    
    // if you setItem() multiple times to the same key, only the last one would be set, BUT the others would still resolve with the results of the last one, if you turn this to false, each one will execute, but might slow down the writing process.
    writeQueueWriteOnlyLast: true, 
  });

    if(await storage.getItem("socket_id")){
      let soc = await storage.getItem("socket_id") 
     return soc
    }
    //save
    let newsoc={
      device_id:nanoid(),
      device_name:os.userInfo().username,
      is_node:true,
    }
    storage.setItem("socket_id",newsoc)
    return newsoc
 }

 

}


//wsURL - the string URL of the websocket
//waitTimer - the incrementing clock to use if no connection made
//waitSeed - used to reset the waitTimer back to default on a successful connection
//multiplier - how quickly you want the timer to grow on each unsuccessful connection attempt

const openSocket = (wsURL, waitTimer, waitSeed, multiplier) =>{
  let ws = new WebSocket(wsURL)
    //todo
  
  ws.onerror = () => {
  
    //increaese the wait timer if not connected, but stop at a max of 2n-1 the check time
    if(waitTimer < 60000) waitTimer = waitTimer * multiplier; 
    Emmiter.emit('custom_error',`error opening connection ${ws.url}, next attemp in : ${waitTimer/1000} seconds`); 
    setTimeout(()=>{openSocket(ws.url, waitTimer, waitSeed, multiplier)}, waitTimer);
  }
 Emmiter.emit('connecting') 
  ws.onopen = async () => {
    ws.send(encode({event:"setup_init",data:await init()}))
      waitTimer = waitSeed;
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
let ws = openSocket(validurl, 1000, 1000, 2)  

  //listener
  client.getInfo=async ()=>{
    return await init()
  }
  client.on = (ev,cb)=>{
    if(ev && typeof ev === 'string' && cb && typeof cb === 'function'){
       Emmiter.on('custom_msg',async (msg)=>{
        let {event,socketid,data} = await decodeFromBlob(msg);
        //check match
        if(ev === event){
          cb({socketid,data})
        }
    })
  }
  }

  //emitter
  client.emit = async function(ev,data,cb){ 
     if(ev && typeof ev === 'string' && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
      //little trick
       if (ws.readyState === ws.OPEN) {  
        //ready to send 
        if(!ws.send) return;
        let meta = await init()
         ws.send(encode({event:ev,socketid:meta.device_id,data:data,meta}))
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
        cb() 
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


