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
		lock:2
	},
	msg : {
		ok : 'ok'
	}
}
function ASYNCLOCK(config){
	//config is obj : addLock,removeLock,checkLock,setTtl,getTtl
	if(!isObject(config)) config = {};
	if(!config.namespace) config.namespace = 'asynclock-';
	this.store = {};
	this.config = config;
	this.ttlList = {};
}
ASYNCLOCK.TTL_NAMESPACE = 'ttl-';
ASYNCLOCK.prototype.getStoreKey = function(lockType,lockKey){
	return this.config.namespace+lockType+'_'+lockKey;
}
ASYNCLOCK.prototype.getTtlKey = function(lockType,lockKey){
	return this.config.namespace+ASYNCLOCK.TTL_NAMESPACE+lockType+'_'+lockKey;
}
ASYNCLOCK.prototype.addLock = function(lockType,lockKey,ttl,cb){
	var addLockFn = this.config.addLock || function(lockType,lockKey,ttl,cb){
		if(!isString(lockType)) return cb('lockType must be string');
		if(!isString(lockKey)) return cb('lockKey must be string');
		this.checkLock(lockType,lockKey,function(err,isLock){
			if(err){
				return cb({code:returnConst.code.error,msg:err});
			}else{
				if(isLock){
					return cb(null,{code:returnConst.code.lock,msg:this.getStoreKey(lockType,lockKey) + ' is locked.'});
				}else{
					this.store[this.getStoreKey(lockType,lockKey)] = true;
					cb(null,{code:returnConst.code.success,msg:returnConst.msg.ok});
				}
			}
		})
	}
	addLockFn(lockType,lockKey,ttl,cb);
}
ASYNCLOCK.prototype.removeLock = function(lockType,lockKey,cb){
	var removeLockFn = this.config.removeLock || function(lockType,lockKey,cb){
		delete this.store[this.getStoreKey(lockType,lockKey)];
	}
	removeLockFn(lockType,lockKey,cb);
}
ASYNCLOCK.prototype.checkLock = function(lockType,lockKey,cb){
	var checkLockFn = this.config.checkLock || function(lockType,lockKey,cb){
		return cb(null,this.store[this.getStoreKey(lockType,lockKey)]);
	}
}
ASYNCLOCK.prototype.setTtl = function(lockType,lockKey,ttl,cb){
	var setTtlFn = this.config.setTtl || function(lockType,lockKey,ttl,cb){
		this.ttlList[this.getTtlKey(lockType,lockKey)] = Date.now() + ttl*1000;
		cb(null);
	}
	setTtlFn(lockType,lockKey,ttl,cb);
}
ASYNCLOCK.prototype.getTtl = function(cb){
	//todo:format return data
	cb(null,this.ttlList);
}
ASYNCLOCK.prototype.removeTtl = function(lockType,lockKey,cb){
	delete this.ttlList[this.getTtlKey(lockType,lockKey)];
	cb(null);
}
module.exports = ASYNCLOCK;