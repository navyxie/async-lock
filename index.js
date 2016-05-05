function isType(obj,type){
  return Object.prototype.toString.call(obj) === '[object '+type+']';
}
function isObject(obj){
  return isType(obj,'Object');
}
var STORE = require('store-ttl');
function ASYNCLOCK(config){
  if(!isObject(config)){
    config = {};
  }
  config.namespace = config.namespace || 'async-lock-ttl-';
  this._store = new STORE(config);
}
ASYNCLOCK.prototype.lock = function(key,ttl,callback){
  var that = this;
  this._store.get(key,function(err,data){
    if(err){
      return callback(err);
    }
    if(data){
      return callback(key + ' is locked');
    }
    that._store.set(key,1,ttl,callback);
  });
}
ASYNCLOCK.prototype.unlock = function(key,callback){
  this._store.remove(key,callback);
}
ASYNCLOCK.prototype.remove = function(key,callback){
  this._store.remove(key,callback);
}
ASYNCLOCK.prototype.getNameSpace = function(){
  return this._store.getNameSpace()
}
module.exports = ASYNCLOCK;