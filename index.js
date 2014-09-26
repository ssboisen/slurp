var sequencify = require('sequencify');

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

  var taskResult = {}

  function cb(name, val) {
    taskResult[name] = val;
  }

  res.sequence.forEach(function (name) {
    var task = tasks[name];
    if(!task) { return console.error("Unknown task: " + name); }

    var returnVal = tasks[name].fn.apply(null, [cb.bind(null, name)].concat(task.dep.map(function (dep) { return taskResult[dep]; })));
    taskResult[name]  = taskResult[name] || returnVal;
  });
};

Slurp.prototype.reset = function () {
  Slurp.prototype.tasks = tasks = {};
};

module.exports = new Slurp;
