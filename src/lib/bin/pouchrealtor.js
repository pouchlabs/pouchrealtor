import {createRealtor} from "../index.js";

let app = createRealtor({port:5554})

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


  

    
    
   
    




