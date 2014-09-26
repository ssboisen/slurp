var assert = require("assert");
var slurp = require("../");

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

    it('when client uses cb use the provided value as a return value', function (done) {
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

    it('when client uses cb asynchronously use the provided value as a return value', function (done) {
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
  });
})
