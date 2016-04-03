var should = require('should');
var ASYNCLOCK = require('./index');
// var EventEmitter = require('events').EventEmitter; 
// var event = new EventEmitter(); 
describe('async-lock',function(){
	var AsyncLock = new ASYNCLOCK();
	describe('addLock',function(){
		it('should be ok',function(done){
			AsyncLock.addLock('buy','test',function(err,res){
				res.code.should.be.equal(0);
				done(err);
			})
		});
		it('should be not ok',function(done){
			AsyncLock.addLock('buy','test',function(err,res){
				res.code.should.be.equal(2);
				done(err);
			})
		});
	});
	describe('checkLock',function(){
		it('should be ok',function(done){
			AsyncLock.checkLock('buy','test',function(err,isLock){
				isLock.should.be.true();
				done(err);
			})
		});
	});
	describe('removeLock',function(){
		it('should be ok',function(done){
			AsyncLock.removeLock('buy','test',function(err){
				done(err);
			});	
		});
		it('checkLock,should be unlock',function(done){
			AsyncLock.checkLock('buy','test',function(err,isLock){
				isLock.should.be.false();
				done(err);
			})
		});
		it('addLock again,should be ok',function(done){
			AsyncLock.addLock('buy','test',function(err,res){
				res.code.should.be.equal(0);
				AsyncLock.removeLock('buy','test',function(err){
					done(err);
				})		
			})
		});
	});
	describe('addLock ttl',function(){
		it('timeout',function(done){
			AsyncLock.addLock('buy','test',0.1,function(err,res){
				res.code.should.be.equal(0);
				done(err);
			});
		});
		it('event on timeout',function(done){
			ASYNCLOCK.event.on(ASYNCLOCK.NAMESPACE+ASYNCLOCK.TTL_NAMESPACE,function(data){
				data.lockType.should.be.equal('buy');
				data.lockKey.should.be.equal('test');
				data.code.should.be.equal(3);
				done(null);
			});
		})
	})
})