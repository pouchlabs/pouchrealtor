import EventEmitter from 'eventemitter3';
import { checktype,decodeFromBlob } from '../utils/index.js';
import { encode } from '@msgpack/msgpack';
let Emmiter = new EventEmitter();

export function conect(cb){
  let wss = this.wss;
  let room = {};
  let clients;
  wss.on('connection', function connection(ws) {
    ws.on('error',(e)=>{

    });
      clients = wss.clients;
     
    ws.on('close',()=>{
        ws.terminate();
    })

    return ws
  });
  wss.on('error',(e)=>{
    Emmiter.emit('error',e)
  })
 



 room.on = (ev,cb)=>{
  if(ev && typeof ev === 'string' && cb && typeof cb === 'function'){
      wss.on('connection',(ws)=>{


      ws.on('message',async (msg)=>{
      let {event,data} = await decodeFromBlob(msg);
      this.res= {
        ws,
        clients:wss.clients,
        data
      }
      this.res.broadcast = room.broadcast
      this.res.broadcastAll = room.broadcastAll
      this.res.emit= room.emit
      if(ev === event)return cb(this.res);
    
    })}) 
    
}
 }
 room.emit=function(ev,data,cb){
  if(ev && typeof ev === 'string' && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
        if(!this.ws && !this.data){
          wss.on('connection',(ws)=>{
          if (ws.readyState === ws.OPEN){
            //
               ws.send(encode({event:ev,socketid:ws.id,data}))
              return cb({iserror:false,msg:'success'})
             
           
         }else{
           return cb({iserror:true,msg:'not sent'})
         }
        })
        return
        }
    //on trick
      if(this.ws && this.data && this.ws.readyState == this.ws.OPEN){
        
            this.ws.send(encode({event:ev,socketid:this.ws.id,data}))
           return cb({iserror:false,msg:'success'})
          
        
      }else{
        return cb({iserror:true,msg:'not sent'})
      }
   
   }
 }   

 //all and itself
 room.broadcast = function(ev,data,cb){
  
  if(ev && typeof ev === 'string' && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
    //trick for on listener
    if(this.ws && this.data && this.clients){
      this.clients.forEach(cli=>{
      if (cli.readyState == cli.OPEN){
           cli.send(encode({event:ev,socketid:cli.id,data:data}))
          return cb({iserror:false,msg:'success'})
     }else{
       return cb({iserror:true,msg:'not sent'})
     }
    })
   return
  }//
    wss.on('connection',(ws)=>{
      wss.clients.forEach(cli=>{
        if (cli.readyState == cli.OPEN){
             cli.send(encode({event:ev,socketid:cli.id,data:data}))
            return cb({iserror:false,msg:'success'})
       }else{
         return cb({iserror:true,msg:'not sent'})
       }
      })
    })
  
   }
 }

 room.broadcastAll = function(ev,data,cb){
  if(ev && typeof ev === 'string' && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
    //trick for on listener
    if(this.ws && this.data && this.clients){
      this.clients.forEach(cli=>{
      if (cli !== this.ws && cli.readyState == cli.OPEN){
           cli.send(encode({event:ev,socketid:cli.id,data:data}))
          return cb({iserror:false,msg:'success'})
     }else{
       return cb({iserror:true,msg:'not sent'})
     }
    })
    return
    }
    
    wss.on('connection',(ws)=>{
      wss.clients.forEach(cli=>{
        if (cli !== ws && cli.readyState == cli.OPEN){
             cli.send(encode({event:ev,socketid:cli.id,data:data}))
            return cb({iserror:false,msg:'success'})
       }else{
         return cb({iserror:true,msg:'not sent'})
       }
      })
    })
  
   }
 }
 room.onError = async function(cb){
  Emmiter.on('error',(e)=>{
    return cb(e)
  })
 }
room.getAllClients = async function(cb){
  wss.on('connection',(ws)=>{
  wss.clients.forEach(cl=>{
      return cb({socketid:cl.id,ip:cl.ip,ws:cl})
    })
  })
}

  return cb(room)
}



