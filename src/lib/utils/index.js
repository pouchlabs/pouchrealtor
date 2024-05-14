import { decode,decodeAsync } from '@msgpack/msgpack';
import kleur from 'kleur';
var checktype = (function(global) {
    var cache = {};
    return function(obj) {
        var key;
        return obj === null ? 'null' // null
            : obj === global ? 'global' // window in browser or global in nodejs
            : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
            : obj.nodeType ? 'object' // DOM element
            : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
            || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
    };
}(this));

async function decodeFromBlob(blob) {
  if (blob.stream) {
    //todo loop
    // Blob#stream(): ReadableStream<Uint8Array> (recommended)
    try {
      return await decodeAsync(blob.stream());
    } catch (error) {
      return
    }
   
  } else if(blob.arrayBuffer) {
     try {
      return decode(await blob.arrayBuffer());
     } catch (error) {
      return
     }
    
  }
  else{
    try {
      return decode(blob);
    } catch (error) {
      return
    }
   
  }
}

function logSucces(port){
  let msg = `[${kleur.bold().green('pouchrealtor')}]: server listening on ${kleur.blue(port)} `
  console.log(msg)
}
function logError(err){
  let msg = `[${kleur.bold().red('pouchrealtor')}]: error occured \n ${err}} `
  console.log(msg)
} 

export {checktype,logSucces,logError,decodeFromBlob}