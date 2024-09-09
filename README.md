# pouchrealtor
 
blazing fast socket.io alternative,pure websockets.

its a pure websocket for nodejs and browser,draws inspiration from socket.io.if you know socket.io you already know pouchrealtor

# features
* pure websockets
* blazing fast
* works in nodejs and browser
* easy rooms logic


## install
```bash
 npm install @pouchlab/realtor
```

## server usage

```js
 import {Realtor} from '@pouchlab/realtor';
import express from 'express';
 //with express
 const app = express()

 const realtime = new Realtor({server:app})//expects object
 console.log(realtime)

 //room
 let chatroom = new realtime.Room('/chat')
 console.log(chatroom)

 //events
 chatroom.emit('welcome',{msg:'hi from server'},(res)=>{
    console.log(res)
 })
 chatroom.on('welcome',(socket)=>{
    console.log(socket)
 })


 app.listen(3000)

```

## client usage

```js
 import {CreateClient} from '@pouchlab/realtor';

let client = createClient('ws://localhost:3000/chat')//ws or wss only
 //events
 client.emit('welcome',{msg:'hi from server'},(res)=>{
    console.log(res)
 })
 client.on('welcome',(res)=>{
    console.log(res)
 })

```

# support
 if you like pouchrealtor,help maintain its development,this keeps the maintainer motivated
 
[donate](https://ko-fi.com/pouchlabs)
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H3XBF9G) 
