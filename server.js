import {createRealtor} from "./src/lib/index.js";
import polka from "polka";
import {handler} from './build/handler.js'
import { logSucces} from './dist/utils/index.js';
  
      
let app = createRealtor({port:4000}); 

let chat = new app.Room('/sync');

chat.conect((socket)=>{
   
   socket.on('full-sync',res =>{ 
       console.log(res.data)
      res.broadcast('messages',res.data,()=>{
       
      })
   })
   socket.on("collection-change",(res)=>{
      console.log(res.data) 
   })
  socket.on('join',(res)=>{
    res.broadcastAll('join_user',res.data,()=>{
    
    })  
  }) 
  socket.on('leave_user',(res)=>{
   res.broadcast('leave',res.data,()=>{
    
   })
  })
  
   
}) 




