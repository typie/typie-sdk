(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("typie-sdk", [], factory);
	else if(typeof exports === 'object')
		exports["typie-sdk"] = factory();
	else
		root["typie-sdk"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/electron-is-dev/index.js":
/*!***********************************************!*\
  !*** ./node_modules/electron-is-dev/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isEnvSet = 'ELECTRON_IS_DEV' in process.env;

module.exports = isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));


/***/ }),

/***/ "./node_modules/gonode/lib/command.js":
/*!********************************************!*\
  !*** ./node_modules/gonode/lib/command.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Copyright (c) 2013 John Granström
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Commands must be executed within a command pool to limit execution count and time.

var misc = __webpack_require__(/*! ./misc */ "./node_modules/gonode/lib/misc.js");

// Create a command object with id, command, callback and optionally signal
exports.Command = Command;
function Command(id, cmd, callback, signal) {
	// Contain common data to be shared with go-module in .common
	this.common = {
		id: id,
		cmd: cmd,
		signal: signal === undefined ? -1: signal, // -1 is no signal
	}
	// Contain internal data not to be sent over the interface in .internal
	this.internal = {
		callback: callback,
		executionStarted: false,
		executionEnded: false,
	}	
}

// Call to set the execution options for this command.
// Default options will be added for those not provided
Command.prototype.setOptions = function(pool, options) {
	this.internal.options = options || {};
	misc.mergeDefaultOptions(this.internal.options, {
		commandTimeoutSec: pool.go.options.defaultCommandTimeoutSec,
	});
}

// Execute command by sending it to go-module
Command.prototype.execute = function(pool, options) {
	executionStarted(pool, this);

	// Send common data to go-module
	pool.go.proc.stdin.write(JSON.stringify(this.common) + '\n'); // Write \n to flush write buffer	

}

// Handle command response and invoke callback
Command.prototype.response = function(pool, responseData) {
	executionStopped(pool, this, responseData, {ok: true});		
}

// Call if command reaches timeout, ends execution with timeout as result
Command.prototype.timeout = function(pool) {
	executionStopped(pool, this, null, {timeout: true});
}

// Call if command is to be terminated, ends execution with terminated as result
Command.prototype.terminate = function(pool) {
	executionStopped(pool, this, null, {terminated: true});
}

// Call each time the command is to be executed to update status
// Handles the state of the command as well as the containing pool.
function executionStarted(pool, cmd) {
	cmd.internal.executionStarted = true;	

	pool.runningCommands++;
	pool.hasCommandsRunning = true;

	// Add executing command to map
	pool.commandMap[cmd.common.id] = cmd;

	// Only timeout non-signal commands
	if(cmd.common.signal === -1) {
		engageTimeout(pool, cmd);
	} 
}

// Call each time the command has been received/timed out/aborted (stopped execution) to update pool status
// Handles the state of the command as well as the containing pool.
function executionStopped(pool, cmd, responseData, result) {
	if(!result.timeout) {
		clearTimeout(cmd.internal.timeout); // Stop timeout timer
	}	
	cmd.internal.executionEnded = true;

	pool.runningCommands--;
	if(pool.runningCommands <= 0) {
		pool.runningCommands = 0; // To be safe
		pool.hasCommandsRunning = false;
		pool.enteredIdle(); // Pool is now idle
	}

	// Since command is now done we delete it from the commandMap	
	delete pool.commandMap[cmd.common.id];
	pool.workQueue(); // Will be added to event loop

	// Invoke callback last
	if(cmd.internal.callback !== undefined && cmd.internal.callback !== null) {
		var responseResult = {
			ok: result.ok === true,
			timeout: result.timeout === true,
			terminated: result.terminated === true,
		}
		cmd.internal.callback(responseResult, responseData);
	}
}

// Activate timeout timer to abort commands running for too long
// Calls executionStopped upon timeout.
function engageTimeout(pool, cmd) {
	cmd.internal.timeout = setTimeout(function() {		
		// Command timed out, abort execution
		cmd.timeout(pool);
	}, cmd.internal.options.commandTimeoutSec * 1000);
}

// Common signals
exports.Signals = {
	Termination: new Command(0, null, null, 1),
}

/***/ }),

/***/ "./node_modules/gonode/lib/commandpool.js":
/*!************************************************!*\
  !*** ./node_modules/gonode/lib/commandpool.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Copyright (c) 2013 John Granström
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

const commandIdLimit = 1e9;

var misc = __webpack_require__(/*! ./misc */ "./node_modules/gonode/lib/misc.js"),
	Queue = __webpack_require__(/*! ./queue */ "./node_modules/gonode/lib/queue.js").Queue,	
	Command = __webpack_require__(/*! ./command */ "./node_modules/gonode/lib/command.js").Command;

exports.CommandPool = CommandPool;
function CommandPool(go) {
	this.go = go;
	this.commandMap = {},
	this.nextCommandId = 0;
	this.runningCommands = 0;
	this.hasCommandsRunning = false;

	this.idleCmdWaiting = null; // Provide the ability to execute a command upon next idle
	
	this.commandQueue = new Queue();
}

// Plan the execution of a command and set execution options.
// None prioritized commands may be queued instead of directly executed if exceeding command limit.
CommandPool.prototype.planExecution = function(cmd, prioritized, options) {
	cmd.setOptions(this, options);
	// If command not prioritized make sure it does not exceed command limit
	//console.log(this.go.options.maxCommandsRunning)	
	executeCommand(this, cmd, prioritized);
}

// Handle JSON response and process command callback and end of execution 
// Also manage the queue if required. 
CommandPool.prototype.handleResponse = function(response) {
	var respCmd = this.commandMap[response.id]
	if(respCmd !== undefined) {
		respCmd.response(this, response.data);	
	} else {
		// Command may have timed out or otherwise aborted so we throw the response away
	}	
}

// Create a command with specified data and callback with new ID
CommandPool.prototype.createCommand = function(data, callback) {
	cmd = new Command(this.nextCommandId, data, callback);
	incrementCommandId(this);
	return cmd;
}

// Check if commands are queued, and if so execute them on next event loop
CommandPool.prototype.workQueue = function() {
	if(!this.commandQueue.isEmpty()) { // Check if queue is empty first
		var pool = this;
		// Dequeue command here not on nextTick() to avoid multiple dequeues for same item
		var nextCmd = pool.commandQueue.dequeue();
		process.nextTick(function() { // Execute next commands on next tick
			executeCommand(pool, nextCmd, false);
		});
	}
}

// Plan a single command to be run the next time the command pool is idle
// (no running commands). Calling this several times without having an idle period
// will overwrite any previously planned on idle commands
CommandPool.prototype.planOnIdle = function(cmd, prioritized, options) {
	this.idleCmdWaiting = {
		cmd: cmd,
		prioritized: prioritized,
		optios: options,
	};
	// If there's no commands running, execute it right away
	if(!this.hasCommandsRunning) {
		executeWaitingCommand(this);
	}
}

// Call when pool has entered idle, i.e. has no commands running as of now
CommandPool.prototype.enteredIdle = function() {
	// Check if there's a command waiting for idle
	if(this.idleCmdWaiting != null) {
		// Execute waiting command on next tick
		var self = this;
		process.nextTick(function() {
			executeWaitingCommand(self);
		});
	}
}

// Causes all running commands to timeout
CommandPool.prototype.terminate = function() {
	this.commandQueue.clear(); // Clear command queue
	this.idleCmdWaiting = null; // Throw away any waiting command

	for(var cmdId in this.commandMap) {
		var cmd = this.commandMap[cmdId];
		if(cmd.internal.executionStarted && !cmd.internal.executionEnded) {
			cmd.terminate(this);
		}
	}
}

// Execute a command if does not exceed command count limit and command queue is empty
// otherwise queue command for later execution.
function executeCommand(pool, cmd, prioritized) {
	if(!prioritized && (pool.runningCommands >= pool.go.options.maxCommandsRunning)) {
		// Exceeds limit, queue command instead of running
		pool.commandQueue.enqueue(cmd);
	} else {
		// Execute command	
		cmd.execute(pool);	
	}
}

// Reset nextCommandId if growing past limit
// Limit should be set high enough so that the old command for ID 0
// most likely has responded or timed out and will not conflict with new ones.
function incrementCommandId(pool) {
	if(pool.nextCommandId++ >= commandIdLimit) {
		pool.nextCommandId = 0;
	}
}

// Execute a command planned to run on next idle
function executeWaitingCommand(pool) {
	var toExecute = pool.idleCmdWaiting;
	pool.idleCmdWaiting = null;
	pool.planExecution(toExecute.cmd,
		toExecute.prioritized,
		toExecute.options
	);
}

/***/ }),

/***/ "./node_modules/gonode/lib/gonode.js":
/*!*******************************************!*\
  !*** ./node_modules/gonode/lib/gonode.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Copyright (c) 2013 John Granström
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var spawn = __webpack_require__(/*! child_process */ "child_process").spawn,
	util = __webpack_require__(/*! util */ "util"),
	fs = __webpack_require__(/*! fs */ "fs"),	
	misc = __webpack_require__(/*! ./misc */ "./node_modules/gonode/lib/misc.js"),
	EventEmitter = __webpack_require__(/*! events */ "events").EventEmitter,
	CommandPool = __webpack_require__(/*! ./commandpool */ "./node_modules/gonode/lib/commandpool.js").CommandPool	
	Signals = __webpack_require__(/*! ./command */ "./node_modules/gonode/lib/command.js").Signals;

// Create a new Go-object for the specified .go-file.
// Will also intialize Go-object if second parameter is true.
//
// Throws error if no path provided to .go-file.
util.inherits(Go, EventEmitter);
exports.Go = Go;
function Go(options, callback) {
	if(options === undefined || options === null) {
		misc.raiseError('No options provided.')
	}
	if(options.path == undefined || options.path == null) {
		misc.raiseError('No path provided to .go-file.');
	}

	misc.mergeDefaultOptions(options, {
		maxCommandsRunning: 10,
		defaultCommandTimeoutSec: 5,
		cwd: process.cwd(),
	});
	this.options = options;

	this.goFile = options.path;
	this.proc = null;
	this.initialized = false; // true when Go has been initialized, back to false when Go closes
	this.closePending = false; // true when close() has been called and no more commands should be planned
	this.terminatePending = false; // true when terminate() has been called
	this.commandPool = new CommandPool(this)

	if(options.initAtOnce) {
		this.init(callback);
	}
}

// Initialize by launching go process and prepare for commands.
// Do as early as possible to avoid delay when executing first command.
//
// callback has parameters (err)
Go.prototype.init = function(callback) {		
	var self = this;
	fs.exists(this.goFile, function(exists) {
		if(!exists) {	
			misc.callbackIfAvailable(callback, misc.getError('.go-file not found for given path.'));
			return;
		}

		// simple extension check to detect if its a un compiles .go file
		if (self.goFile.slice(-3).toLowerCase() === '.go') {
			// Spawn go process within current working directory
			self.proc = spawn('go', ['run', self.goFile], { cwd: self.options.cwd, env: process.env });
		} else {
			// Spawn go compiled file
			self.proc = spawn( self.goFile, [], { cwd: self.options.cwd, env: process.env });
		}


		// Setup handlers
		self.proc.stdout.on('data', function(data){
			handleStdout(self, data);
		});
		self.proc.stderr.on('data', function(data){
			handleErr(self, data, false);
		});
		self.proc.on('close', function(){
			handleClose(self);
		});		

		// Init complete
		self.initialized = true;
		misc.callbackIfAvailable(callback, null);
	});
}

// Gracefully close Go by sending termination signal after all executing commands
// has ended their execution.
// Returns true if close has been started, or false if Go is not initialized or if it
// already has a close pending.
Go.prototype.close = function() {
	if(this.initialized && !this.closePending && !this.terminatePending) {
		this.closePending = true;
		// Send prioritized termination signal
		this.commandPool.planOnIdle(Signals.Termination, true);

		return true;
	} else {
		return false;
	}
}

// Hard terminate by sending termination on all commands and termination signal to Go
// Returns true if termination has been started, or false if Go is not initialized or if it
// already has a termination pending.
Go.prototype.terminate = function() {
	return terminate(this, true);
}

// Create and execute or queue a command of JSON data
// Will not queue command if Go is not initialized or has been closed (or close pending)
// Takes parameters:
// 		data (required) - actual command JSON
//		callback (required) - the callback to call with possible result when execution ends
//		options (optional) - overrides default execution options
// Returns true if the command was planned for execution, otherwise false.
Go.prototype.execute = function(data, callback, options) {	
	if(this.initialized && !this.closePending && !this.terminatePending) {
		// Important to not leave go in an infinite loop eatig cpu
		try { // Contain outer exceptions and close go before rethrowing exception.
			this.commandPool.planExecution(this.commandPool.createCommand(data, callback), false, options);	
		} catch (e) {
			handleErr(this, e, false);
		}
		return true; // Return true since the command has been planned for execution
	} else {
		return false; // The command wasn't planned for execution, return false
	}
}

// reset the bufferData with an empty string
var bufferData = "";

// Receive data from go-module
function handleStdout(go, data) {

	// append data to the buffer for every stdout
    bufferData += data.toString();

    // if reached the end of the message in the stdout parse it
	// and reset the buffer for the next stdout
    if (bufferData.endsWith("\n")) {
        // Response may be several command responses separated by new lines
        bufferData.toString().split("\n").forEach(function(resp) {
            // Discard empty lines
            if(resp.length > 0) {
                // Parse each command response with a event-loop in between to avoid blocking
                process.nextTick(function(){parseResponse(go, resp)});
            }
        });
        bufferData = "";
    }
}

// Parse a _single_ command response as JSON and handle it
// If parsing fails a internal error event will be emitted with the response data
function parseResponse(go, resp) {
	var parsed;
	try {
		parsed = JSON.parse(resp);
	} catch (e) {		
		handleErr(go, resp, true);
		return;
	}

	// Important to not leave go in an infinite loop eatig cpu
	try { // Contain outer exceptions and close go before rethrowing exception.
		go.commandPool.handleResponse(parsed) // Handle response outside throw to avoid catching those exceptions	
	} catch (e) {
		handleErr(go, e, false);
	}	
}

// Emit error event on go instance, pass through raw error data
// Errors may either be internal parser errors or external errors received from stderr
function handleErr(go, data, parser) {	
	if(!parser) { // If external error, terminate all commands
		terminate(go, false);
	}

	if(go.listeners('error').length > 0) { // Only emit event if there are listeners
		process.nextTick(function() {
			// Emit any event on next tick
			go.emit('error', {parser: parser, data: data});
		});
	}	
}

// Go panic and process ends causes calls to this
// Emit close event on go instance
function handleClose(go) {
	// If process closes we set initialized to false to avoid invalid close() or execute()	
	go.initialized = false;
	if(go.listeners('close').length > 0) { // Only emit event if there are listeners
		go.emit('close');
	}		
}

// Terminate by sending termination on all commands.
// If called with true it will also directly try to send a termination signal to go
function terminate(go, withSignal) {
	if(go.initialized && !go.terminatePending) {
		go.terminatePending = true;

		// Do the actual termination asynchronously
		// Callbacks will be each terminated command or nothing
		process.nextTick(function(){
			// Tell command pool to kill all commands
			go.commandPool.terminate();			

			// Send signal after command pool termination, otherwise it would
			// be removed by terminate()
			if(withSignal) {					
				go.commandPool.planExecution(Signals.Termination, true);				
			}
		});

		return true;
	} else {
		return false;
	}	
}

/***/ }),

/***/ "./node_modules/gonode/lib/misc.js":
/*!*****************************************!*\
  !*** ./node_modules/gonode/lib/misc.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Copyright (c) 2013 John Granström
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Contains general helpers

// Invoke callback if not undefined with provided parameter
exports.callbackIfAvailable = function(callback, param) {
	if(typeof callback != undefined) {
		callback(param);
	}
}

exports.raiseError = function(error) {
	throw getError(error);
}

exports.getError = function(error) {
	return new Error('gonode: ' + error);
}

// Make sure options not provided are set to default values 
exports.mergeDefaultOptions = function(options, defaults) {
	for (opt in defaults) {
		if(options[opt] === undefined) {
			options[opt] = defaults[opt];
		} 
	}
}

/***/ }),

/***/ "./node_modules/gonode/lib/queue.js":
/*!******************************************!*\
  !*** ./node_modules/gonode/lib/queue.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Copyright (c) 2013 John Granström
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

exports.Queue = Queue;
function Queue() {
	this.arr = [];
}

Queue.prototype.enqueue = function(element) {
	this.arr.push(element);
}

Queue.prototype.dequeue = function() {
	return this.arr.shift();
}

Queue.prototype.getLength = function() {
	return this.arr.length;
}

Queue.prototype.isEmpty = function() {
	return this.getLength() === 0;
}

Queue.prototype.clear = function() {
	this.arr.length = 0;
}

/***/ }),

/***/ "./src/AbstractTypiePackage.ts":
/*!*************************************!*\
  !*** ./src/AbstractTypiePackage.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {
Object.defineProperty(exports, "__esModule", { value: true });
const Path = __webpack_require__(/*! path */ "path");
const index_1 = __webpack_require__(/*! ./index */ "./src/index.ts");
const defaultIcon = "pkg-icon.png";
class AbstractTypiePackage {
    constructor(win, config, pkgName) {
        this.win = win;
        this.packageData = { name: pkgName, path: __dirname };
        this.packageName = pkgName;
        this.db = pkgName;
        this.pkgConfig = config;
        this.icon = this.getPackagePath() + defaultIcon;
        this.typie = new index_1.Typie(this.packageName);
        this.packages = {};
        this.loadConfig();
    }
    getPackageName() {
        return this.packageName;
    }
    getPackagePath() {
        return index_1.getPath("packages/" + this.packageName + "/");
    }
    getDefaultItem(value, description = "", path = "", icon = "") {
        const item = new index_1.TypieRowItem();
        item.setTitle(value);
        item.setPath(path ? path : value);
        item.setIcon(icon ? icon : this.icon);
        item.setDescription(description ? description : "");
        return item;
    }
    insert(value, description = "", path = "", icon = "") {
        this.insertItem(this.getDefaultItem(value, description, path, icon));
    }
    insertItem(item) {
        this.typie.insert(item).go()
            .then(data => console.log(data))
            .catch(err => console.error(err));
    }
    search(obj, callback) {
        this.typie.fuzzySearch(obj.value).orderBy("score").desc().go()
            .then(data => callback(data))
            .catch(err => console.log(err));
    }
    activate(pkgList, item, callback) {
        console.info('No override "activate" method found in ' + this.packageName);
    }
    enterPkg(pkgList, item, callback) {
        this.getFirstRecords(10);
    }
    clear(pkgList, callback) {
        this.getFirstRecords(10);
    }
    remove(pkgList, item, callback) {
        console.info('No override "remove" method found in ' + this.packageName);
    }
    getIcon(icon) {
        return Path.join(this.getPackagePath(), icon);
    }
    getFirstRecords(numOfRecords = 10) {
        this.typie.getRows(numOfRecords).orderBy("count").desc().go()
            .then(res => this.win.send("resultList", res))
            .catch(e => console.error("error getting first records", e));
    }
    loadConfig() {
        // console.log("No override 'loadConfig' method found in " + this.packageName);
        if (this.pkgConfig.shortcut) {
            console.log("registering shortcut " + this.pkgConfig.shortcut + " to " + this.getPackageName());
            this.win.registerKey(this.pkgConfig.shortcut, () => {
                this.win.send("changePackage", [this.getPackageName()]);
            });
        }
    }
    destroy() {
        console.log("destroying the package!");
        console.log("unregister", this.pkgConfig);
        if (this.pkgConfig.shortcut) {
            this.win.unregisterKey(this.pkgConfig.shortcut);
        }
    }
}
exports.default = AbstractTypiePackage;

/* WEBPACK VAR INJECTION */}.call(this, "/"))

/***/ }),

/***/ "./src/AppGlobal.ts":
/*!**************************!*\
  !*** ./src/AppGlobal.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class AppGlobal {
    static getTimeSinceInit() {
        return Date.now() - AppGlobal.startTime;
    }
    static getSettings() {
        return AppGlobal.settings;
    }
    static set(name, obj) {
        global[name] = obj;
    }
    static get(name) {
        return global[name];
    }
}
exports.default = AppGlobal;


/***/ }),

/***/ "./src/GoDispatcher.ts":
/*!*****************************!*\
  !*** ./src/GoDispatcher.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const gonode_1 = __webpack_require__(/*! gonode */ "./node_modules/gonode/lib/gonode.js");
// import * as path from "path";
const appGlobal = global;
class GoDispatcher {
    constructor(typieExecutable) {
        console.log("Starting Typie Service for the first time", typieExecutable);
        GoDispatcher.executablePath = typieExecutable;
        this.startProcess();
    }
    send(packet) {
        // console.log("send packet", packet);
        return new Promise((resolve, reject) => {
            GoDispatcher.go.execute(packet, (result, response) => {
                // console.log("got back", response);
                if (result.ok) {
                    if (response.data) {
                        response.data = JSON.parse(response.data);
                    }
                    return resolve(response);
                }
                return reject(response);
            });
        });
    }
    close() {
        GoDispatcher.go.close();
        GoDispatcher.listening = false;
    }
    startProcess() {
        console.log("Starting Typie Service", GoDispatcher.executablePath);
        GoDispatcher.listening = false;
        GoDispatcher.go = new gonode_1.Go({
            defaultCommandTimeoutSec: 60,
            maxCommandsRunning: 10,
            path: GoDispatcher.executablePath,
        });
        GoDispatcher.go.init(this.register);
        GoDispatcher.go.on("close", () => this.onClose());
        GoDispatcher.go.on("error", err => console.error("go dispatcher had error", err));
        // setTimeout(() => GoDispatcher.go.terminate(), 10000);
    }
    onClose() {
        console.log("go dispatcher was closed");
        if (GoDispatcher.listening) {
            this.startProcess();
        }
    }
    register() {
        GoDispatcher.go.execute({ command: "start" }, (result, response) => {
            if (result.ok) { // Check if response is ok
                // In our case we just echo the command, so we can get our text back
                console.log("Typie responded: ", response);
                appGlobal.coreLogPath = response.log;
                if (response.err === 0) {
                    GoDispatcher.listening = true;
                }
            }
        });
    }
}
exports.default = GoDispatcher;


/***/ }),

/***/ "./src/Typie.ts":
/*!**********************!*\
  !*** ./src/Typie.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Packet_1 = __webpack_require__(/*! ./models/Packet */ "./src/models/Packet.ts");
const SearchPayload_1 = __webpack_require__(/*! ./models/SearchPayload */ "./src/models/SearchPayload.ts");
// this is a little hack to use the global variable in TypeScript
// it is used to get the go dispatcher from the main process we need it as a singleton
const globalAny = global;
class Typie {
    constructor(packageName, db) {
        this.search = new SearchPayload_1.default();
        this.goDispatcher = globalAny.GoDispatcher;
        this.db = db ? db : packageName;
        this.packageName = packageName;
        this.command = "";
        this.payload = {};
    }
    pasteText() {
        this.command = "pasteText";
        this.payload = {};
        return this;
    }
    addCollection() {
        this.command = "addCollection";
        this.payload = { name: this.packageName };
        return this;
    }
    updateCalled(item) {
        item.countUp();
        return this.insert(item, true);
    }
    multipleInsert(itemList) {
        this.command = "multipleInsert";
        this.payload = itemList;
        return this;
    }
    insert(item, persist = true) {
        item.setDB(this.db);
        item.setPackage(this.packageName);
        this.command = persist ? "insertPersist" : "insert";
        this.payload = item.toPayload();
        return this;
    }
    remove(item) {
        item.setDB(item.getDB());
        item.setPackage(item.getPackage());
        this.command = "remove";
        this.payload = item.toPayload();
        return this;
    }
    getKey(value) {
        this.payload.value = value;
        this.payload.db = this.db;
        this.payload.packageName = this.packageName;
        this.command = "getKey";
        return this;
    }
    getExecList() {
        this.payload.db = this.db;
        this.payload.packageName = this.packageName;
        this.command = "getExecList";
        return this;
    }
    fuzzySearch(value) {
        this.search.value = value;
        this.search.type = "fuzzy";
        this.search.db = this.db;
        this.search.packageName = this.packageName;
        this.command = "search";
        this.payload = this.search;
        return this;
    }
    getRows(limit) {
        this.search.limit = limit;
        this.search.type = "getRows";
        this.search.db = this.db;
        this.search.packageName = this.packageName;
        this.command = "search";
        this.payload = this.search;
        return this;
    }
    setPkg(name) {
        this.packageName = name;
        return this;
    }
    setDB(name) {
        this.db = name;
        return this;
    }
    orderBy(field) {
        this.search.direction = "asc";
        this.search.orderBy = field;
        return this;
    }
    asc() {
        this.search.direction = "asc";
        return this;
    }
    desc() {
        this.search.direction = "desc";
        return this;
    }
    go() {
        return this.goDispatcher.send(new Packet_1.default(this.command, this.payload));
    }
}
exports.default = Typie;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const AbstractTypiePackage_1 = __webpack_require__(/*! ./AbstractTypiePackage */ "./src/AbstractTypiePackage.ts");
exports.AbstractTypiePackage = AbstractTypiePackage_1.default;
const AppGlobal_1 = __webpack_require__(/*! ./AppGlobal */ "./src/AppGlobal.ts");
exports.AppGlobal = AppGlobal_1.default;
const GoDispatcher_1 = __webpack_require__(/*! ./GoDispatcher */ "./src/GoDispatcher.ts");
exports.GoDispatcher = GoDispatcher_1.default;
const Packet_1 = __webpack_require__(/*! ./models/Packet */ "./src/models/Packet.ts");
exports.Packet = Packet_1.default;
const SearchObject_1 = __webpack_require__(/*! ./models/SearchObject */ "./src/models/SearchObject.ts");
exports.SearchObject = SearchObject_1.default;
const TypieRowItem_1 = __webpack_require__(/*! ./models/TypieRowItem */ "./src/models/TypieRowItem.ts");
exports.TypieRowItem = TypieRowItem_1.default;
const Typie_1 = __webpack_require__(/*! ./Typie */ "./src/Typie.ts");
exports.Typie = Typie_1.default;
const isDev = __webpack_require__(/*! electron-is-dev */ "./node_modules/electron-is-dev/index.js");
const getPath = (staticPath) => {
    if (!isDev) {
        return "../static/" + staticPath;
    }
    else {
        return staticPath;
    }
};
exports.getPath = getPath;


/***/ }),

/***/ "./src/models/Packet.ts":
/*!******************************!*\
  !*** ./src/models/Packet.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Packet {
    constructor(command, payload) {
        this.command = "";
        this.payload = {};
        this.command = command;
        this.payload = payload ? payload : {};
    }
}
exports.default = Packet;


/***/ }),

/***/ "./src/models/SearchObject.ts":
/*!************************************!*\
  !*** ./src/models/SearchObject.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class SearchObject {
    constructor() {
        this.value = "";
        this.pkgList = [];
    }
}
exports.default = SearchObject;


/***/ }),

/***/ "./src/models/SearchPayload.ts":
/*!*************************************!*\
  !*** ./src/models/SearchPayload.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class SearchPayload {
    constructor() {
        this.type = "fuzzy"; // can be 'fuzzy' | '' |
        this.limit = 10;
        this.value = ""; // the actual search valu
        this.orderBy = "score"; // the name of the field to be ordered by
        this.direction = "desc";
        this.packageName = "";
        this.db = "";
    }
}
exports.default = SearchPayload;


/***/ }),

/***/ "./src/models/TypieRowItem.ts":
/*!************************************!*\
  !*** ./src/models/TypieRowItem.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class TypieRowItem {
    static create(data) {
        const item = new TypieRowItem();
        item.setDB(data.db ? data.db : "global");
        item.setPackage(data.t);
        item.setActions(data.a);
        item.setTitle(data.title);
        item.setPath(data.p);
        item.setDescription(data.d);
        item.setIcon(data.i);
        item.setCount(data.c);
        item.setScore(data.score);
        item.setUnixtime(data.u);
        return item;
    }
    static isPackage(item) {
        return item.d === "Package"
            || item.d === "SubPackage"
            || item.p === "Package"
            || item.p.startsWith("SubPackage|");
    }
    constructor(title) {
        this.db = "";
        this.d = "";
        this.i = "";
        this.t = "";
        this.p = "";
        this.title = title ? title : "";
        this.c = 0;
    }
    setTitle(value) {
        this.title = value;
        return this;
    }
    getTitle() {
        return this.title;
    }
    setActions(actionList) {
        this.a = actionList;
        return this;
    }
    getActions() {
        return this.a;
    }
    setLabels(labelList) {
        this.l = labelList;
        return this;
    }
    getLabels() {
        return this.l;
    }
    setPath(value) {
        this.p = value;
        return this;
    }
    getPath() {
        return this.p;
    }
    setDB(value) {
        this.db = value;
        return this;
    }
    getDB() {
        return this.db;
    }
    setDescription(value) {
        this.d = value ? value : "";
        return this;
    }
    getDescription() {
        return this.d;
    }
    setIcon(value) {
        this.i = value;
        return this;
    }
    getIcon() {
        return this.i;
    }
    setPackage(value) {
        this.t = value;
        return this;
    }
    getPackage() {
        return this.t;
    }
    setCount(value) {
        this.c = value;
        return this;
    }
    getCount() {
        return this.c;
    }
    countUp() {
        this.c = this.c + 1;
        return this;
    }
    setUnixtime(value) {
        this.u = value;
    }
    getUnixtime() {
        return this.u;
    }
    setScore(value) {
        this.score = value;
        return this;
    }
    getScore() {
        return this.score;
    }
    toPayload() {
        return {
            a: this.getActions(),
            c: this.getCount(),
            d: this.getDescription(),
            db: this.getDB(),
            i: this.getIcon(),
            l: this.getLabels(),
            p: this.getPath(),
            t: this.getPackage(),
            title: this.getTitle(),
        };
    }
}
exports.default = TypieRowItem;


/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ })

/******/ });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90eXBpZS1zZGsvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL3R5cGllLXNkay93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24taXMtZGV2L2luZGV4LmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy9nb25vZGUvbGliL2NvbW1hbmQuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvY29tbWFuZHBvb2wuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvZ29ub2RlLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy9nb25vZGUvbGliL21pc2MuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvcXVldWUuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL0Fic3RyYWN0VHlwaWVQYWNrYWdlLnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9BcHBHbG9iYWwudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL0dvRGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvVHlwaWUudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvUGFja2V0LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvU2VhcmNoT2JqZWN0LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvU2VhcmNoUGF5bG9hZC50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvbW9kZWxzL1R5cGllUm93SXRlbS50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJjaGlsZF9wcm9jZXNzXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ25FQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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KGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJ0eXBpZS1zZGtcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1widHlwaWUtc2RrXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcInR5cGllLXNka1wiXSA9IGZhY3RvcnkoKTtcbn0pKGdsb2JhbCwgZnVuY3Rpb24oKSB7XG5yZXR1cm4gIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgZ2V0RnJvbUVudiA9IHBhcnNlSW50KHByb2Nlc3MuZW52LkVMRUNUUk9OX0lTX0RFViwgMTApID09PSAxO1xuY29uc3QgaXNFbnZTZXQgPSAnRUxFQ1RST05fSVNfREVWJyBpbiBwcm9jZXNzLmVudjtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0VudlNldCA/IGdldEZyb21FbnYgOiAocHJvY2Vzcy5kZWZhdWx0QXBwIHx8IC9ub2RlX21vZHVsZXNbXFxcXC9dZWxlY3Ryb25bXFxcXC9dLy50ZXN0KHByb2Nlc3MuZXhlY1BhdGgpKTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gQ29tbWFuZHMgbXVzdCBiZSBleGVjdXRlZCB3aXRoaW4gYSBjb21tYW5kIHBvb2wgdG8gbGltaXQgZXhlY3V0aW9uIGNvdW50IGFuZCB0aW1lLlxuXG52YXIgbWlzYyA9IHJlcXVpcmUoJy4vbWlzYycpO1xuXG4vLyBDcmVhdGUgYSBjb21tYW5kIG9iamVjdCB3aXRoIGlkLCBjb21tYW5kLCBjYWxsYmFjayBhbmQgb3B0aW9uYWxseSBzaWduYWxcbmV4cG9ydHMuQ29tbWFuZCA9IENvbW1hbmQ7XG5mdW5jdGlvbiBDb21tYW5kKGlkLCBjbWQsIGNhbGxiYWNrLCBzaWduYWwpIHtcblx0Ly8gQ29udGFpbiBjb21tb24gZGF0YSB0byBiZSBzaGFyZWQgd2l0aCBnby1tb2R1bGUgaW4gLmNvbW1vblxuXHR0aGlzLmNvbW1vbiA9IHtcblx0XHRpZDogaWQsXG5cdFx0Y21kOiBjbWQsXG5cdFx0c2lnbmFsOiBzaWduYWwgPT09IHVuZGVmaW5lZCA/IC0xOiBzaWduYWwsIC8vIC0xIGlzIG5vIHNpZ25hbFxuXHR9XG5cdC8vIENvbnRhaW4gaW50ZXJuYWwgZGF0YSBub3QgdG8gYmUgc2VudCBvdmVyIHRoZSBpbnRlcmZhY2UgaW4gLmludGVybmFsXG5cdHRoaXMuaW50ZXJuYWwgPSB7XG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdGV4ZWN1dGlvblN0YXJ0ZWQ6IGZhbHNlLFxuXHRcdGV4ZWN1dGlvbkVuZGVkOiBmYWxzZSxcblx0fVx0XG59XG5cbi8vIENhbGwgdG8gc2V0IHRoZSBleGVjdXRpb24gb3B0aW9ucyBmb3IgdGhpcyBjb21tYW5kLlxuLy8gRGVmYXVsdCBvcHRpb25zIHdpbGwgYmUgYWRkZWQgZm9yIHRob3NlIG5vdCBwcm92aWRlZFxuQ29tbWFuZC5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKHBvb2wsIG9wdGlvbnMpIHtcblx0dGhpcy5pbnRlcm5hbC5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0bWlzYy5tZXJnZURlZmF1bHRPcHRpb25zKHRoaXMuaW50ZXJuYWwub3B0aW9ucywge1xuXHRcdGNvbW1hbmRUaW1lb3V0U2VjOiBwb29sLmdvLm9wdGlvbnMuZGVmYXVsdENvbW1hbmRUaW1lb3V0U2VjLFxuXHR9KTtcbn1cblxuLy8gRXhlY3V0ZSBjb21tYW5kIGJ5IHNlbmRpbmcgaXQgdG8gZ28tbW9kdWxlXG5Db21tYW5kLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24ocG9vbCwgb3B0aW9ucykge1xuXHRleGVjdXRpb25TdGFydGVkKHBvb2wsIHRoaXMpO1xuXG5cdC8vIFNlbmQgY29tbW9uIGRhdGEgdG8gZ28tbW9kdWxlXG5cdHBvb2wuZ28ucHJvYy5zdGRpbi53cml0ZShKU09OLnN0cmluZ2lmeSh0aGlzLmNvbW1vbikgKyAnXFxuJyk7IC8vIFdyaXRlIFxcbiB0byBmbHVzaCB3cml0ZSBidWZmZXJcdFxuXG59XG5cbi8vIEhhbmRsZSBjb21tYW5kIHJlc3BvbnNlIGFuZCBpbnZva2UgY2FsbGJhY2tcbkNvbW1hbmQucHJvdG90eXBlLnJlc3BvbnNlID0gZnVuY3Rpb24ocG9vbCwgcmVzcG9uc2VEYXRhKSB7XG5cdGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgdGhpcywgcmVzcG9uc2VEYXRhLCB7b2s6IHRydWV9KTtcdFx0XG59XG5cbi8vIENhbGwgaWYgY29tbWFuZCByZWFjaGVzIHRpbWVvdXQsIGVuZHMgZXhlY3V0aW9uIHdpdGggdGltZW91dCBhcyByZXN1bHRcbkNvbW1hbmQucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihwb29sKSB7XG5cdGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgdGhpcywgbnVsbCwge3RpbWVvdXQ6IHRydWV9KTtcbn1cblxuLy8gQ2FsbCBpZiBjb21tYW5kIGlzIHRvIGJlIHRlcm1pbmF0ZWQsIGVuZHMgZXhlY3V0aW9uIHdpdGggdGVybWluYXRlZCBhcyByZXN1bHRcbkNvbW1hbmQucHJvdG90eXBlLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uKHBvb2wpIHtcblx0ZXhlY3V0aW9uU3RvcHBlZChwb29sLCB0aGlzLCBudWxsLCB7dGVybWluYXRlZDogdHJ1ZX0pO1xufVxuXG4vLyBDYWxsIGVhY2ggdGltZSB0aGUgY29tbWFuZCBpcyB0byBiZSBleGVjdXRlZCB0byB1cGRhdGUgc3RhdHVzXG4vLyBIYW5kbGVzIHRoZSBzdGF0ZSBvZiB0aGUgY29tbWFuZCBhcyB3ZWxsIGFzIHRoZSBjb250YWluaW5nIHBvb2wuXG5mdW5jdGlvbiBleGVjdXRpb25TdGFydGVkKHBvb2wsIGNtZCkge1xuXHRjbWQuaW50ZXJuYWwuZXhlY3V0aW9uU3RhcnRlZCA9IHRydWU7XHRcblxuXHRwb29sLnJ1bm5pbmdDb21tYW5kcysrO1xuXHRwb29sLmhhc0NvbW1hbmRzUnVubmluZyA9IHRydWU7XG5cblx0Ly8gQWRkIGV4ZWN1dGluZyBjb21tYW5kIHRvIG1hcFxuXHRwb29sLmNvbW1hbmRNYXBbY21kLmNvbW1vbi5pZF0gPSBjbWQ7XG5cblx0Ly8gT25seSB0aW1lb3V0IG5vbi1zaWduYWwgY29tbWFuZHNcblx0aWYoY21kLmNvbW1vbi5zaWduYWwgPT09IC0xKSB7XG5cdFx0ZW5nYWdlVGltZW91dChwb29sLCBjbWQpO1xuXHR9IFxufVxuXG4vLyBDYWxsIGVhY2ggdGltZSB0aGUgY29tbWFuZCBoYXMgYmVlbiByZWNlaXZlZC90aW1lZCBvdXQvYWJvcnRlZCAoc3RvcHBlZCBleGVjdXRpb24pIHRvIHVwZGF0ZSBwb29sIHN0YXR1c1xuLy8gSGFuZGxlcyB0aGUgc3RhdGUgb2YgdGhlIGNvbW1hbmQgYXMgd2VsbCBhcyB0aGUgY29udGFpbmluZyBwb29sLlxuZnVuY3Rpb24gZXhlY3V0aW9uU3RvcHBlZChwb29sLCBjbWQsIHJlc3BvbnNlRGF0YSwgcmVzdWx0KSB7XG5cdGlmKCFyZXN1bHQudGltZW91dCkge1xuXHRcdGNsZWFyVGltZW91dChjbWQuaW50ZXJuYWwudGltZW91dCk7IC8vIFN0b3AgdGltZW91dCB0aW1lclxuXHR9XHRcblx0Y21kLmludGVybmFsLmV4ZWN1dGlvbkVuZGVkID0gdHJ1ZTtcblxuXHRwb29sLnJ1bm5pbmdDb21tYW5kcy0tO1xuXHRpZihwb29sLnJ1bm5pbmdDb21tYW5kcyA8PSAwKSB7XG5cdFx0cG9vbC5ydW5uaW5nQ29tbWFuZHMgPSAwOyAvLyBUbyBiZSBzYWZlXG5cdFx0cG9vbC5oYXNDb21tYW5kc1J1bm5pbmcgPSBmYWxzZTtcblx0XHRwb29sLmVudGVyZWRJZGxlKCk7IC8vIFBvb2wgaXMgbm93IGlkbGVcblx0fVxuXG5cdC8vIFNpbmNlIGNvbW1hbmQgaXMgbm93IGRvbmUgd2UgZGVsZXRlIGl0IGZyb20gdGhlIGNvbW1hbmRNYXBcdFxuXHRkZWxldGUgcG9vbC5jb21tYW5kTWFwW2NtZC5jb21tb24uaWRdO1xuXHRwb29sLndvcmtRdWV1ZSgpOyAvLyBXaWxsIGJlIGFkZGVkIHRvIGV2ZW50IGxvb3BcblxuXHQvLyBJbnZva2UgY2FsbGJhY2sgbGFzdFxuXHRpZihjbWQuaW50ZXJuYWwuY2FsbGJhY2sgIT09IHVuZGVmaW5lZCAmJiBjbWQuaW50ZXJuYWwuY2FsbGJhY2sgIT09IG51bGwpIHtcblx0XHR2YXIgcmVzcG9uc2VSZXN1bHQgPSB7XG5cdFx0XHRvazogcmVzdWx0Lm9rID09PSB0cnVlLFxuXHRcdFx0dGltZW91dDogcmVzdWx0LnRpbWVvdXQgPT09IHRydWUsXG5cdFx0XHR0ZXJtaW5hdGVkOiByZXN1bHQudGVybWluYXRlZCA9PT0gdHJ1ZSxcblx0XHR9XG5cdFx0Y21kLmludGVybmFsLmNhbGxiYWNrKHJlc3BvbnNlUmVzdWx0LCByZXNwb25zZURhdGEpO1xuXHR9XG59XG5cbi8vIEFjdGl2YXRlIHRpbWVvdXQgdGltZXIgdG8gYWJvcnQgY29tbWFuZHMgcnVubmluZyBmb3IgdG9vIGxvbmdcbi8vIENhbGxzIGV4ZWN1dGlvblN0b3BwZWQgdXBvbiB0aW1lb3V0LlxuZnVuY3Rpb24gZW5nYWdlVGltZW91dChwb29sLCBjbWQpIHtcblx0Y21kLmludGVybmFsLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1x0XHRcblx0XHQvLyBDb21tYW5kIHRpbWVkIG91dCwgYWJvcnQgZXhlY3V0aW9uXG5cdFx0Y21kLnRpbWVvdXQocG9vbCk7XG5cdH0sIGNtZC5pbnRlcm5hbC5vcHRpb25zLmNvbW1hbmRUaW1lb3V0U2VjICogMTAwMCk7XG59XG5cbi8vIENvbW1vbiBzaWduYWxzXG5leHBvcnRzLlNpZ25hbHMgPSB7XG5cdFRlcm1pbmF0aW9uOiBuZXcgQ29tbWFuZCgwLCBudWxsLCBudWxsLCAxKSxcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmNvbnN0IGNvbW1hbmRJZExpbWl0ID0gMWU5O1xuXG52YXIgbWlzYyA9IHJlcXVpcmUoJy4vbWlzYycpLFxuXHRRdWV1ZSA9IHJlcXVpcmUoJy4vcXVldWUnKS5RdWV1ZSxcdFxuXHRDb21tYW5kID0gcmVxdWlyZSgnLi9jb21tYW5kJykuQ29tbWFuZDtcblxuZXhwb3J0cy5Db21tYW5kUG9vbCA9IENvbW1hbmRQb29sO1xuZnVuY3Rpb24gQ29tbWFuZFBvb2woZ28pIHtcblx0dGhpcy5nbyA9IGdvO1xuXHR0aGlzLmNvbW1hbmRNYXAgPSB7fSxcblx0dGhpcy5uZXh0Q29tbWFuZElkID0gMDtcblx0dGhpcy5ydW5uaW5nQ29tbWFuZHMgPSAwO1xuXHR0aGlzLmhhc0NvbW1hbmRzUnVubmluZyA9IGZhbHNlO1xuXG5cdHRoaXMuaWRsZUNtZFdhaXRpbmcgPSBudWxsOyAvLyBQcm92aWRlIHRoZSBhYmlsaXR5IHRvIGV4ZWN1dGUgYSBjb21tYW5kIHVwb24gbmV4dCBpZGxlXG5cdFxuXHR0aGlzLmNvbW1hbmRRdWV1ZSA9IG5ldyBRdWV1ZSgpO1xufVxuXG4vLyBQbGFuIHRoZSBleGVjdXRpb24gb2YgYSBjb21tYW5kIGFuZCBzZXQgZXhlY3V0aW9uIG9wdGlvbnMuXG4vLyBOb25lIHByaW9yaXRpemVkIGNvbW1hbmRzIG1heSBiZSBxdWV1ZWQgaW5zdGVhZCBvZiBkaXJlY3RseSBleGVjdXRlZCBpZiBleGNlZWRpbmcgY29tbWFuZCBsaW1pdC5cbkNvbW1hbmRQb29sLnByb3RvdHlwZS5wbGFuRXhlY3V0aW9uID0gZnVuY3Rpb24oY21kLCBwcmlvcml0aXplZCwgb3B0aW9ucykge1xuXHRjbWQuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcblx0Ly8gSWYgY29tbWFuZCBub3QgcHJpb3JpdGl6ZWQgbWFrZSBzdXJlIGl0IGRvZXMgbm90IGV4Y2VlZCBjb21tYW5kIGxpbWl0XG5cdC8vY29uc29sZS5sb2codGhpcy5nby5vcHRpb25zLm1heENvbW1hbmRzUnVubmluZylcdFxuXHRleGVjdXRlQ29tbWFuZCh0aGlzLCBjbWQsIHByaW9yaXRpemVkKTtcbn1cblxuLy8gSGFuZGxlIEpTT04gcmVzcG9uc2UgYW5kIHByb2Nlc3MgY29tbWFuZCBjYWxsYmFjayBhbmQgZW5kIG9mIGV4ZWN1dGlvbiBcbi8vIEFsc28gbWFuYWdlIHRoZSBxdWV1ZSBpZiByZXF1aXJlZC4gXG5Db21tYW5kUG9vbC5wcm90b3R5cGUuaGFuZGxlUmVzcG9uc2UgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuXHR2YXIgcmVzcENtZCA9IHRoaXMuY29tbWFuZE1hcFtyZXNwb25zZS5pZF1cblx0aWYocmVzcENtZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmVzcENtZC5yZXNwb25zZSh0aGlzLCByZXNwb25zZS5kYXRhKTtcdFxuXHR9IGVsc2Uge1xuXHRcdC8vIENvbW1hbmQgbWF5IGhhdmUgdGltZWQgb3V0IG9yIG90aGVyd2lzZSBhYm9ydGVkIHNvIHdlIHRocm93IHRoZSByZXNwb25zZSBhd2F5XG5cdH1cdFxufVxuXG4vLyBDcmVhdGUgYSBjb21tYW5kIHdpdGggc3BlY2lmaWVkIGRhdGEgYW5kIGNhbGxiYWNrIHdpdGggbmV3IElEXG5Db21tYW5kUG9vbC5wcm90b3R5cGUuY3JlYXRlQ29tbWFuZCA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG5cdGNtZCA9IG5ldyBDb21tYW5kKHRoaXMubmV4dENvbW1hbmRJZCwgZGF0YSwgY2FsbGJhY2spO1xuXHRpbmNyZW1lbnRDb21tYW5kSWQodGhpcyk7XG5cdHJldHVybiBjbWQ7XG59XG5cbi8vIENoZWNrIGlmIGNvbW1hbmRzIGFyZSBxdWV1ZWQsIGFuZCBpZiBzbyBleGVjdXRlIHRoZW0gb24gbmV4dCBldmVudCBsb29wXG5Db21tYW5kUG9vbC5wcm90b3R5cGUud29ya1F1ZXVlID0gZnVuY3Rpb24oKSB7XG5cdGlmKCF0aGlzLmNvbW1hbmRRdWV1ZS5pc0VtcHR5KCkpIHsgLy8gQ2hlY2sgaWYgcXVldWUgaXMgZW1wdHkgZmlyc3Rcblx0XHR2YXIgcG9vbCA9IHRoaXM7XG5cdFx0Ly8gRGVxdWV1ZSBjb21tYW5kIGhlcmUgbm90IG9uIG5leHRUaWNrKCkgdG8gYXZvaWQgbXVsdGlwbGUgZGVxdWV1ZXMgZm9yIHNhbWUgaXRlbVxuXHRcdHZhciBuZXh0Q21kID0gcG9vbC5jb21tYW5kUXVldWUuZGVxdWV1ZSgpO1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7IC8vIEV4ZWN1dGUgbmV4dCBjb21tYW5kcyBvbiBuZXh0IHRpY2tcblx0XHRcdGV4ZWN1dGVDb21tYW5kKHBvb2wsIG5leHRDbWQsIGZhbHNlKTtcblx0XHR9KTtcblx0fVxufVxuXG4vLyBQbGFuIGEgc2luZ2xlIGNvbW1hbmQgdG8gYmUgcnVuIHRoZSBuZXh0IHRpbWUgdGhlIGNvbW1hbmQgcG9vbCBpcyBpZGxlXG4vLyAobm8gcnVubmluZyBjb21tYW5kcykuIENhbGxpbmcgdGhpcyBzZXZlcmFsIHRpbWVzIHdpdGhvdXQgaGF2aW5nIGFuIGlkbGUgcGVyaW9kXG4vLyB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXNseSBwbGFubmVkIG9uIGlkbGUgY29tbWFuZHNcbkNvbW1hbmRQb29sLnByb3RvdHlwZS5wbGFuT25JZGxlID0gZnVuY3Rpb24oY21kLCBwcmlvcml0aXplZCwgb3B0aW9ucykge1xuXHR0aGlzLmlkbGVDbWRXYWl0aW5nID0ge1xuXHRcdGNtZDogY21kLFxuXHRcdHByaW9yaXRpemVkOiBwcmlvcml0aXplZCxcblx0XHRvcHRpb3M6IG9wdGlvbnMsXG5cdH07XG5cdC8vIElmIHRoZXJlJ3Mgbm8gY29tbWFuZHMgcnVubmluZywgZXhlY3V0ZSBpdCByaWdodCBhd2F5XG5cdGlmKCF0aGlzLmhhc0NvbW1hbmRzUnVubmluZykge1xuXHRcdGV4ZWN1dGVXYWl0aW5nQ29tbWFuZCh0aGlzKTtcblx0fVxufVxuXG4vLyBDYWxsIHdoZW4gcG9vbCBoYXMgZW50ZXJlZCBpZGxlLCBpLmUuIGhhcyBubyBjb21tYW5kcyBydW5uaW5nIGFzIG9mIG5vd1xuQ29tbWFuZFBvb2wucHJvdG90eXBlLmVudGVyZWRJZGxlID0gZnVuY3Rpb24oKSB7XG5cdC8vIENoZWNrIGlmIHRoZXJlJ3MgYSBjb21tYW5kIHdhaXRpbmcgZm9yIGlkbGVcblx0aWYodGhpcy5pZGxlQ21kV2FpdGluZyAhPSBudWxsKSB7XG5cdFx0Ly8gRXhlY3V0ZSB3YWl0aW5nIGNvbW1hbmQgb24gbmV4dCB0aWNrXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHRleGVjdXRlV2FpdGluZ0NvbW1hbmQoc2VsZik7XG5cdFx0fSk7XG5cdH1cbn1cblxuLy8gQ2F1c2VzIGFsbCBydW5uaW5nIGNvbW1hbmRzIHRvIHRpbWVvdXRcbkNvbW1hbmRQb29sLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5jb21tYW5kUXVldWUuY2xlYXIoKTsgLy8gQ2xlYXIgY29tbWFuZCBxdWV1ZVxuXHR0aGlzLmlkbGVDbWRXYWl0aW5nID0gbnVsbDsgLy8gVGhyb3cgYXdheSBhbnkgd2FpdGluZyBjb21tYW5kXG5cblx0Zm9yKHZhciBjbWRJZCBpbiB0aGlzLmNvbW1hbmRNYXApIHtcblx0XHR2YXIgY21kID0gdGhpcy5jb21tYW5kTWFwW2NtZElkXTtcblx0XHRpZihjbWQuaW50ZXJuYWwuZXhlY3V0aW9uU3RhcnRlZCAmJiAhY21kLmludGVybmFsLmV4ZWN1dGlvbkVuZGVkKSB7XG5cdFx0XHRjbWQudGVybWluYXRlKHRoaXMpO1xuXHRcdH1cblx0fVxufVxuXG4vLyBFeGVjdXRlIGEgY29tbWFuZCBpZiBkb2VzIG5vdCBleGNlZWQgY29tbWFuZCBjb3VudCBsaW1pdCBhbmQgY29tbWFuZCBxdWV1ZSBpcyBlbXB0eVxuLy8gb3RoZXJ3aXNlIHF1ZXVlIGNvbW1hbmQgZm9yIGxhdGVyIGV4ZWN1dGlvbi5cbmZ1bmN0aW9uIGV4ZWN1dGVDb21tYW5kKHBvb2wsIGNtZCwgcHJpb3JpdGl6ZWQpIHtcblx0aWYoIXByaW9yaXRpemVkICYmIChwb29sLnJ1bm5pbmdDb21tYW5kcyA+PSBwb29sLmdvLm9wdGlvbnMubWF4Q29tbWFuZHNSdW5uaW5nKSkge1xuXHRcdC8vIEV4Y2VlZHMgbGltaXQsIHF1ZXVlIGNvbW1hbmQgaW5zdGVhZCBvZiBydW5uaW5nXG5cdFx0cG9vbC5jb21tYW5kUXVldWUuZW5xdWV1ZShjbWQpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIEV4ZWN1dGUgY29tbWFuZFx0XG5cdFx0Y21kLmV4ZWN1dGUocG9vbCk7XHRcblx0fVxufVxuXG4vLyBSZXNldCBuZXh0Q29tbWFuZElkIGlmIGdyb3dpbmcgcGFzdCBsaW1pdFxuLy8gTGltaXQgc2hvdWxkIGJlIHNldCBoaWdoIGVub3VnaCBzbyB0aGF0IHRoZSBvbGQgY29tbWFuZCBmb3IgSUQgMFxuLy8gbW9zdCBsaWtlbHkgaGFzIHJlc3BvbmRlZCBvciB0aW1lZCBvdXQgYW5kIHdpbGwgbm90IGNvbmZsaWN0IHdpdGggbmV3IG9uZXMuXG5mdW5jdGlvbiBpbmNyZW1lbnRDb21tYW5kSWQocG9vbCkge1xuXHRpZihwb29sLm5leHRDb21tYW5kSWQrKyA+PSBjb21tYW5kSWRMaW1pdCkge1xuXHRcdHBvb2wubmV4dENvbW1hbmRJZCA9IDA7XG5cdH1cbn1cblxuLy8gRXhlY3V0ZSBhIGNvbW1hbmQgcGxhbm5lZCB0byBydW4gb24gbmV4dCBpZGxlXG5mdW5jdGlvbiBleGVjdXRlV2FpdGluZ0NvbW1hbmQocG9vbCkge1xuXHR2YXIgdG9FeGVjdXRlID0gcG9vbC5pZGxlQ21kV2FpdGluZztcblx0cG9vbC5pZGxlQ21kV2FpdGluZyA9IG51bGw7XG5cdHBvb2wucGxhbkV4ZWN1dGlvbih0b0V4ZWN1dGUuY21kLFxuXHRcdHRvRXhlY3V0ZS5wcmlvcml0aXplZCxcblx0XHR0b0V4ZWN1dGUub3B0aW9uc1xuXHQpO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduLFxuXHR1dGlsID0gcmVxdWlyZSgndXRpbCcpLFxuXHRmcyA9IHJlcXVpcmUoJ2ZzJyksXHRcblx0bWlzYyA9IHJlcXVpcmUoJy4vbWlzYycpLFxuXHRFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIsXG5cdENvbW1hbmRQb29sID0gcmVxdWlyZSgnLi9jb21tYW5kcG9vbCcpLkNvbW1hbmRQb29sXHRcblx0U2lnbmFscyA9IHJlcXVpcmUoJy4vY29tbWFuZCcpLlNpZ25hbHM7XG5cbi8vIENyZWF0ZSBhIG5ldyBHby1vYmplY3QgZm9yIHRoZSBzcGVjaWZpZWQgLmdvLWZpbGUuXG4vLyBXaWxsIGFsc28gaW50aWFsaXplIEdvLW9iamVjdCBpZiBzZWNvbmQgcGFyYW1ldGVyIGlzIHRydWUuXG4vL1xuLy8gVGhyb3dzIGVycm9yIGlmIG5vIHBhdGggcHJvdmlkZWQgdG8gLmdvLWZpbGUuXG51dGlsLmluaGVyaXRzKEdvLCBFdmVudEVtaXR0ZXIpO1xuZXhwb3J0cy5HbyA9IEdvO1xuZnVuY3Rpb24gR28ob3B0aW9ucywgY2FsbGJhY2spIHtcblx0aWYob3B0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMgPT09IG51bGwpIHtcblx0XHRtaXNjLnJhaXNlRXJyb3IoJ05vIG9wdGlvbnMgcHJvdmlkZWQuJylcblx0fVxuXHRpZihvcHRpb25zLnBhdGggPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMucGF0aCA9PSBudWxsKSB7XG5cdFx0bWlzYy5yYWlzZUVycm9yKCdObyBwYXRoIHByb3ZpZGVkIHRvIC5nby1maWxlLicpO1xuXHR9XG5cblx0bWlzYy5tZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcblx0XHRtYXhDb21tYW5kc1J1bm5pbmc6IDEwLFxuXHRcdGRlZmF1bHRDb21tYW5kVGltZW91dFNlYzogNSxcblx0XHRjd2Q6IHByb2Nlc3MuY3dkKCksXG5cdH0pO1xuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG5cdHRoaXMuZ29GaWxlID0gb3B0aW9ucy5wYXRoO1xuXHR0aGlzLnByb2MgPSBudWxsO1xuXHR0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7IC8vIHRydWUgd2hlbiBHbyBoYXMgYmVlbiBpbml0aWFsaXplZCwgYmFjayB0byBmYWxzZSB3aGVuIEdvIGNsb3Nlc1xuXHR0aGlzLmNsb3NlUGVuZGluZyA9IGZhbHNlOyAvLyB0cnVlIHdoZW4gY2xvc2UoKSBoYXMgYmVlbiBjYWxsZWQgYW5kIG5vIG1vcmUgY29tbWFuZHMgc2hvdWxkIGJlIHBsYW5uZWRcblx0dGhpcy50ZXJtaW5hdGVQZW5kaW5nID0gZmFsc2U7IC8vIHRydWUgd2hlbiB0ZXJtaW5hdGUoKSBoYXMgYmVlbiBjYWxsZWRcblx0dGhpcy5jb21tYW5kUG9vbCA9IG5ldyBDb21tYW5kUG9vbCh0aGlzKVxuXG5cdGlmKG9wdGlvbnMuaW5pdEF0T25jZSkge1xuXHRcdHRoaXMuaW5pdChjYWxsYmFjayk7XG5cdH1cbn1cblxuLy8gSW5pdGlhbGl6ZSBieSBsYXVuY2hpbmcgZ28gcHJvY2VzcyBhbmQgcHJlcGFyZSBmb3IgY29tbWFuZHMuXG4vLyBEbyBhcyBlYXJseSBhcyBwb3NzaWJsZSB0byBhdm9pZCBkZWxheSB3aGVuIGV4ZWN1dGluZyBmaXJzdCBjb21tYW5kLlxuLy9cbi8vIGNhbGxiYWNrIGhhcyBwYXJhbWV0ZXJzIChlcnIpXG5Hby5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHRcdFxuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdGZzLmV4aXN0cyh0aGlzLmdvRmlsZSwgZnVuY3Rpb24oZXhpc3RzKSB7XG5cdFx0aWYoIWV4aXN0cykge1x0XG5cdFx0XHRtaXNjLmNhbGxiYWNrSWZBdmFpbGFibGUoY2FsbGJhY2ssIG1pc2MuZ2V0RXJyb3IoJy5nby1maWxlIG5vdCBmb3VuZCBmb3IgZ2l2ZW4gcGF0aC4nKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gc2ltcGxlIGV4dGVuc2lvbiBjaGVjayB0byBkZXRlY3QgaWYgaXRzIGEgdW4gY29tcGlsZXMgLmdvIGZpbGVcblx0XHRpZiAoc2VsZi5nb0ZpbGUuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICcuZ28nKSB7XG5cdFx0XHQvLyBTcGF3biBnbyBwcm9jZXNzIHdpdGhpbiBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5XG5cdFx0XHRzZWxmLnByb2MgPSBzcGF3bignZ28nLCBbJ3J1bicsIHNlbGYuZ29GaWxlXSwgeyBjd2Q6IHNlbGYub3B0aW9ucy5jd2QsIGVudjogcHJvY2Vzcy5lbnYgfSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFNwYXduIGdvIGNvbXBpbGVkIGZpbGVcblx0XHRcdHNlbGYucHJvYyA9IHNwYXduKCBzZWxmLmdvRmlsZSwgW10sIHsgY3dkOiBzZWxmLm9wdGlvbnMuY3dkLCBlbnY6IHByb2Nlc3MuZW52IH0pO1xuXHRcdH1cblxuXG5cdFx0Ly8gU2V0dXAgaGFuZGxlcnNcblx0XHRzZWxmLnByb2Muc3Rkb3V0Lm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRoYW5kbGVTdGRvdXQoc2VsZiwgZGF0YSk7XG5cdFx0fSk7XG5cdFx0c2VsZi5wcm9jLnN0ZGVyci5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0aGFuZGxlRXJyKHNlbGYsIGRhdGEsIGZhbHNlKTtcblx0XHR9KTtcblx0XHRzZWxmLnByb2Mub24oJ2Nsb3NlJywgZnVuY3Rpb24oKXtcblx0XHRcdGhhbmRsZUNsb3NlKHNlbGYpO1xuXHRcdH0pO1x0XHRcblxuXHRcdC8vIEluaXQgY29tcGxldGVcblx0XHRzZWxmLmluaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRtaXNjLmNhbGxiYWNrSWZBdmFpbGFibGUoY2FsbGJhY2ssIG51bGwpO1xuXHR9KTtcbn1cblxuLy8gR3JhY2VmdWxseSBjbG9zZSBHbyBieSBzZW5kaW5nIHRlcm1pbmF0aW9uIHNpZ25hbCBhZnRlciBhbGwgZXhlY3V0aW5nIGNvbW1hbmRzXG4vLyBoYXMgZW5kZWQgdGhlaXIgZXhlY3V0aW9uLlxuLy8gUmV0dXJucyB0cnVlIGlmIGNsb3NlIGhhcyBiZWVuIHN0YXJ0ZWQsIG9yIGZhbHNlIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBpZiBpdFxuLy8gYWxyZWFkeSBoYXMgYSBjbG9zZSBwZW5kaW5nLlxuR28ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGlmKHRoaXMuaW5pdGlhbGl6ZWQgJiYgIXRoaXMuY2xvc2VQZW5kaW5nICYmICF0aGlzLnRlcm1pbmF0ZVBlbmRpbmcpIHtcblx0XHR0aGlzLmNsb3NlUGVuZGluZyA9IHRydWU7XG5cdFx0Ly8gU2VuZCBwcmlvcml0aXplZCB0ZXJtaW5hdGlvbiBzaWduYWxcblx0XHR0aGlzLmNvbW1hbmRQb29sLnBsYW5PbklkbGUoU2lnbmFscy5UZXJtaW5hdGlvbiwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuLy8gSGFyZCB0ZXJtaW5hdGUgYnkgc2VuZGluZyB0ZXJtaW5hdGlvbiBvbiBhbGwgY29tbWFuZHMgYW5kIHRlcm1pbmF0aW9uIHNpZ25hbCB0byBHb1xuLy8gUmV0dXJucyB0cnVlIGlmIHRlcm1pbmF0aW9uIGhhcyBiZWVuIHN0YXJ0ZWQsIG9yIGZhbHNlIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBpZiBpdFxuLy8gYWxyZWFkeSBoYXMgYSB0ZXJtaW5hdGlvbiBwZW5kaW5nLlxuR28ucHJvdG90eXBlLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGVybWluYXRlKHRoaXMsIHRydWUpO1xufVxuXG4vLyBDcmVhdGUgYW5kIGV4ZWN1dGUgb3IgcXVldWUgYSBjb21tYW5kIG9mIEpTT04gZGF0YVxuLy8gV2lsbCBub3QgcXVldWUgY29tbWFuZCBpZiBHbyBpcyBub3QgaW5pdGlhbGl6ZWQgb3IgaGFzIGJlZW4gY2xvc2VkIChvciBjbG9zZSBwZW5kaW5nKVxuLy8gVGFrZXMgcGFyYW1ldGVyczpcbi8vIFx0XHRkYXRhIChyZXF1aXJlZCkgLSBhY3R1YWwgY29tbWFuZCBKU09OXG4vL1x0XHRjYWxsYmFjayAocmVxdWlyZWQpIC0gdGhlIGNhbGxiYWNrIHRvIGNhbGwgd2l0aCBwb3NzaWJsZSByZXN1bHQgd2hlbiBleGVjdXRpb24gZW5kc1xuLy9cdFx0b3B0aW9ucyAob3B0aW9uYWwpIC0gb3ZlcnJpZGVzIGRlZmF1bHQgZXhlY3V0aW9uIG9wdGlvbnNcbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgY29tbWFuZCB3YXMgcGxhbm5lZCBmb3IgZXhlY3V0aW9uLCBvdGhlcndpc2UgZmFsc2UuXG5Hby5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSB7XHRcblx0aWYodGhpcy5pbml0aWFsaXplZCAmJiAhdGhpcy5jbG9zZVBlbmRpbmcgJiYgIXRoaXMudGVybWluYXRlUGVuZGluZykge1xuXHRcdC8vIEltcG9ydGFudCB0byBub3QgbGVhdmUgZ28gaW4gYW4gaW5maW5pdGUgbG9vcCBlYXRpZyBjcHVcblx0XHR0cnkgeyAvLyBDb250YWluIG91dGVyIGV4Y2VwdGlvbnMgYW5kIGNsb3NlIGdvIGJlZm9yZSByZXRocm93aW5nIGV4Y2VwdGlvbi5cblx0XHRcdHRoaXMuY29tbWFuZFBvb2wucGxhbkV4ZWN1dGlvbih0aGlzLmNvbW1hbmRQb29sLmNyZWF0ZUNvbW1hbmQoZGF0YSwgY2FsbGJhY2spLCBmYWxzZSwgb3B0aW9ucyk7XHRcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRoYW5kbGVFcnIodGhpcywgZSwgZmFsc2UpO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTsgLy8gUmV0dXJuIHRydWUgc2luY2UgdGhlIGNvbW1hbmQgaGFzIGJlZW4gcGxhbm5lZCBmb3IgZXhlY3V0aW9uXG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlOyAvLyBUaGUgY29tbWFuZCB3YXNuJ3QgcGxhbm5lZCBmb3IgZXhlY3V0aW9uLCByZXR1cm4gZmFsc2Vcblx0fVxufVxuXG4vLyByZXNldCB0aGUgYnVmZmVyRGF0YSB3aXRoIGFuIGVtcHR5IHN0cmluZ1xudmFyIGJ1ZmZlckRhdGEgPSBcIlwiO1xuXG4vLyBSZWNlaXZlIGRhdGEgZnJvbSBnby1tb2R1bGVcbmZ1bmN0aW9uIGhhbmRsZVN0ZG91dChnbywgZGF0YSkge1xuXG5cdC8vIGFwcGVuZCBkYXRhIHRvIHRoZSBidWZmZXIgZm9yIGV2ZXJ5IHN0ZG91dFxuICAgIGJ1ZmZlckRhdGEgKz0gZGF0YS50b1N0cmluZygpO1xuXG4gICAgLy8gaWYgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBtZXNzYWdlIGluIHRoZSBzdGRvdXQgcGFyc2UgaXRcblx0Ly8gYW5kIHJlc2V0IHRoZSBidWZmZXIgZm9yIHRoZSBuZXh0IHN0ZG91dFxuICAgIGlmIChidWZmZXJEYXRhLmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICAgIC8vIFJlc3BvbnNlIG1heSBiZSBzZXZlcmFsIGNvbW1hbmQgcmVzcG9uc2VzIHNlcGFyYXRlZCBieSBuZXcgbGluZXNcbiAgICAgICAgYnVmZmVyRGF0YS50b1N0cmluZygpLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgICAgLy8gRGlzY2FyZCBlbXB0eSBsaW5lc1xuICAgICAgICAgICAgaWYocmVzcC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgZWFjaCBjb21tYW5kIHJlc3BvbnNlIHdpdGggYSBldmVudC1sb29wIGluIGJldHdlZW4gdG8gYXZvaWQgYmxvY2tpbmdcbiAgICAgICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7cGFyc2VSZXNwb25zZShnbywgcmVzcCl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJ1ZmZlckRhdGEgPSBcIlwiO1xuICAgIH1cbn1cblxuLy8gUGFyc2UgYSBfc2luZ2xlXyBjb21tYW5kIHJlc3BvbnNlIGFzIEpTT04gYW5kIGhhbmRsZSBpdFxuLy8gSWYgcGFyc2luZyBmYWlscyBhIGludGVybmFsIGVycm9yIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCB3aXRoIHRoZSByZXNwb25zZSBkYXRhXG5mdW5jdGlvbiBwYXJzZVJlc3BvbnNlKGdvLCByZXNwKSB7XG5cdHZhciBwYXJzZWQ7XG5cdHRyeSB7XG5cdFx0cGFyc2VkID0gSlNPTi5wYXJzZShyZXNwKTtcblx0fSBjYXRjaCAoZSkge1x0XHRcblx0XHRoYW5kbGVFcnIoZ28sIHJlc3AsIHRydWUpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIEltcG9ydGFudCB0byBub3QgbGVhdmUgZ28gaW4gYW4gaW5maW5pdGUgbG9vcCBlYXRpZyBjcHVcblx0dHJ5IHsgLy8gQ29udGFpbiBvdXRlciBleGNlcHRpb25zIGFuZCBjbG9zZSBnbyBiZWZvcmUgcmV0aHJvd2luZyBleGNlcHRpb24uXG5cdFx0Z28uY29tbWFuZFBvb2wuaGFuZGxlUmVzcG9uc2UocGFyc2VkKSAvLyBIYW5kbGUgcmVzcG9uc2Ugb3V0c2lkZSB0aHJvdyB0byBhdm9pZCBjYXRjaGluZyB0aG9zZSBleGNlcHRpb25zXHRcblx0fSBjYXRjaCAoZSkge1xuXHRcdGhhbmRsZUVycihnbywgZSwgZmFsc2UpO1xuXHR9XHRcbn1cblxuLy8gRW1pdCBlcnJvciBldmVudCBvbiBnbyBpbnN0YW5jZSwgcGFzcyB0aHJvdWdoIHJhdyBlcnJvciBkYXRhXG4vLyBFcnJvcnMgbWF5IGVpdGhlciBiZSBpbnRlcm5hbCBwYXJzZXIgZXJyb3JzIG9yIGV4dGVybmFsIGVycm9ycyByZWNlaXZlZCBmcm9tIHN0ZGVyclxuZnVuY3Rpb24gaGFuZGxlRXJyKGdvLCBkYXRhLCBwYXJzZXIpIHtcdFxuXHRpZighcGFyc2VyKSB7IC8vIElmIGV4dGVybmFsIGVycm9yLCB0ZXJtaW5hdGUgYWxsIGNvbW1hbmRzXG5cdFx0dGVybWluYXRlKGdvLCBmYWxzZSk7XG5cdH1cblxuXHRpZihnby5saXN0ZW5lcnMoJ2Vycm9yJykubGVuZ3RoID4gMCkgeyAvLyBPbmx5IGVtaXQgZXZlbnQgaWYgdGhlcmUgYXJlIGxpc3RlbmVyc1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBFbWl0IGFueSBldmVudCBvbiBuZXh0IHRpY2tcblx0XHRcdGdvLmVtaXQoJ2Vycm9yJywge3BhcnNlcjogcGFyc2VyLCBkYXRhOiBkYXRhfSk7XG5cdFx0fSk7XG5cdH1cdFxufVxuXG4vLyBHbyBwYW5pYyBhbmQgcHJvY2VzcyBlbmRzIGNhdXNlcyBjYWxscyB0byB0aGlzXG4vLyBFbWl0IGNsb3NlIGV2ZW50IG9uIGdvIGluc3RhbmNlXG5mdW5jdGlvbiBoYW5kbGVDbG9zZShnbykge1xuXHQvLyBJZiBwcm9jZXNzIGNsb3NlcyB3ZSBzZXQgaW5pdGlhbGl6ZWQgdG8gZmFsc2UgdG8gYXZvaWQgaW52YWxpZCBjbG9zZSgpIG9yIGV4ZWN1dGUoKVx0XG5cdGdvLmluaXRpYWxpemVkID0gZmFsc2U7XG5cdGlmKGdvLmxpc3RlbmVycygnY2xvc2UnKS5sZW5ndGggPiAwKSB7IC8vIE9ubHkgZW1pdCBldmVudCBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzXG5cdFx0Z28uZW1pdCgnY2xvc2UnKTtcblx0fVx0XHRcbn1cblxuLy8gVGVybWluYXRlIGJ5IHNlbmRpbmcgdGVybWluYXRpb24gb24gYWxsIGNvbW1hbmRzLlxuLy8gSWYgY2FsbGVkIHdpdGggdHJ1ZSBpdCB3aWxsIGFsc28gZGlyZWN0bHkgdHJ5IHRvIHNlbmQgYSB0ZXJtaW5hdGlvbiBzaWduYWwgdG8gZ29cbmZ1bmN0aW9uIHRlcm1pbmF0ZShnbywgd2l0aFNpZ25hbCkge1xuXHRpZihnby5pbml0aWFsaXplZCAmJiAhZ28udGVybWluYXRlUGVuZGluZykge1xuXHRcdGdvLnRlcm1pbmF0ZVBlbmRpbmcgPSB0cnVlO1xuXG5cdFx0Ly8gRG8gdGhlIGFjdHVhbCB0ZXJtaW5hdGlvbiBhc3luY2hyb25vdXNseVxuXHRcdC8vIENhbGxiYWNrcyB3aWxsIGJlIGVhY2ggdGVybWluYXRlZCBjb21tYW5kIG9yIG5vdGhpbmdcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7XG5cdFx0XHQvLyBUZWxsIGNvbW1hbmQgcG9vbCB0byBraWxsIGFsbCBjb21tYW5kc1xuXHRcdFx0Z28uY29tbWFuZFBvb2wudGVybWluYXRlKCk7XHRcdFx0XG5cblx0XHRcdC8vIFNlbmQgc2lnbmFsIGFmdGVyIGNvbW1hbmQgcG9vbCB0ZXJtaW5hdGlvbiwgb3RoZXJ3aXNlIGl0IHdvdWxkXG5cdFx0XHQvLyBiZSByZW1vdmVkIGJ5IHRlcm1pbmF0ZSgpXG5cdFx0XHRpZih3aXRoU2lnbmFsKSB7XHRcdFx0XHRcdFxuXHRcdFx0XHRnby5jb21tYW5kUG9vbC5wbGFuRXhlY3V0aW9uKFNpZ25hbHMuVGVybWluYXRpb24sIHRydWUpO1x0XHRcdFx0XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cdFxufSIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gQ29udGFpbnMgZ2VuZXJhbCBoZWxwZXJzXG5cbi8vIEludm9rZSBjYWxsYmFjayBpZiBub3QgdW5kZWZpbmVkIHdpdGggcHJvdmlkZWQgcGFyYW1ldGVyXG5leHBvcnRzLmNhbGxiYWNrSWZBdmFpbGFibGUgPSBmdW5jdGlvbihjYWxsYmFjaywgcGFyYW0pIHtcblx0aWYodHlwZW9mIGNhbGxiYWNrICE9IHVuZGVmaW5lZCkge1xuXHRcdGNhbGxiYWNrKHBhcmFtKTtcblx0fVxufVxuXG5leHBvcnRzLnJhaXNlRXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuXHR0aHJvdyBnZXRFcnJvcihlcnJvcik7XG59XG5cbmV4cG9ydHMuZ2V0RXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuXHRyZXR1cm4gbmV3IEVycm9yKCdnb25vZGU6ICcgKyBlcnJvcik7XG59XG5cbi8vIE1ha2Ugc3VyZSBvcHRpb25zIG5vdCBwcm92aWRlZCBhcmUgc2V0IHRvIGRlZmF1bHQgdmFsdWVzIFxuZXhwb3J0cy5tZXJnZURlZmF1bHRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucywgZGVmYXVsdHMpIHtcblx0Zm9yIChvcHQgaW4gZGVmYXVsdHMpIHtcblx0XHRpZihvcHRpb25zW29wdF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0b3B0aW9uc1tvcHRdID0gZGVmYXVsdHNbb3B0XTtcblx0XHR9IFxuXHR9XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEpvaG4gR3JhbnN0csO2bVxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5leHBvcnRzLlF1ZXVlID0gUXVldWU7XG5mdW5jdGlvbiBRdWV1ZSgpIHtcblx0dGhpcy5hcnIgPSBbXTtcbn1cblxuUXVldWUucHJvdG90eXBlLmVucXVldWUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdHRoaXMuYXJyLnB1c2goZWxlbWVudCk7XG59XG5cblF1ZXVlLnByb3RvdHlwZS5kZXF1ZXVlID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmFyci5zaGlmdCgpO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmFyci5sZW5ndGg7XG59XG5cblF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmdldExlbmd0aCgpID09PSAwO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5hcnIubGVuZ3RoID0gMDtcbn0iLCJpbXBvcnQgKiBhcyBQYXRoIGZyb20gXCJwYXRoXCI7XG5cbmltcG9ydCB7IGdldFBhdGgsIFNlYXJjaE9iamVjdCwgVHlwaWUsIFR5cGllUm93SXRlbSB9IGZyb20gXCIuL2luZGV4XCI7XG5cbmNvbnN0IGRlZmF1bHRJY29uID0gXCJwa2ctaWNvbi5wbmdcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RUeXBpZVBhY2thZ2Uge1xuICAgIHByb3RlY3RlZCBwYWNrYWdlRGF0YTogYW55O1xuICAgIHByb3RlY3RlZCBwYWNrYWdlTmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBpY29uOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHR5cGllOiBUeXBpZTtcbiAgICBwcm90ZWN0ZWQgcGtnQ29uZmlnOiBhbnk7XG4gICAgcHJvdGVjdGVkIHdpbjogYW55O1xuICAgIHByb3RlY3RlZCBkYjogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBwYWNrYWdlczogYW55O1xuXG4gICAgY29uc3RydWN0b3Iod2luLCBjb25maWcsIHBrZ05hbWUpIHtcbiAgICAgICAgdGhpcy53aW4gPSB3aW47XG4gICAgICAgIHRoaXMucGFja2FnZURhdGEgPSB7bmFtZTogcGtnTmFtZSwgcGF0aDogX19kaXJuYW1lfTtcbiAgICAgICAgdGhpcy5wYWNrYWdlTmFtZSA9IHBrZ05hbWU7XG4gICAgICAgIHRoaXMuZGIgPSBwa2dOYW1lO1xuICAgICAgICB0aGlzLnBrZ0NvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5pY29uID0gdGhpcy5nZXRQYWNrYWdlUGF0aCgpICsgZGVmYXVsdEljb247XG4gICAgICAgIHRoaXMudHlwaWUgPSBuZXcgVHlwaWUodGhpcy5wYWNrYWdlTmFtZSk7XG4gICAgICAgIHRoaXMucGFja2FnZXMgPSB7fTtcbiAgICAgICAgdGhpcy5sb2FkQ29uZmlnKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBhY2thZ2VOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhY2thZ2VOYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQYWNrYWdlUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZ2V0UGF0aChcInBhY2thZ2VzL1wiICsgdGhpcy5wYWNrYWdlTmFtZSArIFwiL1wiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RGVmYXVsdEl0ZW0odmFsdWUsIGRlc2NyaXB0aW9uID0gXCJcIiwgcGF0aCA9IFwiXCIsIGljb24gPSBcIlwiKTogVHlwaWVSb3dJdGVtIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBUeXBpZVJvd0l0ZW0oKTtcbiAgICAgICAgaXRlbS5zZXRUaXRsZSh2YWx1ZSk7XG4gICAgICAgIGl0ZW0uc2V0UGF0aChwYXRoID8gcGF0aCA6IHZhbHVlKTtcbiAgICAgICAgaXRlbS5zZXRJY29uKGljb24gPyBpY29uIDogdGhpcy5pY29uKTtcbiAgICAgICAgaXRlbS5zZXREZXNjcmlwdGlvbihkZXNjcmlwdGlvbiA/IGRlc2NyaXB0aW9uIDogXCJcIik7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnNlcnQodmFsdWUsIGRlc2NyaXB0aW9uID0gXCJcIiwgcGF0aCA9IFwiXCIsIGljb24gPSBcIlwiKSB7XG4gICAgICAgIHRoaXMuaW5zZXJ0SXRlbSh0aGlzLmdldERlZmF1bHRJdGVtKHZhbHVlLCBkZXNjcmlwdGlvbiwgcGF0aCwgaWNvbikpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnNlcnRJdGVtKGl0ZW06IFR5cGllUm93SXRlbSkge1xuICAgICAgICB0aGlzLnR5cGllLmluc2VydChpdGVtKS5nbygpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IGNvbnNvbGUubG9nKGRhdGEpKVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZWFyY2gob2JqOiBTZWFyY2hPYmplY3QsIGNhbGxiYWNrOiAoZGF0YSkgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLnR5cGllLmZ1enp5U2VhcmNoKG9iai52YWx1ZSkub3JkZXJCeShcInNjb3JlXCIpLmRlc2MoKS5nbygpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IGNhbGxiYWNrKGRhdGEpKVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWN0aXZhdGUocGtnTGlzdDogc3RyaW5nW10sIGl0ZW06IFR5cGllUm93SXRlbSwgY2FsbGJhY2s6IChkYXRhKSA9PiB2b2lkKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnTm8gb3ZlcnJpZGUgXCJhY3RpdmF0ZVwiIG1ldGhvZCBmb3VuZCBpbiAnICsgdGhpcy5wYWNrYWdlTmFtZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGVudGVyUGtnKHBrZ0xpc3Q6IHN0cmluZ1tdLCBpdGVtPzogVHlwaWVSb3dJdGVtLCBjYWxsYmFjaz86IChkYXRhKSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuZ2V0Rmlyc3RSZWNvcmRzKDEwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIocGtnTGlzdDogc3RyaW5nW10sIGNhbGxiYWNrOiAoZGF0YSkgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLmdldEZpcnN0UmVjb3JkcygxMCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZShwa2dMaXN0OiBzdHJpbmdbXSwgaXRlbTogVHlwaWVSb3dJdGVtLCBjYWxsYmFjazogKGRhdGEpID0+IHZvaWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKCdObyBvdmVycmlkZSBcInJlbW92ZVwiIG1ldGhvZCBmb3VuZCBpbiAnICsgdGhpcy5wYWNrYWdlTmFtZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEljb24oaWNvbikge1xuICAgICAgICByZXR1cm4gUGF0aC5qb2luKHRoaXMuZ2V0UGFja2FnZVBhdGgoKSwgaWNvbik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpcnN0UmVjb3JkcyhudW1PZlJlY29yZHM6IG51bWJlciA9IDEwKSB7XG4gICAgICAgIHRoaXMudHlwaWUuZ2V0Um93cyhudW1PZlJlY29yZHMpLm9yZGVyQnkoXCJjb3VudFwiKS5kZXNjKCkuZ28oKVxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHRoaXMud2luLnNlbmQoXCJyZXN1bHRMaXN0XCIsIHJlcykpXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKFwiZXJyb3IgZ2V0dGluZyBmaXJzdCByZWNvcmRzXCIsIGUpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9hZENvbmZpZygpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJObyBvdmVycmlkZSAnbG9hZENvbmZpZycgbWV0aG9kIGZvdW5kIGluIFwiICsgdGhpcy5wYWNrYWdlTmFtZSk7XG4gICAgICAgIGlmICh0aGlzLnBrZ0NvbmZpZy5zaG9ydGN1dCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWdpc3RlcmluZyBzaG9ydGN1dCBcIiArIHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0ICsgXCIgdG8gXCIgKyB0aGlzLmdldFBhY2thZ2VOYW1lKCkpO1xuICAgICAgICAgICAgdGhpcy53aW4ucmVnaXN0ZXJLZXkodGhpcy5wa2dDb25maWcuc2hvcnRjdXQsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLndpbi5zZW5kKFwiY2hhbmdlUGFja2FnZVwiLCBbdGhpcy5nZXRQYWNrYWdlTmFtZSgpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImRlc3Ryb3lpbmcgdGhlIHBhY2thZ2UhXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVucmVnaXN0ZXJcIiwgdGhpcy5wa2dDb25maWcpO1xuICAgICAgICBpZiAodGhpcy5wa2dDb25maWcuc2hvcnRjdXQpIHtcbiAgICAgICAgICAgIHRoaXMud2luLnVucmVnaXN0ZXJLZXkodGhpcy5wa2dDb25maWcuc2hvcnRjdXQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBHbG9iYWwge1xuXG4gICAgcHVibGljIHN0YXRpYyBzZXR0aW5nczogYW55O1xuICAgIHB1YmxpYyBzdGF0aWMgc3RhcnRUaW1lOiBudW1iZXI7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFRpbWVTaW5jZUluaXQoKSB7XG4gICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gQXBwR2xvYmFsLnN0YXJ0VGltZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFNldHRpbmdzKCkge1xuICAgICAgICByZXR1cm4gQXBwR2xvYmFsLnNldHRpbmdzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc2V0KG5hbWU6IHN0cmluZywgb2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgZ2xvYmFsW25hbWVdID0gb2JqO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0KG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIHJldHVybiBnbG9iYWxbbmFtZV07XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHb30gZnJvbSBcImdvbm9kZVwiO1xuaW1wb3J0IFBhY2tldCBmcm9tIFwiLi9tb2RlbHMvUGFja2V0XCI7XG4vLyBpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5jb25zdCBhcHBHbG9iYWw6IGFueSA9IGdsb2JhbDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29EaXNwYXRjaGVyIHtcblxuICAgIHB1YmxpYyBzdGF0aWMgZ286IGFueTtcbiAgICBwdWJsaWMgc3RhdGljIGxpc3RlbmluZzogYm9vbGVhbjtcbiAgICBwcml2YXRlIHN0YXRpYyBleGVjdXRhYmxlUGF0aDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodHlwaWVFeGVjdXRhYmxlOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTdGFydGluZyBUeXBpZSBTZXJ2aWNlIGZvciB0aGUgZmlyc3QgdGltZVwiLCB0eXBpZUV4ZWN1dGFibGUpO1xuICAgICAgICBHb0Rpc3BhdGNoZXIuZXhlY3V0YWJsZVBhdGggPSB0eXBpZUV4ZWN1dGFibGU7XG4gICAgICAgIHRoaXMuc3RhcnRQcm9jZXNzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHNlbmQocGFja2V0OiBQYWNrZXQpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInNlbmQgcGFja2V0XCIsIHBhY2tldCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uZXhlY3V0ZShwYWNrZXQsIChyZXN1bHQ6IGFueSwgcmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZ290IGJhY2tcIiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsb3NlKCk6IHZvaWQge1xuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uY2xvc2UoKTtcbiAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnRQcm9jZXNzKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlN0YXJ0aW5nIFR5cGllIFNlcnZpY2VcIiwgR29EaXNwYXRjaGVyLmV4ZWN1dGFibGVQYXRoKTtcbiAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IGZhbHNlO1xuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28gPSBuZXcgR28oe1xuICAgICAgICAgICAgZGVmYXVsdENvbW1hbmRUaW1lb3V0U2VjOiA2MCxcbiAgICAgICAgICAgIG1heENvbW1hbmRzUnVubmluZzogMTAsXG4gICAgICAgICAgICBwYXRoOiBHb0Rpc3BhdGNoZXIuZXhlY3V0YWJsZVBhdGgsXG4gICAgICAgIH0pO1xuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uaW5pdCh0aGlzLnJlZ2lzdGVyKTtcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLm9uKFwiY2xvc2VcIiwgKCkgPT4gdGhpcy5vbkNsb3NlKCkpO1xuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28ub24oXCJlcnJvclwiLCBlcnIgPT4gY29uc29sZS5lcnJvcihcImdvIGRpc3BhdGNoZXIgaGFkIGVycm9yXCIsIGVycikpO1xuICAgICAgICAvLyBzZXRUaW1lb3V0KCgpID0+IEdvRGlzcGF0Y2hlci5nby50ZXJtaW5hdGUoKSwgMTAwMDApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DbG9zZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJnbyBkaXNwYXRjaGVyIHdhcyBjbG9zZWRcIik7XG4gICAgICAgIGlmIChHb0Rpc3BhdGNoZXIubGlzdGVuaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0UHJvY2VzcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWdpc3RlcigpOiB2b2lkIHtcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLmV4ZWN1dGUoXG4gICAgICAgICAgICB7Y29tbWFuZDogXCJzdGFydFwifSwgKHJlc3VsdDogYW55LCByZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5vaykgeyAgLy8gQ2hlY2sgaWYgcmVzcG9uc2UgaXMgb2tcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gb3VyIGNhc2Ugd2UganVzdCBlY2hvIHRoZSBjb21tYW5kLCBzbyB3ZSBjYW4gZ2V0IG91ciB0ZXh0IGJhY2tcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUeXBpZSByZXNwb25kZWQ6IFwiLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIGFwcEdsb2JhbC5jb3JlTG9nUGF0aCA9IHJlc3BvbnNlLmxvZztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVyciA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgR29EaXNwYXRjaGVyIGZyb20gXCIuL0dvRGlzcGF0Y2hlclwiO1xuaW1wb3J0IFBhY2tldCBmcm9tIFwiLi9tb2RlbHMvUGFja2V0XCI7XG5pbXBvcnQgU2VhcmNoUGF5bG9hZCBmcm9tIFwiLi9tb2RlbHMvU2VhcmNoUGF5bG9hZFwiO1xuaW1wb3J0IFR5cGllUm93SXRlbSBmcm9tIFwiLi9tb2RlbHMvVHlwaWVSb3dJdGVtXCI7XG5cbi8vIHRoaXMgaXMgYSBsaXR0bGUgaGFjayB0byB1c2UgdGhlIGdsb2JhbCB2YXJpYWJsZSBpbiBUeXBlU2NyaXB0XG4vLyBpdCBpcyB1c2VkIHRvIGdldCB0aGUgZ28gZGlzcGF0Y2hlciBmcm9tIHRoZSBtYWluIHByb2Nlc3Mgd2UgbmVlZCBpdCBhcyBhIHNpbmdsZXRvblxuY29uc3QgZ2xvYmFsQW55OiBhbnkgPSBnbG9iYWw7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGllIHtcbiAgICBwcml2YXRlIHNlYXJjaDogU2VhcmNoUGF5bG9hZCA9IG5ldyBTZWFyY2hQYXlsb2FkKCk7XG4gICAgcHJpdmF0ZSBkYjogc3RyaW5nO1xuICAgIHByaXZhdGUgcGFja2FnZU5hbWU6IHN0cmluZztcbiAgICBwcml2YXRlIGNvbW1hbmQ6IHN0cmluZztcbiAgICBwcml2YXRlIHBheWxvYWQ6IGFueTtcbiAgICBwcml2YXRlIGdvRGlzcGF0Y2hlcjogR29EaXNwYXRjaGVyO1xuXG4gICAgY29uc3RydWN0b3IocGFja2FnZU5hbWU6IHN0cmluZywgZGI/OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5nb0Rpc3BhdGNoZXIgPSBnbG9iYWxBbnkuR29EaXNwYXRjaGVyO1xuICAgICAgICB0aGlzLmRiID0gZGIgPyBkYiA6IHBhY2thZ2VOYW1lO1xuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gcGFja2FnZU5hbWU7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiXCI7XG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHt9O1xuICAgIH1cblxuICAgIHB1YmxpYyBwYXN0ZVRleHQoKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwicGFzdGVUZXh0XCI7XG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQ29sbGVjdGlvbigpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJhZGRDb2xsZWN0aW9uXCI7XG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHtuYW1lOiB0aGlzLnBhY2thZ2VOYW1lfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZUNhbGxlZChpdGVtKSB7XG4gICAgICAgIGl0ZW0uY291bnRVcCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5pbnNlcnQoaXRlbSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIG11bHRpcGxlSW5zZXJ0KGl0ZW1MaXN0KSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwibXVsdGlwbGVJbnNlcnRcIjtcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gaXRlbUxpc3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnNlcnQoaXRlbTogVHlwaWVSb3dJdGVtLCBwZXJzaXN0ID0gdHJ1ZSkge1xuICAgICAgICBpdGVtLnNldERCKHRoaXMuZGIpO1xuICAgICAgICBpdGVtLnNldFBhY2thZ2UodGhpcy5wYWNrYWdlTmFtZSk7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IHBlcnNpc3QgPyBcImluc2VydFBlcnNpc3RcIiA6IFwiaW5zZXJ0XCI7XG4gICAgICAgIHRoaXMucGF5bG9hZCA9IGl0ZW0udG9QYXlsb2FkKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmUoaXRlbTogVHlwaWVSb3dJdGVtKSB7XG4gICAgICAgIGl0ZW0uc2V0REIoaXRlbS5nZXREQigpKTtcbiAgICAgICAgaXRlbS5zZXRQYWNrYWdlKGl0ZW0uZ2V0UGFja2FnZSgpKTtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJyZW1vdmVcIjtcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gaXRlbS50b1BheWxvYWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEtleSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucGF5bG9hZC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnBheWxvYWQuZGIgPSB0aGlzLmRiO1xuICAgICAgICB0aGlzLnBheWxvYWQucGFja2FnZU5hbWUgPSB0aGlzLnBhY2thZ2VOYW1lO1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcImdldEtleVwiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RXhlY0xpc3QoKSB7XG4gICAgICAgIHRoaXMucGF5bG9hZC5kYiA9IHRoaXMuZGI7XG4gICAgICAgIHRoaXMucGF5bG9hZC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiZ2V0RXhlY0xpc3RcIjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGZ1enp5U2VhcmNoKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZWFyY2gudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zZWFyY2gudHlwZSA9IFwiZnV6enlcIjtcbiAgICAgICAgdGhpcy5zZWFyY2guZGIgPSB0aGlzLmRiO1xuICAgICAgICB0aGlzLnNlYXJjaC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwic2VhcmNoXCI7XG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHRoaXMuc2VhcmNoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Um93cyhsaW1pdDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoLmxpbWl0ID0gbGltaXQ7XG4gICAgICAgIHRoaXMuc2VhcmNoLnR5cGUgPSBcImdldFJvd3NcIjtcbiAgICAgICAgdGhpcy5zZWFyY2guZGIgPSB0aGlzLmRiO1xuICAgICAgICB0aGlzLnNlYXJjaC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwic2VhcmNoXCI7XG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHRoaXMuc2VhcmNoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UGtnKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gbmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldERCKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmRiID0gbmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG9yZGVyQnkoZmllbGQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaC5kaXJlY3Rpb24gPSBcImFzY1wiO1xuICAgICAgICB0aGlzLnNlYXJjaC5vcmRlckJ5ID0gZmllbGQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc2MoKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoLmRpcmVjdGlvbiA9IFwiYXNjXCI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXNjKCkge1xuICAgICAgICB0aGlzLnNlYXJjaC5kaXJlY3Rpb24gPSBcImRlc2NcIjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdvKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdvRGlzcGF0Y2hlci5zZW5kKG5ldyBQYWNrZXQodGhpcy5jb21tYW5kLCB0aGlzLnBheWxvYWQpKTtcbiAgICB9XG59XG4iLCJcbmltcG9ydCBBYnN0cmFjdFR5cGllUGFja2FnZSBmcm9tIFwiLi9BYnN0cmFjdFR5cGllUGFja2FnZVwiO1xuaW1wb3J0IEFwcEdsb2JhbCBmcm9tIFwiLi9BcHBHbG9iYWxcIjtcbmltcG9ydCBHb0Rpc3BhdGNoZXIgZnJvbSBcIi4vR29EaXNwYXRjaGVyXCI7XG5pbXBvcnQgUGFja2V0IGZyb20gXCIuL21vZGVscy9QYWNrZXRcIjtcbmltcG9ydCBTZWFyY2hPYmplY3QgZnJvbSBcIi4vbW9kZWxzL1NlYXJjaE9iamVjdFwiO1xuaW1wb3J0IFR5cGllUm93SXRlbSBmcm9tIFwiLi9tb2RlbHMvVHlwaWVSb3dJdGVtXCI7XG5pbXBvcnQgVHlwaWUgZnJvbSBcIi4vVHlwaWVcIjtcblxuZXhwb3J0IHtcbiAgICBBYnN0cmFjdFR5cGllUGFja2FnZSxcbiAgICBBcHBHbG9iYWwsXG4gICAgZ2V0UGF0aCxcbiAgICBHb0Rpc3BhdGNoZXIsXG4gICAgUGFja2V0LFxuICAgIFR5cGllLFxuICAgIFR5cGllUm93SXRlbSxcbiAgICBTZWFyY2hPYmplY3QsXG59O1xuXG5pbXBvcnQgKiBhcyBpc0RldiBmcm9tIFwiZWxlY3Ryb24taXMtZGV2XCI7XG5jb25zdCBnZXRQYXRoID0gKHN0YXRpY1BhdGgpID0+IHtcbiAgICBpZiAoIWlzRGV2KSB7XG4gICAgICAgIHJldHVybiBcIi4uL3N0YXRpYy9cIiArIHN0YXRpY1BhdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHN0YXRpY1BhdGg7XG4gICAgfVxufTtcbiIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFja2V0IHtcbiAgICBwcml2YXRlIGNvbW1hbmQgPSBcIlwiO1xuICAgIHByaXZhdGUgcGF5bG9hZDogb2JqZWN0ID0ge307XG4gICAgY29uc3RydWN0b3IoY29tbWFuZDogc3RyaW5nLCBwYXlsb2FkPzogb2JqZWN0KSB7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQgPyBwYXlsb2FkIDoge307XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoT2JqZWN0IHtcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZztcbiAgICBwdWJsaWMgcGtnTGlzdDogc3RyaW5nW107XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiO1xuICAgICAgICB0aGlzLnBrZ0xpc3QgPSBbXTtcbiAgICB9XG59XG4iLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaFBheWxvYWQge1xuICAgIHB1YmxpYyB0eXBlOiBzdHJpbmc7XG4gICAgcHVibGljIGxpbWl0OiBudW1iZXI7XG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmc7XG4gICAgcHVibGljIG9yZGVyQnk6IHN0cmluZztcbiAgICBwdWJsaWMgZGlyZWN0aW9uOiBzdHJpbmc7XG4gICAgcHVibGljIHBhY2thZ2VOYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIGRiOiBzdHJpbmc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudHlwZSA9IFwiZnV6enlcIjsgIC8vIGNhbiBiZSAnZnV6enknIHwgJycgfFxuICAgICAgICB0aGlzLmxpbWl0ID0gMTA7XG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiOyAgICAgICAgIC8vIHRoZSBhY3R1YWwgc2VhcmNoIHZhbHVcbiAgICAgICAgdGhpcy5vcmRlckJ5ID0gXCJzY29yZVwiOyAgLy8gdGhlIG5hbWUgb2YgdGhlIGZpZWxkIHRvIGJlIG9yZGVyZWQgYnlcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBcImRlc2NcIjtcbiAgICAgICAgdGhpcy5wYWNrYWdlTmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuZGIgPSBcIlwiO1xuICAgIH1cbn1cbiIsImltcG9ydCB7SUFjdGlvbn0gZnJvbSBcIi4vSUFjdGlvblwiO1xuaW1wb3J0IHtJTGFiZWx9IGZyb20gXCIuL0lMYWJlbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBpZVJvd0l0ZW0ge1xuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGF0YSk6IFR5cGllUm93SXRlbSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBuZXcgVHlwaWVSb3dJdGVtKCk7XG4gICAgICAgIGl0ZW0uc2V0REIoZGF0YS5kYiA/IGRhdGEuZGIgOiBcImdsb2JhbFwiKTtcbiAgICAgICAgaXRlbS5zZXRQYWNrYWdlKGRhdGEudCk7XG4gICAgICAgIGl0ZW0uc2V0QWN0aW9ucyhkYXRhLmEpO1xuICAgICAgICBpdGVtLnNldFRpdGxlKGRhdGEudGl0bGUpO1xuICAgICAgICBpdGVtLnNldFBhdGgoZGF0YS5wKTtcbiAgICAgICAgaXRlbS5zZXREZXNjcmlwdGlvbihkYXRhLmQpO1xuICAgICAgICBpdGVtLnNldEljb24oZGF0YS5pKTtcbiAgICAgICAgaXRlbS5zZXRDb3VudChkYXRhLmMpO1xuICAgICAgICBpdGVtLnNldFNjb3JlKGRhdGEuc2NvcmUpO1xuICAgICAgICBpdGVtLnNldFVuaXh0aW1lKGRhdGEudSk7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaXNQYWNrYWdlKGl0ZW06IFR5cGllUm93SXRlbSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gaXRlbS5kID09PSBcIlBhY2thZ2VcIlxuICAgICAgICAgICAgfHwgaXRlbS5kID09PSBcIlN1YlBhY2thZ2VcIlxuICAgICAgICAgICAgfHwgaXRlbS5wID09PSBcIlBhY2thZ2VcIlxuICAgICAgICAgICAgfHwgaXRlbS5wLnN0YXJ0c1dpdGgoXCJTdWJQYWNrYWdlfFwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGI6IHN0cmluZztcbiAgICBwdWJsaWMgZDogc3RyaW5nO1xuICAgIHB1YmxpYyBpOiBzdHJpbmc7XG4gICAgcHVibGljIHQ6IHN0cmluZztcbiAgICBwdWJsaWMgcDogc3RyaW5nO1xuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nO1xuICAgIHB1YmxpYyBjOiBudW1iZXI7XG5cbiAgICBwdWJsaWMgYT86IElBY3Rpb25bXTtcbiAgICBwdWJsaWMgbD86IElMYWJlbFtdO1xuICAgIHB1YmxpYyBzY29yZT86IG51bWJlcjtcbiAgICBwdWJsaWMgdT86IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHRpdGxlPzogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZGIgPSBcIlwiO1xuICAgICAgICB0aGlzLmQgPSBcIlwiO1xuICAgICAgICB0aGlzLmkgPSBcIlwiO1xuICAgICAgICB0aGlzLnQgPSBcIlwiO1xuICAgICAgICB0aGlzLnAgPSBcIlwiO1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGUgPyB0aXRsZSA6IFwiXCI7XG4gICAgICAgIHRoaXMuYyA9IDA7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFRpdGxlKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xuICAgICAgICB0aGlzLnRpdGxlID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy50aXRsZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0QWN0aW9ucyhhY3Rpb25MaXN0OiBJQWN0aW9uW10pOiBUeXBpZVJvd0l0ZW0ge1xuICAgICAgICB0aGlzLmEgPSBhY3Rpb25MaXN0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QWN0aW9ucygpOiBJQWN0aW9uW10gfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5hO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMYWJlbHMobGFiZWxMaXN0OiBJTGFiZWxbXSk6IFR5cGllUm93SXRlbSB7XG4gICAgICAgIHRoaXMubCA9IGxhYmVsTGlzdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExhYmVscygpOiBJTGFiZWxbXSB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmw7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFBhdGgodmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XG4gICAgICAgIHRoaXMucCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5wO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREQih2YWx1ZTogc3RyaW5nKTogVHlwaWVSb3dJdGVtIHtcbiAgICAgICAgdGhpcy5kYiA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0REIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XG4gICAgfVxuXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xuICAgICAgICB0aGlzLmQgPSB2YWx1ZSA/IHZhbHVlIDogXCJcIjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldERlc2NyaXB0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEljb24odmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XG4gICAgICAgIHRoaXMuaSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQYWNrYWdlKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xuICAgICAgICB0aGlzLnQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBhY2thZ2UoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0Q291bnQodmFsdWU6IG51bWJlcik6IFR5cGllUm93SXRlbSB7XG4gICAgICAgIHRoaXMuYyA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYztcbiAgICB9XG5cbiAgICBwdWJsaWMgY291bnRVcCgpOiBUeXBpZVJvd0l0ZW0ge1xuICAgICAgICB0aGlzLmMgPSB0aGlzLmMgKyAxO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VW5peHRpbWUodmFsdWU6IG51bWJlciB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VW5peHRpbWUoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0U2NvcmUodmFsdWU6IG51bWJlciB8IHVuZGVmaW5lZCk6IFR5cGllUm93SXRlbSB7XG4gICAgICAgIHRoaXMuc2NvcmUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNjb3JlKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnNjb3JlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b1BheWxvYWQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhOiB0aGlzLmdldEFjdGlvbnMoKSxcbiAgICAgICAgICAgIGM6IHRoaXMuZ2V0Q291bnQoKSxcbiAgICAgICAgICAgIGQ6IHRoaXMuZ2V0RGVzY3JpcHRpb24oKSxcbiAgICAgICAgICAgIGRiOiB0aGlzLmdldERCKCksXG4gICAgICAgICAgICBpOiB0aGlzLmdldEljb24oKSxcbiAgICAgICAgICAgIGw6IHRoaXMuZ2V0TGFiZWxzKCksXG4gICAgICAgICAgICBwOiB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgICAgIHQ6IHRoaXMuZ2V0UGFja2FnZSgpLFxuICAgICAgICAgICAgdGl0bGU6IHRoaXMuZ2V0VGl0bGUoKSxcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==