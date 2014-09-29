var sequencify = require('sequencify');
var Q = require('q');
var stream = require('stream');
var stp = require('stream-to-promise');

function Slurp () {
  return this;
};

var tasks = {};

Slurp.prototype.task = function (name, dep, fn) {
  if(dep instanceof Function) {
    fn = dep;
    dep = [];
  }

  tasks[name] = { name: name, fn : fn, dep: dep };
};

Slurp.prototype.tasks = tasks;

Slurp.prototype.run = function () {
  var taskNames = arguments.length > 1 ? [].slice.call(arguments, 0)  : ['default'];

  var depTaskNames = taskNames.map(function (name) { return tasks[name].dep; });
  var allTaskNames = [].concat.apply(taskNames, depTaskNames);

  var res = sequencify(tasks, allTaskNames);

  function cb(defer, val) {
    defer.resolve(val);
  }

  res.sequence.reduce(function (taskResult, name) {
    var task = tasks[name];
    if(!task) { return console.error("Unknown task: " + name); }

    var defer = Q.defer();
    taskResult[name] = defer.promise;

    var deps = task.dep.map(function (dep) { return taskResult[dep]; });

    Q.all(deps)
    .done(function (fulfilledDeps) {
      var returnVal = task.fn.apply(null, [cb.bind(null, defer)].concat(fulfilledDeps));

      if(returnVal instanceof stream.Readable) {
        returnVal = stp(returnVal);
      }

      if(returnVal) {
        defer.resolve(returnVal);
      }
    });

    return taskResult;
  }, {});
};

Slurp.prototype.reset = function () {
  Slurp.prototype.tasks = tasks = {};
};

module.exports = new Slurp;
