function isType(obj,type){
  return Object.prototype.toString.call(obj) === '[object '+type+']';
}
function isObject(obj){
  return isType(obj,'Object');
}
function isFunction(fn){
  return isType(fn,'Function')
}
var STORE = require('store-ttl');
function ASYNCLOCK(config){
  if(!isObject(config)){
    config = {};
  }
  config.namespace = config.namespace || 'async-lock-ttl-';
  this.config = config;
  this._store = new STORE(config);
  this._cacheStore = new STORE({ttl:config.ttl,namespace:config.namespace});
}
ASYNCLOCK.prototype.lock = function(key,ttl,callback){
  var that = this;
  if(isFunction(ttl)){
    callback = ttl;
    ttl = this.config.ttl;
  }
  if(this._cacheStore.get(key)){
    return callback(key + ' is locked'); 
  }else{
    this._cacheStore.set(key,1,ttl);
  }
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
  this._cacheStore.remove(key);
  this._store.remove(key,callback);
}
ASYNCLOCK.prototype.remove = function(key,callback){
  this._cacheStore.remove(key);
  this._store.remove(key,callback);
}
ASYNCLOCK.prototype.getNameSpace = function(){
  return this._store.getNameSpace()
}
module.exports = ASYNCLOCK;