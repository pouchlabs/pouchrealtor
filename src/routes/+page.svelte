<script>
import {onMount,onDestroy} from 'svelte';
import {CreateClient} from '$lib/client/realtor.js';
import {nanoid} from 'nanoid';
import {writable} from 'svelte/store';

 let user ;
       

    let arr = new ArrayBuffer()
   arr = [1,2,3,5] 
      let client = CreateClient('ws://127.0.0.1:5554/chat')
    
    onMount(async ()=> { 
  user= writable({id:nanoid(16),av:Avataaars.create({
    eyes: "wink",
    clothing: "hoodie",
    hair: "dreads",
    hairColor: "blonde"
})})
      let  nav = document.querySelector('.nav');
      let avatar = document.createElement("span");
      avatar.setAttribute('id',$user.id)
      avatar.innerHTML = $user.av
      document.querySelector('.cr').innerHTML = avatar.innerHTML;

      client.on('messages',(res)=>{
      
       let chatWindow = document.querySelector('.mesages');
       let msg = document.createElement('pre')
        msg.classList.add('message') 
        msg.innerHTML= `<div><span>${res.id}</span><p>${res.msg}</p></div>`     
    chatWindow.append(msg)
       // chatWindow.append(`${res.msg}\n`)
     
     var xH = chatWindow.scrollHeight; 
       chatWindow.scrollTo(0, xH);
     })   

client.on('join_user',(res)=>{
  let avatar = document.createElement("span");
      avatar.setAttribute('id',res.id)
      avatar.innerHTML = res.av
      document.querySelector('.nav').append(avatar);
     let n = document.createElement('span')
     n.classList.add('n')
     n.append(`${res.id} joined`)
  document.querySelector('.noty').append(n)
  
  setTimeout(()=>{
    document.querySelector('.n').remove()
  
  },3000)
})  
 client.on('leave',(res)=>{
  document.getElementById(res.id).remove()
 })
client.onConnecting(()=>{
  console.log('re')
}) 

client.onConnected(async ()=>{
 client.emit('join',$user,(res)=>{
   if(res.iserror){
    console.log('error on emit')
   }
})
})


client.onClose(()=>{
window.location.reload()
})
client.onError((e)=>{
console.log('er',e)
}) 
      
    })


 
function sender(e){
  let text = document.querySelector('#box') 
  if(text.value && text.value.length > 0){
    let chatWindow = document.querySelector('.mesages');
    e.target.setAttribute('disabled',true)
    client.emit('message',{msg:text.value,id:$user.id},(res)=>{
    if(res.iserror === false){
      text.value=''
      e.target.removeAttribute('disabled')
     
     
     var xH = chatWindow.scrollHeight; 
       chatWindow.scrollTo(0, xH);
    }
 })
  }

} 

function beforeUnload() {
  client.emit('leave_user',$user,()=>{

})
} 

</script>
<svelte:window on:beforeunload={beforeUnload}/> 
<div class="cont">
 <nav class="nav">
  <div class="cr"></div>

 </nav>
 <main class="center">
  <div class="noty"></div>
  <h1>simple room chat </h1>
  <div class="mesages">
    
  </div>
  <div class="box-cont">
    <!-- svelte-ignore a11y-autocomplete-valid -->
    <textarea id="box" contenteditable="" placeholder="type some.." ></textarea>
    <button id="send" on:click={(e)=>{sender(e)}}  > send </button>
  </div>
 
 </main>
</div>

<style>

.cont{
  width: 100vw;
  height: 100vh;
  display: flex;
  margin: 0;
  align-items: start;
  flex-wrap: nowrap;
}
.nav{
  width: 45px;
  height: 100vh;
  box-shadow: 0px 3px 15px #121212;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 3px 3px;
  flex-grow: 0;
  flex-shrink: 0;
}
.nav::-webkit-scrollbar{
  width: 0;
}
.nav::scroll-bar{
  width: 0;
}
.center{
  width: 80%;
  height: 100vh;
  margin-left: 5px;
  position: relative;
}
.noty{
 width: 100%;
 position: relative;
 height: auto;
 display:flex;
 flex-wrap: wrap;
}
.mesages{
 height: 70vh;
 width: 100%;
 overflow-x: hidden;
 overflow-y: auto;
  padding: 0.5em;
}
.mesages::-webkit-scrollbar{
  width: 0;
}
.mesages::scroll-bar{
  width: 0;
}

.box-cont{
 min-height: 50px;
 height: 60px;
margin: auto;
 width: 60%;
 padding: 5px 20px;
 position:fixed;
 overflow-x: hidden;
 overflow-y: auto;
 display: flex;
 flex-wrap: wrap;

 bottom: 20px;

}
.box-cont::-webkit-scrollbar{
  width: 0;
}
.box-cont::scroll-bar{
  width: 0;
}
#box{
  text-decoration: none;
  box-shadow: 0px 3px 15px #d1cfcf;
  width: 60%;
  min-width: 120px;
  max-height: 70px;
  outline: none;
  border: 0;
  border-radius: 4px;
}



#box:focus{
  outline: none;
  border: 0;
}
#box::scroll-bar{
  width: 0;
}
#box::-webkit-scrollbar{
  width: 0;
}
#send{
 position: fixed;
 right: calc(100% - 75%);
 bottom: 5;
 text-decoration: none; 
 height: 20px;
 width: 40px;
 outline: none;
 padding: 2px 2px;
 border: 0;
 box-shadow: 0px 3px 15px #494848;
 background-color: #21ecf3;
 border-radius: 8px;
 cursor:pointer;
}
#send:hover{
  box-shadow: 0px 3px 20px #494848;
}
</style>