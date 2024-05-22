# pouchrealtor
 blazing fast socket.io alternative,pure websockets.

its a pure websocket for nodejs and browser,draws inspiration from socket.io.if you know socket.io you already know pouchrealtor


## install
```bash
 npm install @pouchlab/realtor
```

## server usage

```js
 import {createRealtor} from '@pouchlab/realtor';
import express from 'express';
 //with express
 const app = express()

 const realtime = createRealtor({server:app})//expects object
 console.log(realtime)

 //room
 let chatroom = new realtime.Room('/chat')
 console.log(chatroom)

 //events
 chatroom.emit('welcome',{msg:'hi from server'},(res)=>{
    console.log(res)
 })
 chatroom.on('welcome',(res)=>{
    console.log(res)
 })


 app.listen(3000)

```

## client usage

```js
 import {createClient} from '@pouchlab/realtor';

let client = createClient('ws://localhost:3000/chat')//ws or wss only
 //events
 client.emit('welcome',{msg:'hi from server'},(res)=>{
    console.log(res)
 })
 client.on('welcome',(res)=>{
    console.log(res)
 })

```

## sample
sample [example](https://pouchrealtor.onrender.com)

# support
 if you like pouchrealtor,help maintain its development
 
[donate](https://ko-fi.com/pouchlabs)
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H3XBF9G) 
