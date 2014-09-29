var assert = require("assert");
var slurp = require("../");
var Q = require('q');
var fs = require('fs');

describe('slurp', function(){
  afterEach(function () {
    slurp.reset();
  });

  describe('#run()', function() {
    it('should run any registered tasks', function(done){
      var wasCalled = false;

      slurp.task('default', function () {
        wasCalled = true;
        done();
      });

      slurp.run();

      setTimeout(function () {
        if(!wasCalled) {
          throw new Error("The task function did not run");
        }
      }, 200);
    });

    it('should only run any task once', function (done) {
      var expectedCalls = 1;

      slurp.task('task1', function () {
        expectedCalls -= 1;
      });

      slurp.task('task2', ['task1'], function () { });

      slurp.task('task3', ['task1'], function () { });

      slurp.run('task2', 'task3')

      setTimeout(function () {
        if(expectedCalls !== 0) {
          throw new Error("Tasks were called too many times.");
        } else {
          done();
        }
      }, 20);
    });
  });

  describe('#task()', function(){
    it('should provide the return value of any dependent task in the fn', function(done){
      var expected = 5;

      slurp.task('task1', function () {
        return expected;
      });

      slurp.task('default', ['task1'], function (cb, task1Output) {
        assert.equal(expected, task1Output);
        done();
      });

      slurp.run();
    });

    it("should ignore the return value if it's undefined", function(done){

      slurp.task('task1', function () {
        return undefined;
      });

      slurp.task('default', ['task1'], function (cb, task1Output) {
        done("Should never be called");
      });

      setTimeout(function () {
        done();
      }, 40);

      slurp.run();
    });

    it('should use the provided value as a return value when client uses cb synchronously', function (done) {
      var expected = "expected value";

      slurp.task('task1', function (cb) {
        cb(expected);
      });

      slurp.task('default', ['task1'], function (cb, task1Output) {
        assert.equal(expected, task1Output);
        done();
      });

      slurp.run();
    });

    it('should use the provided value as a return value when client uses cb asynchronously', function (done) {
      var expected = "expected value";

      slurp.task('task1', function (cb) {
        process.nextTick(function () {
          cb(expected);
        });
      });

      slurp.task('default', ['task1'], function (cb, task1Output) {
        assert.equal(expected, task1Output);
        done();
      });

      slurp.run();
    });

    it("should use task return value if it's a promise", function (done) {
      var expected = 10;

      slurp.task('task1', function () {
        var deferred = Q.defer();
        process.nextTick(function () { deferred.resolve(expected); });
        return deferred.promise;
      });

      slurp.task('default', ['task1'], function (cb, task1Output) {
        assert.equal(expected, task1Output);
        done();
      });

      slurp.run();
    });

    it("should use value of whatever happens first: a returned promise or the callback being called", function (done) {
      var expected1 = 10;
      var expected2 = 15;

      slurp.task('task1', function (cb) {
        var deferred = Q.defer();
        cb(expected1);
        process.nextTick(function () { deferred.resolve(expected1); });
        return deferred.promise;
      });

      slurp.task('task2', function (cb) {
        var deferred = Q.defer();
        process.nextTick(function () { cb(expected2); });
        process.nextTick(function () { deferred.resolve(expected2); });
        return deferred.promise;
      });

      slurp.task('default', ['task1', 'task2'], function (cb, task1Output, task2Output) {
        assert.equal(expected1, task1Output);
        assert.equal(expected2, task2Output);
        done();
      });

      slurp.run();
    });

    it('should wait for streams being returned', function (done) {
      slurp.task('task1', function () {
        return fs.createReadStream(__filename);
      });

      slurp.task('default', ['task1'], function (cb, task1Output) {
        assert(task1Output instanceof Buffer);
        done();
      });

      slurp.run();
    });
  });
});
