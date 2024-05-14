import polka from 'polka';
import detect from 'detect-port';
import { WebSocketServer } from 'ws';
import EventEmitter from 'eventemitter3';
import {conect} from './room.js';
import { checktype,logSucces,logError} from '../utils/index.js';
import { nanoid } from 'nanoid';
let app = polka();
const wss = new WebSocketServer({noServer:true});
let Emmiter = new EventEmitter();

async function genId(ws,req){
  const ip = req.socket.remoteAddress || req.headers['x-forwarded-for'].split(',')[0].trim();
  ws.ip = ip;
  ws.id=nanoid(16)
  return ws
}

function createRealtor(opts){
  if(opts && checktype(opts) === checktype({})){
    
    let port = Number(opts.port) || 5554;
    let server = opts.server;

    if(server && checktype(server) === checktype({}) && server.on){
     //valid server supplied
     //
     server.on('upgrade', function upgrade(request,socket, head) {
        wss.handleUpgrade(request,socket, head, async function done(ws) {
          //
          wss.emit('connection', await genId(ws,request), request);
        });
      });
      //log
     
    }else{
      //no server supplied
      //init new server
      detect(port)
      .then(_port => {
    if (port == _port) {
      //port not occupied
      app.listen(port,'127.0.0.1',(err)=>{
         if(err){
          logError(err)
          return
         }//handle upgrade
         app.server.on('upgrade', function upgrade(request,socket, head) {
          //middlewares soon
            wss.handleUpgrade(request,socket, head, async function done(ws) {
              wss.emit('connection',await genId(ws,request), request);
            });
          });
          //log
         logSucces(port)
        })

     
       
    } else { 
      //try another port
      app.listen(_port,'127.0.0.1',(err)=>{
        if(err){
         logError(err)
         return
        }//handle upgrade
        app.server.on('upgrade', function upgrade(request, socket, head) {
           wss.handleUpgrade(request,socket, head, async function done(ws) {
             wss.emit('connection', await genId(ws,request), request);
           });
         });
         //log
        logSucces(_port)
       })

    
    }//
    }) 
  .catch(err => {
    logError(err);
  });
       
    }
  
    //
    let realtor ={}
    //room
    realtor.Room = class Room{
      constructor(room){
      if(room && typeof room === 'string' && room.length > 0 && room.startsWith('/')){
        this.room = room
        wss.path = room
        this.wss=wss;
        //err
        wss.on('error',async (e)=>{
          if(e){
            Emmiter.emit('error',{error:e})
          }
        })
        //return current;
        this.conect = conect
         this.onError = async function(cb){
          Emmiter.on('error',(e)=>{
            return cb(e)
          })
         }
       
          
      }
      
     }
        
    }
    return realtor
  }else{
    return {
      iserror:true,
      msg:'valid options required [server]or [port],{server:server,port:8090}'
    }
  }
}

export {
  createRealtor
}