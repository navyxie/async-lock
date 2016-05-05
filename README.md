# Node Async lock (异步锁)

a simple node async lock that support ttl base memory database such as redis.

## install

```js
npm install node-async-lock
```

## usage

[node_redis](https://github.com/NodeRedis/node_redis) demo :

```js
var redis = require("redis"),
  client = redis.createClient(6379,'localhost');

var ASYNCLOCK = require('node-async-lock');
var AsyncLock = new ASYNCLOCK({
  set:function(key,data,ttl,callback){
    client.set(key,data,function(err,reply){
      callback(err,reply.toString());
    });
    client.expire(key,ttl);
  },
  get:function(key,callback){
    client.get(key,function(err,reply){
      callback(err,reply.toString());
    });
  },
  remove:function(key,callback){
    client.del(key,function(err){
      callback(err);
    })    
  },
  ttl:60, //the unit is second,defualt one day.
  namespace:'test-asynclock-ttl-' //default:async-lock-ttl-
});

eg1:

function testLock(cb){
	AsyncLock.lock('buy',2,function(err,data){
		cb(err,data);
	})
}

eg2:

function testLock(cb){
	AsyncLock.lock('pay',2,function(err,data){
		if(!err){
			//todo your code.
			AsyncLock.unlock('pay',function(err,data){
				cb(err,data);
			})						
		}else{
			cb(err,data);
		}
	})
}
```

## API

- [`lock`](#lock)

- [`unlock`](#unlock)

- [`remove`](#remove)

- [`getNameSpace`](#getNameSpace)

<a name="lock" />

lock

```js
AsyncLock.lock('test-redis',10,function(err,data){
  console.log(err,data);
})
```

<a name="unlock" />

unlock

```js
AsyncLock.unlock('test-redis',function(err,data){
  console.log(err,data);
})
```

<a name="remove" />

remove

```js
AsyncLock.remove('test-redis',function(err,data){
  console.log(err);
})
```

<a name="getNameSpace" />

getNameSpace

```js
console.log(AsyncLock.getNameSpace());//test-asynclock-ttl
```

