var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter(); 
function isType(obj,type){
	return Object.prototype.toString.call(obj) === '[object '+type+']';
}
function isObject(obj){
	return isType(obj,'Object');
}
function isFunction(fn){
	return isType(fn,'Function');
}
function isArray(arr){
	return isType(arr,'Array');
}
function isString(str){
	return isType(str,'String');
}
var returnConst = {
	code : {
		success:0,
		error:1,
		lock:2,
		timeout:3
	},
	msg : {
		ok : 'ok'
	}
}
function ASYNCLOCK(config){
	//config is obj : addLock,removeLock,checkLock,setTtl,getTtl
	if(!isObject(config)) config = {};
	if(!config.namespace) config.namespace = 'asynclock-';
	ASYNCLOCK.NAMESPACE = config.namespace;
	this.store = {};
	this.config = config;
	this.ttlList = {};
	this._startWatchTtl();
}
ASYNCLOCK.TTL_NAMESPACE = 'ttl-';
ASYNCLOCK.prototype.getStoreKey = function(lockType,lockKey){
	return this.config.namespace+lockType+'_'+lockKey;
}
ASYNCLOCK.prototype.getTtlKey = function(lockType,lockKey){
	return this.config.namespace+ASYNCLOCK.TTL_NAMESPACE+lockType+'_'+lockKey;
}
ASYNCLOCK.prototype.addLock = function(lockType,lockKey,ttl,cb){
	if(isFunction(ttl)){
		cb = ttl;
		ttl = 0;
	}
	var that = this;
	var addLockFn = that.config.addLock || function(lockType,lockKey,ttl,cb){
		if(!isString(lockType)) return cb('lockType must be string');
		if(!isString(lockKey)) return cb('lockKey must be string');
		that.checkLock(lockType,lockKey,function(err,isLock){
			if(err){
				return cb({code:returnConst.code.error,msg:err});
			}else{
				if(isLock){
					return cb(null,{code:returnConst.code.lock,msg:that.getStoreKey(lockType,lockKey) + ' is locked.'});
				}else{
					that.store[that.getStoreKey(lockType,lockKey)] = true;
					that.setTtl(lockType,lockKey,ttl,function(err){
						cb(err,{code:returnConst.code.success,msg:returnConst.msg.ok});
					})					
				}
			}
		})
	}
	addLockFn.call(that,lockType,lockKey,ttl,cb);
}
ASYNCLOCK.prototype.removeLock = function(lockType,lockKey,cb){
	var that = this;
	var removeLockFn = that.config.removeLock || function(lockType,lockKey,cb){
		delete that.store[that.getStoreKey(lockType,lockKey)];
		cb(null);
	}
	removeLockFn.call(that,lockType,lockKey,function(err){
		if(!err){
			that.removeTtl(lockType,lockKey,cb);
		}else{
			cb(err);
		}
	});
}
ASYNCLOCK.prototype.checkLock = function(lockType,lockKey,cb){
	var that = this;
	var checkLockFn = that.config.checkLock || function(lockType,lockKey,cb){
		return cb(null,that.store[that.getStoreKey(lockType,lockKey)] || false);
	}
	checkLockFn.call(that,lockType,lockKey,cb);
}
ASYNCLOCK.prototype.setTtl = function(lockType,lockKey,ttl,cb){
	if(!ttl){
		return cb(null);
	}
	var that = this;
	var setTtlFn = that.config.setTtl || function(lockType,lockKey,ttl,cb){
		that.ttlList[that.getTtlKey(lockType,lockKey)] = Date.now() + ttl*1000;
		cb(null);
	}
	setTtlFn.call(that,lockType,lockKey,ttl,cb);
}
ASYNCLOCK.prototype.getTtl = function(cb){
	//todo:format return data,get this instance
	var that = this;
	var getTtlFn = that.config.getTtl || function(cb){
		cb(null,that.ttlList);
	}
	getTtlFn.call(that,cb);
}
ASYNCLOCK.prototype.removeTtl = function(lockType,lockKey,cb){
	var that = this;
	var removeTtlFn = that.config.removeTtl || function(ockType,lockKey,cb){
		delete that.ttlList[that.getTtlKey(lockType,lockKey)];
		cb(null);
	}
	removeTtlFn.call(that,lockType,lockKey,cb);
}
ASYNCLOCK.prototype._pickTtlKey = function(ttlkey){
	ttlkey = ttlkey.replace(this.config.namespace+ASYNCLOCK.TTL_NAMESPACE,'');
	return ttlkey.split('_');
}
ASYNCLOCK.prototype._startWatchTtl = function(){
	var that = this;
	setInterval(function(){
		var now = Date.now();
		that.getTtl(function(err,ttl){
			for(var key in ttl){
				if(Number(ttl[key]) <= now){
					delete ttl[key];
					var timeOutReturn = that._pickTtlKey(key);
					event.emit(that.config.namespace+ASYNCLOCK.TTL_NAMESPACE,{lockType:timeOutReturn[0],lockKey:timeOutReturn[1],code:returnConst.code.timeout});
				}
			}
		})
	},1000);
	
}
ASYNCLOCK.event = event;
module.exports = ASYNCLOCK;