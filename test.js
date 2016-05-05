var should = require('should');
var ASYNCLOCK = require('./index');
var async = require('async');
describe('async-lock',function(){
	this.timeout(10000);
	describe('data in memory',function(){
		var AsyncLock;
		before(function(){
			AsyncLock = new ASYNCLOCK();
		});
		describe('#lock()',function(){
			var count = 0;
			function testLock(cb){
				AsyncLock.lock('buy',2,function(err,data){
					if(!err){
						count++;
					}
					cb(err,data);
				})
			}
			it('should be lock ok',function(done){
				async.parallel([
					function(cb){
						testLock(cb);
					},
					function(cb){
						testLock(cb);
					}
				],function(err,data){
					count.should.be.equal(1);
					done();
				}) 
			});
			it('should be lock ttl ok',function(done){
				count = 0;
				setTimeout(function(){
					testLock(function(err,data){
						count.should.be.equal(1);
						done(err);
					})
				},2001)
			})
		})
		describe('#unlock()',function(){
			var count = 0;
			function testLock(cb){
				AsyncLock.lock('pay',2,function(err,data){
					if(!err){
						count++;	
						setTimeout(function(){
							AsyncLock.unlock('pay',function(err,data){
								cb(err,data);
							})
						},1000);						
					}else{
						cb(err,data);
					}
				})
			}
			it('should be ok unlock',function(done){
				async.parallel([
					function(cb){
						testLock(cb);
					},
					function(cb){
						testLock(cb);
					},
					function(cb){
						testLock(cb);
					}
				],function(){
					count.should.be.equal(1);
					done();
				});
			});
			it('should be ok unlock ttl',function(done){
				setTimeout(function(){
					testLock(function(err,data){
						count.should.be.equal(2);
						done(err);
					})
				},1001);
			})
		})
	})
});