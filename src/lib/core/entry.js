import http from "node:http";
import polka from "polka";
import net from "node:net"
import ws from "ws";

async function checkPort(port,fn){ 

let da = await   http.get(`http://localhost:${port}`)
  da.on("response",(data)=>{
    console.log(data)
  })
  da.on("error",(err)=>{
    if(err.code === "ECONNREFUSED"){
      if(typeof fn ===  "function "){
        return fn(false)
      } 
    }
  }) 
  

}

async function startLocalServer(opts){
const app = polka();

const server = http.createServer();
if(!opts.port){
return {
  iserror:true,
  server:null,
  msg:"port not provided"
}
 }else{
  checkPort(Number(opts.port),(exist)=>{
    console.log(exist) 
  })
     
    return {
      iserror:false,
      server:{}
      
    }
   
 }
}

export default class PouchRealtor{
 constructor(opts){
    if(!opts){
      throw new Error("options object required");
      return
      
    };
    if(typeof opts !== typeof {} ){
     throw new Error("option must be of type object and not empty ");
     return 
    }  
    
    //passed checks
    if(!opts.server){
     //no server provided
      let localserver;
    startLocalServer(opts).then(res=>{
      let {iserror,msg,server} = res; 
      if(iserror){
        throw new Error(msg)

        return
      }
     localserver = server;
     
    })
   //attach local server to 
   console.log(localserver) 
      
    }else{
      //server was provided
      this._opts.server = opts.server; 
    }
}
}