import { WebSocketServer } from 'ws';
import EventEmitter from 'eventemitter3';
import { checktype,decodeFromBlob} from '../utils/index.js';
import { encode} from 'msgpack-lite';
import { Fastee } from "fasteejs"; 
import colors from "kleur";
import ip from "./ip.js";
let Emmiter = new EventEmitter();

const wss = new WebSocketServer({noServer:true});
function init(wss,server){
    if(server && checktype(server) === checktype({}) && server.on){
     //valid server supplied
     //
     server.on('upgrade', function upgrade(request,socket, head) {

        wss.handleUpgrade(request,socket, head, async function done(ws) {
          //
          ws.on('error',(e)=>{
          });
          ws.on('close',()=>{
              ws.terminate();
           })
           let meta;
           ws.on("message",async (msg)=>{
            Emmiter.emit("custom_msg",msg)
           let m = await decodeFromBlob(msg) 
           if(m.event === "setup_init"){
              ws.id = m.data.device_id;
              ws.ip = ip().get_ip(request)
              meta=m
              wss.emit('connection',ws, request,meta);
           }
    
           }) 
        
        });
      });
      //log
      console.log(`${colors.bold().green("[realtor]:")} realtime running on\n 
       ${"ws://localhost or wss://localhost"}
      `)
     
    }
  
}
function verify(path){
 if(path && path.startsWith("/")){
  wss.path =path
 }else{
  wss.path = `/${path}` 
 }
}

class Room{
  client = null
  constructor(path="/"){
    if(!path || typeof path !== "string" || path.length === 0){
      throw new Error("realtor: Room requires valid path")
    }
    verify(path)
   this.room = path;
   this.clients = wss.clients
   wss.on('connection', function connection(ws,req,meta) {
   
    ws.on('error',(e)=>{
    });
    ws.on('close',()=>{
        ws.terminate();
     })
     if (ws.readyState === ws.OPEN){
        Emmiter.emit("connected",ws)
      } 

     })
   
  
  }
  on(ev="",cb){
    if(ev && typeof ev === 'string' && ev.length >0 && cb && typeof cb === 'function'){
     
      Emmiter.on("connected",(socket)=>{
        if (socket.readyState === socket.OPEN){
        socket.on('message',async (msg)=>{
        let {event,data} = await decodeFromBlob(msg);
        this.client={
          data,
          ws:socket,
          id:socket.id,
        }
       if(ev === event)cb(this);
      })
    }
    })
  }
   }
   emit(event="",data={},cb){
    if(event && typeof event === 'string' && event.length > 0 && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
      if(!this.client && !this.client){
        wss.on('connection',(ws)=>{
        if (ws.readyState === ws.OPEN){
          //
             ws.send(encode({event,socketid:ws.id,data}))
            return cb({iserror:false,msg:'success'})
           
         
       }else{
         return cb({iserror:true,msg:'not sent'})
       }
      })
      return
      }
  //on trick
    if(this.client.ws && this.client.data && this.client.ws.readyState == this.client.ws.OPEN){
          this.client.ws.send(encode({event,socketid:this.client.ws.id,data}))
         return cb({iserror:false,msg:'success'})
        
      
    }else{
      return cb({iserror:true,msg:'not sent'})
    }
 
 }}
 broadcast(event="",data,cb){
  
  if(event && typeof event === 'string' && event.length > 0 && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
    //trick for on listener
    if(this.client && this.client.data && this.clients){
      this.clients.forEach(cli=>{
      if (cli.readyState == cli.OPEN){
           cli.send(encode({event,socketid:cli.id,data:data}))
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
             cli.send(encode({event,socketid:cli.id,data:data}))
            return cb({iserror:false,msg:'success'})
       }else{
         return cb({iserror:true,msg:'not sent'})
       }
      })
    })
  
   }
 }
 broadcastAll(event="",data={},cb){
  if(event && typeof event === 'string' && event.length >0 && data && checktype(data) === checktype({}) && cb && typeof cb === 'function'){
   
    //trick for on listener
    if(this.client && this.client.data && this.clients){
      this.clients.forEach(cli=>{
      if (cli !== this.client.ws && cli.readyState == cli.OPEN){
           cli.send(encode({event,socketid:cli.id,data:data}))
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
             cli.send(encode({event,socketid:cli.id,data:data}))
            return cb({iserror:false,msg:'success'})
       }else{
         return cb({iserror:true,msg:'not sent'})
       }
      })
    })
  
   }
 }
 broadcastTo(id="",event="",data={},cb){
  if(!id || typeof id !== "string" || id.length === 0){
    throw new Error("realtor: broadcastTo requires id,event,data and cb")
  }
  if(!event || typeof event !== "string" || event.length === 0){
    throw new Error("realtor: broadcastTo requires id,event,data and cb")
  }
  if(!data || checktype(data) !== checktype({})){
    throw new Error("realtor: broadcastTo requires id,event,data and cb")
  }
  if(!cb || checktype(cb) !== "function"){
    throw new Error("realtor: broadcastTo requires id,event,data and cb")
  }

  //trick for on listener
  if(this.client && this.client.data && this.clients){
    this.clients.forEach(cli=>{
    if (cli.id === id && cli.readyState == cli.OPEN){
         cli.send(encode({event:event,socketid:cli.id,data:data}))
        return cb({iserror:false,msg:'success'})
   }else{
     return cb({iserror:true,msg:'not sent'})
   }
  })
  return
  }
  
  wss.on('connection',(ws)=>{
    wss.clients.forEach(cli=>{
      if (cli.id === id && cli.readyState == cli.OPEN){
           cli.send(encode({event:event,socketid:cli.id,data:data}))
          return cb({iserror:false,msg:'success'})
     }else{
       return cb({iserror:true,msg:'not sent'})
     }
    })
  })
 }
 broadcastToMany(ids=[],event="",data={},cb){
  if(!ids || checktype(ids) !== checktype([]) || ids.length === 0){
    throw new Error("realtor: broadcastToMany requires ids,event,data and cb")
  }
  if(!event || typeof event !== "string" || event.length === 0){
    throw new Error("realtor: broadcastToMany requires ids,event,data and cb")
  }
  if(!data || checktype(data) !== checktype({})){
    throw new Error("realtor: broadcastTo requires ids,event,data and cb")
  }
  if(!cb || checktype(cb) !== "function"){
    throw new Error("realtor: broadcastTo requires ids,event,data and cb")
  }

ids.map((id)=>{
  this.broadcastTo(id,event,data,cb)
})
 
 }
 getAllkeys(cb){
  if(!cb && typeof cb !== "function"){
    throw new Error("realtor: getAllkeys requires cb")
  }
  let keys=new Map();

  if(this.clients && this.clients.size > 0){
    wss.clients.forEach(c=>{
      keys.set(c.id)
     })

 let key =[]
 for(let k of keys.keys()){
   key.push(k)
 }
 cb(key)

    return
  }else{
    wss.on("connection",(socket,req)=>{
      socket.on("error",()=>{
        keys.delete(socket.id)
      })
      socket.on("close",()=>{
        keys.delete(socket.id)
      })
      wss.clients.forEach(c=>{
       keys.set(c.id)
      })
     Emmiter.emit("keys_internal",keys.keys())
   })
Emmiter.on("keys_internal",(data)=>{
  let key =[]
  for(let k of data){
    key.push(k)
  }
  cb(key)
})}
 }
}


export class Realtor extends Fastee{
 constructor(opts={port:5554}){
  super(opts)
  if(opts && checktype(opts) === checktype({})){
    if(opts.port && typeof opts.port !== "number"){
      throw new Error("realtor: port must be valid port number")
    }
    if(opts.server && checktype(opts.server)  !== checktype({})){
      throw new Error("realtor: server must be valid running http server")
    }
   init(wss,this.server)
  }else{
    throw new Error("realtor: opts object required ie {port:3000,server:server} valid running server")
  }
  this.Room = Room;
 }
}
