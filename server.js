import {createRealtor} from "./dist/index.js";
import polka from "polka";
import {handler} from './build/handler.js'
import { logSucces} from './dist/utils/index.js';
   const server = polka({
      onError:async (err,req,res)=>{
         if(err){
            res.statusCode = 400;
            res.end('400 oops error occured')
            return 
         }
      },
      onNoMatch:async (err,req,res,next)=>{
          if(err){
            res.statusCode = 404
            res.end('404 not found')
            return
          }
          
      }
   }).listen(5554,'0.0.0.0',(err)=>{
      if(err){
         return
      }
      logSucces(5554)
      
      server.use(handler)
      
let app = createRealtor({server:server.server})

let chat = new app.Room('/chat');

chat.conect((socket)=>{
   
   socket.on('message',res =>{
      
      res.broadcast('messages',res.data,()=>{
       
      })
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
chat.onError((e)=>{   
   console.log(e)
})
   });


