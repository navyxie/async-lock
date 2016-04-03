# Node 异步锁

## usage

```
var ASYNCLOCK = require('node-async-lock');
var asyncLock = new ASYNCLOCK();
asyncLock.addLock('buy','test',function(err,res){
	if(!err && res.code === 0){
		// todo your's
		do(function(){
			asyncLock.removeLock('buy','test',function(){
				//todo : callback
			})
		})
	}
});

//ttl timeout ttl unit second.

asyncLock.addLock('withdraw','test',0.1,function(err,res){
	if(!err && res.code === 0){
		// todo your's
		do(function(){
			asyncLock.removeLock('buy','test',function(){
				//todo : callback
			})
		})
	}
});
ASYNCLOCK.event.on(ASYNCLOCK.NAMESPACE+ASYNCLOCK.TTL_NAMESPACE,function(data){
	//todo data:{lockType: 'buy', lockKey: 'test', code: 3}
})
```