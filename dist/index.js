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

/***/ "./node_modules/typie-go/lib/command.js":
/*!**********************************************!*\
  !*** ./node_modules/typie-go/lib/command.js ***!
  \**********************************************/
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

var misc = __webpack_require__(/*! ./misc */ "./node_modules/typie-go/lib/misc.js");

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

/***/ "./node_modules/typie-go/lib/commandpool.js":
/*!**************************************************!*\
  !*** ./node_modules/typie-go/lib/commandpool.js ***!
  \**************************************************/
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

var misc = __webpack_require__(/*! ./misc */ "./node_modules/typie-go/lib/misc.js"),
	Queue = __webpack_require__(/*! ./queue */ "./node_modules/typie-go/lib/queue.js").Queue,	
	Command = __webpack_require__(/*! ./command */ "./node_modules/typie-go/lib/command.js").Command;

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

/***/ "./node_modules/typie-go/lib/gonode.js":
/*!*********************************************!*\
  !*** ./node_modules/typie-go/lib/gonode.js ***!
  \*********************************************/
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
	misc = __webpack_require__(/*! ./misc */ "./node_modules/typie-go/lib/misc.js"),
	EventEmitter = __webpack_require__(/*! events */ "events").EventEmitter,
	CommandPool = __webpack_require__(/*! ./commandpool */ "./node_modules/typie-go/lib/commandpool.js").CommandPool	
	Signals = __webpack_require__(/*! ./command */ "./node_modules/typie-go/lib/command.js").Signals;

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

/***/ "./node_modules/typie-go/lib/misc.js":
/*!*******************************************!*\
  !*** ./node_modules/typie-go/lib/misc.js ***!
  \*******************************************/
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

/***/ "./node_modules/typie-go/lib/queue.js":
/*!********************************************!*\
  !*** ./node_modules/typie-go/lib/queue.js ***!
  \********************************************/
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
        this.typie = new index_1.TypieCore(this.packageName);
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
                this.win.show();
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
const typie_go_1 = __webpack_require__(/*! typie-go */ "./node_modules/typie-go/lib/gonode.js");
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
        GoDispatcher.go = new typie_go_1.Go({
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

/***/ "./src/TypieCore.ts":
/*!**************************!*\
  !*** ./src/TypieCore.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Packet_1 = __webpack_require__(/*! ./models/Packet */ "./src/models/Packet.ts");
const SearchPayload_1 = __webpack_require__(/*! ./models/SearchPayload */ "./src/models/SearchPayload.ts");
// this is a little hack to use the global variable in TypeScript
// it is used to get the go dispatcher from the main process we need it as a singleton
const globalAny = global;
class TypieCore {
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
    getFilesList(allowedExt, dirList) {
        this.payload.db = this.db;
        this.payload.packageName = this.packageName;
        this.payload.allowedExt = allowedExt;
        this.payload.dirList = dirList;
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
exports.default = TypieCore;


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
const TypieCore_1 = __webpack_require__(/*! ./TypieCore */ "./src/TypieCore.ts");
exports.TypieCore = TypieCore_1.default;
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
        return this;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90eXBpZS1zZGsvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL3R5cGllLXNkay93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24taXMtZGV2L2luZGV4LmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy90eXBpZS1nby9saWIvY29tbWFuZC5qcyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvdHlwaWUtZ28vbGliL2NvbW1hbmRwb29sLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy90eXBpZS1nby9saWIvZ29ub2RlLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy90eXBpZS1nby9saWIvbWlzYy5qcyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvdHlwaWUtZ28vbGliL3F1ZXVlLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9BYnN0cmFjdFR5cGllUGFja2FnZS50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvQXBwR2xvYmFsLnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9Hb0Rpc3BhdGNoZXIudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL1R5cGllQ29yZS50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL21vZGVscy9QYWNrZXQudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL21vZGVscy9TZWFyY2hPYmplY3QudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL21vZGVscy9TZWFyY2hQYXlsb2FkLnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvVHlwaWVSb3dJdGVtLnRzIiwid2VicGFjazovL3R5cGllLXNkay9leHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJldmVudHNcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJmc1wiIiwid2VicGFjazovL3R5cGllLXNkay9leHRlcm5hbCBcInBhdGhcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJ1dGlsXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDbkVBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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SSxDQUFDLFFBQVEsRUFBRTtTQUN6QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBcEtELCtCQW9LQzs7Ozs7Ozs7Ozs7O0FDdktELDBDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLCtCOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6Ii4vZGlzdC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwidHlwaWUtc2RrXCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcInR5cGllLXNka1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ0eXBpZS1zZGtcIl0gPSBmYWN0b3J5KCk7XG59KShnbG9iYWwsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IGdldEZyb21FbnYgPSBwYXJzZUludChwcm9jZXNzLmVudi5FTEVDVFJPTl9JU19ERVYsIDEwKSA9PT0gMTtcbmNvbnN0IGlzRW52U2V0ID0gJ0VMRUNUUk9OX0lTX0RFVicgaW4gcHJvY2Vzcy5lbnY7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNFbnZTZXQgPyBnZXRGcm9tRW52IDogKHByb2Nlc3MuZGVmYXVsdEFwcCB8fCAvbm9kZV9tb2R1bGVzW1xcXFwvXWVsZWN0cm9uW1xcXFwvXS8udGVzdChwcm9jZXNzLmV4ZWNQYXRoKSk7XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIENvbW1hbmRzIG11c3QgYmUgZXhlY3V0ZWQgd2l0aGluIGEgY29tbWFuZCBwb29sIHRvIGxpbWl0IGV4ZWN1dGlvbiBjb3VudCBhbmQgdGltZS5cblxudmFyIG1pc2MgPSByZXF1aXJlKCcuL21pc2MnKTtcblxuLy8gQ3JlYXRlIGEgY29tbWFuZCBvYmplY3Qgd2l0aCBpZCwgY29tbWFuZCwgY2FsbGJhY2sgYW5kIG9wdGlvbmFsbHkgc2lnbmFsXG5leHBvcnRzLkNvbW1hbmQgPSBDb21tYW5kO1xuZnVuY3Rpb24gQ29tbWFuZChpZCwgY21kLCBjYWxsYmFjaywgc2lnbmFsKSB7XG5cdC8vIENvbnRhaW4gY29tbW9uIGRhdGEgdG8gYmUgc2hhcmVkIHdpdGggZ28tbW9kdWxlIGluIC5jb21tb25cblx0dGhpcy5jb21tb24gPSB7XG5cdFx0aWQ6IGlkLFxuXHRcdGNtZDogY21kLFxuXHRcdHNpZ25hbDogc2lnbmFsID09PSB1bmRlZmluZWQgPyAtMTogc2lnbmFsLCAvLyAtMSBpcyBubyBzaWduYWxcblx0fVxuXHQvLyBDb250YWluIGludGVybmFsIGRhdGEgbm90IHRvIGJlIHNlbnQgb3ZlciB0aGUgaW50ZXJmYWNlIGluIC5pbnRlcm5hbFxuXHR0aGlzLmludGVybmFsID0ge1xuXHRcdGNhbGxiYWNrOiBjYWxsYmFjayxcblx0XHRleGVjdXRpb25TdGFydGVkOiBmYWxzZSxcblx0XHRleGVjdXRpb25FbmRlZDogZmFsc2UsXG5cdH1cdFxufVxuXG4vLyBDYWxsIHRvIHNldCB0aGUgZXhlY3V0aW9uIG9wdGlvbnMgZm9yIHRoaXMgY29tbWFuZC5cbi8vIERlZmF1bHQgb3B0aW9ucyB3aWxsIGJlIGFkZGVkIGZvciB0aG9zZSBub3QgcHJvdmlkZWRcbkNvbW1hbmQucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihwb29sLCBvcHRpb25zKSB7XG5cdHRoaXMuaW50ZXJuYWwub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdG1pc2MubWVyZ2VEZWZhdWx0T3B0aW9ucyh0aGlzLmludGVybmFsLm9wdGlvbnMsIHtcblx0XHRjb21tYW5kVGltZW91dFNlYzogcG9vbC5nby5vcHRpb25zLmRlZmF1bHRDb21tYW5kVGltZW91dFNlYyxcblx0fSk7XG59XG5cbi8vIEV4ZWN1dGUgY29tbWFuZCBieSBzZW5kaW5nIGl0IHRvIGdvLW1vZHVsZVxuQ29tbWFuZC5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKHBvb2wsIG9wdGlvbnMpIHtcblx0ZXhlY3V0aW9uU3RhcnRlZChwb29sLCB0aGlzKTtcblxuXHQvLyBTZW5kIGNvbW1vbiBkYXRhIHRvIGdvLW1vZHVsZVxuXHRwb29sLmdvLnByb2Muc3RkaW4ud3JpdGUoSlNPTi5zdHJpbmdpZnkodGhpcy5jb21tb24pICsgJ1xcbicpOyAvLyBXcml0ZSBcXG4gdG8gZmx1c2ggd3JpdGUgYnVmZmVyXHRcblxufVxuXG4vLyBIYW5kbGUgY29tbWFuZCByZXNwb25zZSBhbmQgaW52b2tlIGNhbGxiYWNrXG5Db21tYW5kLnByb3RvdHlwZS5yZXNwb25zZSA9IGZ1bmN0aW9uKHBvb2wsIHJlc3BvbnNlRGF0YSkge1xuXHRleGVjdXRpb25TdG9wcGVkKHBvb2wsIHRoaXMsIHJlc3BvbnNlRGF0YSwge29rOiB0cnVlfSk7XHRcdFxufVxuXG4vLyBDYWxsIGlmIGNvbW1hbmQgcmVhY2hlcyB0aW1lb3V0LCBlbmRzIGV4ZWN1dGlvbiB3aXRoIHRpbWVvdXQgYXMgcmVzdWx0XG5Db21tYW5kLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24ocG9vbCkge1xuXHRleGVjdXRpb25TdG9wcGVkKHBvb2wsIHRoaXMsIG51bGwsIHt0aW1lb3V0OiB0cnVlfSk7XG59XG5cbi8vIENhbGwgaWYgY29tbWFuZCBpcyB0byBiZSB0ZXJtaW5hdGVkLCBlbmRzIGV4ZWN1dGlvbiB3aXRoIHRlcm1pbmF0ZWQgYXMgcmVzdWx0XG5Db21tYW5kLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbihwb29sKSB7XG5cdGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgdGhpcywgbnVsbCwge3Rlcm1pbmF0ZWQ6IHRydWV9KTtcbn1cblxuLy8gQ2FsbCBlYWNoIHRpbWUgdGhlIGNvbW1hbmQgaXMgdG8gYmUgZXhlY3V0ZWQgdG8gdXBkYXRlIHN0YXR1c1xuLy8gSGFuZGxlcyB0aGUgc3RhdGUgb2YgdGhlIGNvbW1hbmQgYXMgd2VsbCBhcyB0aGUgY29udGFpbmluZyBwb29sLlxuZnVuY3Rpb24gZXhlY3V0aW9uU3RhcnRlZChwb29sLCBjbWQpIHtcblx0Y21kLmludGVybmFsLmV4ZWN1dGlvblN0YXJ0ZWQgPSB0cnVlO1x0XG5cblx0cG9vbC5ydW5uaW5nQ29tbWFuZHMrKztcblx0cG9vbC5oYXNDb21tYW5kc1J1bm5pbmcgPSB0cnVlO1xuXG5cdC8vIEFkZCBleGVjdXRpbmcgY29tbWFuZCB0byBtYXBcblx0cG9vbC5jb21tYW5kTWFwW2NtZC5jb21tb24uaWRdID0gY21kO1xuXG5cdC8vIE9ubHkgdGltZW91dCBub24tc2lnbmFsIGNvbW1hbmRzXG5cdGlmKGNtZC5jb21tb24uc2lnbmFsID09PSAtMSkge1xuXHRcdGVuZ2FnZVRpbWVvdXQocG9vbCwgY21kKTtcblx0fSBcbn1cblxuLy8gQ2FsbCBlYWNoIHRpbWUgdGhlIGNvbW1hbmQgaGFzIGJlZW4gcmVjZWl2ZWQvdGltZWQgb3V0L2Fib3J0ZWQgKHN0b3BwZWQgZXhlY3V0aW9uKSB0byB1cGRhdGUgcG9vbCBzdGF0dXNcbi8vIEhhbmRsZXMgdGhlIHN0YXRlIG9mIHRoZSBjb21tYW5kIGFzIHdlbGwgYXMgdGhlIGNvbnRhaW5pbmcgcG9vbC5cbmZ1bmN0aW9uIGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgY21kLCByZXNwb25zZURhdGEsIHJlc3VsdCkge1xuXHRpZighcmVzdWx0LnRpbWVvdXQpIHtcblx0XHRjbGVhclRpbWVvdXQoY21kLmludGVybmFsLnRpbWVvdXQpOyAvLyBTdG9wIHRpbWVvdXQgdGltZXJcblx0fVx0XG5cdGNtZC5pbnRlcm5hbC5leGVjdXRpb25FbmRlZCA9IHRydWU7XG5cblx0cG9vbC5ydW5uaW5nQ29tbWFuZHMtLTtcblx0aWYocG9vbC5ydW5uaW5nQ29tbWFuZHMgPD0gMCkge1xuXHRcdHBvb2wucnVubmluZ0NvbW1hbmRzID0gMDsgLy8gVG8gYmUgc2FmZVxuXHRcdHBvb2wuaGFzQ29tbWFuZHNSdW5uaW5nID0gZmFsc2U7XG5cdFx0cG9vbC5lbnRlcmVkSWRsZSgpOyAvLyBQb29sIGlzIG5vdyBpZGxlXG5cdH1cblxuXHQvLyBTaW5jZSBjb21tYW5kIGlzIG5vdyBkb25lIHdlIGRlbGV0ZSBpdCBmcm9tIHRoZSBjb21tYW5kTWFwXHRcblx0ZGVsZXRlIHBvb2wuY29tbWFuZE1hcFtjbWQuY29tbW9uLmlkXTtcblx0cG9vbC53b3JrUXVldWUoKTsgLy8gV2lsbCBiZSBhZGRlZCB0byBldmVudCBsb29wXG5cblx0Ly8gSW52b2tlIGNhbGxiYWNrIGxhc3Rcblx0aWYoY21kLmludGVybmFsLmNhbGxiYWNrICE9PSB1bmRlZmluZWQgJiYgY21kLmludGVybmFsLmNhbGxiYWNrICE9PSBudWxsKSB7XG5cdFx0dmFyIHJlc3BvbnNlUmVzdWx0ID0ge1xuXHRcdFx0b2s6IHJlc3VsdC5vayA9PT0gdHJ1ZSxcblx0XHRcdHRpbWVvdXQ6IHJlc3VsdC50aW1lb3V0ID09PSB0cnVlLFxuXHRcdFx0dGVybWluYXRlZDogcmVzdWx0LnRlcm1pbmF0ZWQgPT09IHRydWUsXG5cdFx0fVxuXHRcdGNtZC5pbnRlcm5hbC5jYWxsYmFjayhyZXNwb25zZVJlc3VsdCwgcmVzcG9uc2VEYXRhKTtcblx0fVxufVxuXG4vLyBBY3RpdmF0ZSB0aW1lb3V0IHRpbWVyIHRvIGFib3J0IGNvbW1hbmRzIHJ1bm5pbmcgZm9yIHRvbyBsb25nXG4vLyBDYWxscyBleGVjdXRpb25TdG9wcGVkIHVwb24gdGltZW91dC5cbmZ1bmN0aW9uIGVuZ2FnZVRpbWVvdXQocG9vbCwgY21kKSB7XG5cdGNtZC5pbnRlcm5hbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcdFx0XG5cdFx0Ly8gQ29tbWFuZCB0aW1lZCBvdXQsIGFib3J0IGV4ZWN1dGlvblxuXHRcdGNtZC50aW1lb3V0KHBvb2wpO1xuXHR9LCBjbWQuaW50ZXJuYWwub3B0aW9ucy5jb21tYW5kVGltZW91dFNlYyAqIDEwMDApO1xufVxuXG4vLyBDb21tb24gc2lnbmFsc1xuZXhwb3J0cy5TaWduYWxzID0ge1xuXHRUZXJtaW5hdGlvbjogbmV3IENvbW1hbmQoMCwgbnVsbCwgbnVsbCwgMSksXG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEpvaG4gR3JhbnN0csO2bVxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5jb25zdCBjb21tYW5kSWRMaW1pdCA9IDFlOTtcblxudmFyIG1pc2MgPSByZXF1aXJlKCcuL21pc2MnKSxcblx0UXVldWUgPSByZXF1aXJlKCcuL3F1ZXVlJykuUXVldWUsXHRcblx0Q29tbWFuZCA9IHJlcXVpcmUoJy4vY29tbWFuZCcpLkNvbW1hbmQ7XG5cbmV4cG9ydHMuQ29tbWFuZFBvb2wgPSBDb21tYW5kUG9vbDtcbmZ1bmN0aW9uIENvbW1hbmRQb29sKGdvKSB7XG5cdHRoaXMuZ28gPSBnbztcblx0dGhpcy5jb21tYW5kTWFwID0ge30sXG5cdHRoaXMubmV4dENvbW1hbmRJZCA9IDA7XG5cdHRoaXMucnVubmluZ0NvbW1hbmRzID0gMDtcblx0dGhpcy5oYXNDb21tYW5kc1J1bm5pbmcgPSBmYWxzZTtcblxuXHR0aGlzLmlkbGVDbWRXYWl0aW5nID0gbnVsbDsgLy8gUHJvdmlkZSB0aGUgYWJpbGl0eSB0byBleGVjdXRlIGEgY29tbWFuZCB1cG9uIG5leHQgaWRsZVxuXHRcblx0dGhpcy5jb21tYW5kUXVldWUgPSBuZXcgUXVldWUoKTtcbn1cblxuLy8gUGxhbiB0aGUgZXhlY3V0aW9uIG9mIGEgY29tbWFuZCBhbmQgc2V0IGV4ZWN1dGlvbiBvcHRpb25zLlxuLy8gTm9uZSBwcmlvcml0aXplZCBjb21tYW5kcyBtYXkgYmUgcXVldWVkIGluc3RlYWQgb2YgZGlyZWN0bHkgZXhlY3V0ZWQgaWYgZXhjZWVkaW5nIGNvbW1hbmQgbGltaXQuXG5Db21tYW5kUG9vbC5wcm90b3R5cGUucGxhbkV4ZWN1dGlvbiA9IGZ1bmN0aW9uKGNtZCwgcHJpb3JpdGl6ZWQsIG9wdGlvbnMpIHtcblx0Y21kLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG5cdC8vIElmIGNvbW1hbmQgbm90IHByaW9yaXRpemVkIG1ha2Ugc3VyZSBpdCBkb2VzIG5vdCBleGNlZWQgY29tbWFuZCBsaW1pdFxuXHQvL2NvbnNvbGUubG9nKHRoaXMuZ28ub3B0aW9ucy5tYXhDb21tYW5kc1J1bm5pbmcpXHRcblx0ZXhlY3V0ZUNvbW1hbmQodGhpcywgY21kLCBwcmlvcml0aXplZCk7XG59XG5cbi8vIEhhbmRsZSBKU09OIHJlc3BvbnNlIGFuZCBwcm9jZXNzIGNvbW1hbmQgY2FsbGJhY2sgYW5kIGVuZCBvZiBleGVjdXRpb24gXG4vLyBBbHNvIG1hbmFnZSB0aGUgcXVldWUgaWYgcmVxdWlyZWQuIFxuQ29tbWFuZFBvb2wucHJvdG90eXBlLmhhbmRsZVJlc3BvbnNlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0dmFyIHJlc3BDbWQgPSB0aGlzLmNvbW1hbmRNYXBbcmVzcG9uc2UuaWRdXG5cdGlmKHJlc3BDbWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJlc3BDbWQucmVzcG9uc2UodGhpcywgcmVzcG9uc2UuZGF0YSk7XHRcblx0fSBlbHNlIHtcblx0XHQvLyBDb21tYW5kIG1heSBoYXZlIHRpbWVkIG91dCBvciBvdGhlcndpc2UgYWJvcnRlZCBzbyB3ZSB0aHJvdyB0aGUgcmVzcG9uc2UgYXdheVxuXHR9XHRcbn1cblxuLy8gQ3JlYXRlIGEgY29tbWFuZCB3aXRoIHNwZWNpZmllZCBkYXRhIGFuZCBjYWxsYmFjayB3aXRoIG5ldyBJRFxuQ29tbWFuZFBvb2wucHJvdG90eXBlLmNyZWF0ZUNvbW1hbmQgPSBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuXHRjbWQgPSBuZXcgQ29tbWFuZCh0aGlzLm5leHRDb21tYW5kSWQsIGRhdGEsIGNhbGxiYWNrKTtcblx0aW5jcmVtZW50Q29tbWFuZElkKHRoaXMpO1xuXHRyZXR1cm4gY21kO1xufVxuXG4vLyBDaGVjayBpZiBjb21tYW5kcyBhcmUgcXVldWVkLCBhbmQgaWYgc28gZXhlY3V0ZSB0aGVtIG9uIG5leHQgZXZlbnQgbG9vcFxuQ29tbWFuZFBvb2wucHJvdG90eXBlLndvcmtRdWV1ZSA9IGZ1bmN0aW9uKCkge1xuXHRpZighdGhpcy5jb21tYW5kUXVldWUuaXNFbXB0eSgpKSB7IC8vIENoZWNrIGlmIHF1ZXVlIGlzIGVtcHR5IGZpcnN0XG5cdFx0dmFyIHBvb2wgPSB0aGlzO1xuXHRcdC8vIERlcXVldWUgY29tbWFuZCBoZXJlIG5vdCBvbiBuZXh0VGljaygpIHRvIGF2b2lkIG11bHRpcGxlIGRlcXVldWVzIGZvciBzYW1lIGl0ZW1cblx0XHR2YXIgbmV4dENtZCA9IHBvb2wuY29tbWFuZFF1ZXVlLmRlcXVldWUoKTtcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkgeyAvLyBFeGVjdXRlIG5leHQgY29tbWFuZHMgb24gbmV4dCB0aWNrXG5cdFx0XHRleGVjdXRlQ29tbWFuZChwb29sLCBuZXh0Q21kLCBmYWxzZSk7XG5cdFx0fSk7XG5cdH1cbn1cblxuLy8gUGxhbiBhIHNpbmdsZSBjb21tYW5kIHRvIGJlIHJ1biB0aGUgbmV4dCB0aW1lIHRoZSBjb21tYW5kIHBvb2wgaXMgaWRsZVxuLy8gKG5vIHJ1bm5pbmcgY29tbWFuZHMpLiBDYWxsaW5nIHRoaXMgc2V2ZXJhbCB0aW1lcyB3aXRob3V0IGhhdmluZyBhbiBpZGxlIHBlcmlvZFxuLy8gd2lsbCBvdmVyd3JpdGUgYW55IHByZXZpb3VzbHkgcGxhbm5lZCBvbiBpZGxlIGNvbW1hbmRzXG5Db21tYW5kUG9vbC5wcm90b3R5cGUucGxhbk9uSWRsZSA9IGZ1bmN0aW9uKGNtZCwgcHJpb3JpdGl6ZWQsIG9wdGlvbnMpIHtcblx0dGhpcy5pZGxlQ21kV2FpdGluZyA9IHtcblx0XHRjbWQ6IGNtZCxcblx0XHRwcmlvcml0aXplZDogcHJpb3JpdGl6ZWQsXG5cdFx0b3B0aW9zOiBvcHRpb25zLFxuXHR9O1xuXHQvLyBJZiB0aGVyZSdzIG5vIGNvbW1hbmRzIHJ1bm5pbmcsIGV4ZWN1dGUgaXQgcmlnaHQgYXdheVxuXHRpZighdGhpcy5oYXNDb21tYW5kc1J1bm5pbmcpIHtcblx0XHRleGVjdXRlV2FpdGluZ0NvbW1hbmQodGhpcyk7XG5cdH1cbn1cblxuLy8gQ2FsbCB3aGVuIHBvb2wgaGFzIGVudGVyZWQgaWRsZSwgaS5lLiBoYXMgbm8gY29tbWFuZHMgcnVubmluZyBhcyBvZiBub3dcbkNvbW1hbmRQb29sLnByb3RvdHlwZS5lbnRlcmVkSWRsZSA9IGZ1bmN0aW9uKCkge1xuXHQvLyBDaGVjayBpZiB0aGVyZSdzIGEgY29tbWFuZCB3YWl0aW5nIGZvciBpZGxlXG5cdGlmKHRoaXMuaWRsZUNtZFdhaXRpbmcgIT0gbnVsbCkge1xuXHRcdC8vIEV4ZWN1dGUgd2FpdGluZyBjb21tYW5kIG9uIG5leHQgdGlja1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0ZXhlY3V0ZVdhaXRpbmdDb21tYW5kKHNlbGYpO1xuXHRcdH0pO1xuXHR9XG59XG5cbi8vIENhdXNlcyBhbGwgcnVubmluZyBjb21tYW5kcyB0byB0aW1lb3V0XG5Db21tYW5kUG9vbC5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuY29tbWFuZFF1ZXVlLmNsZWFyKCk7IC8vIENsZWFyIGNvbW1hbmQgcXVldWVcblx0dGhpcy5pZGxlQ21kV2FpdGluZyA9IG51bGw7IC8vIFRocm93IGF3YXkgYW55IHdhaXRpbmcgY29tbWFuZFxuXG5cdGZvcih2YXIgY21kSWQgaW4gdGhpcy5jb21tYW5kTWFwKSB7XG5cdFx0dmFyIGNtZCA9IHRoaXMuY29tbWFuZE1hcFtjbWRJZF07XG5cdFx0aWYoY21kLmludGVybmFsLmV4ZWN1dGlvblN0YXJ0ZWQgJiYgIWNtZC5pbnRlcm5hbC5leGVjdXRpb25FbmRlZCkge1xuXHRcdFx0Y21kLnRlcm1pbmF0ZSh0aGlzKTtcblx0XHR9XG5cdH1cbn1cblxuLy8gRXhlY3V0ZSBhIGNvbW1hbmQgaWYgZG9lcyBub3QgZXhjZWVkIGNvbW1hbmQgY291bnQgbGltaXQgYW5kIGNvbW1hbmQgcXVldWUgaXMgZW1wdHlcbi8vIG90aGVyd2lzZSBxdWV1ZSBjb21tYW5kIGZvciBsYXRlciBleGVjdXRpb24uXG5mdW5jdGlvbiBleGVjdXRlQ29tbWFuZChwb29sLCBjbWQsIHByaW9yaXRpemVkKSB7XG5cdGlmKCFwcmlvcml0aXplZCAmJiAocG9vbC5ydW5uaW5nQ29tbWFuZHMgPj0gcG9vbC5nby5vcHRpb25zLm1heENvbW1hbmRzUnVubmluZykpIHtcblx0XHQvLyBFeGNlZWRzIGxpbWl0LCBxdWV1ZSBjb21tYW5kIGluc3RlYWQgb2YgcnVubmluZ1xuXHRcdHBvb2wuY29tbWFuZFF1ZXVlLmVucXVldWUoY21kKTtcblx0fSBlbHNlIHtcblx0XHQvLyBFeGVjdXRlIGNvbW1hbmRcdFxuXHRcdGNtZC5leGVjdXRlKHBvb2wpO1x0XG5cdH1cbn1cblxuLy8gUmVzZXQgbmV4dENvbW1hbmRJZCBpZiBncm93aW5nIHBhc3QgbGltaXRcbi8vIExpbWl0IHNob3VsZCBiZSBzZXQgaGlnaCBlbm91Z2ggc28gdGhhdCB0aGUgb2xkIGNvbW1hbmQgZm9yIElEIDBcbi8vIG1vc3QgbGlrZWx5IGhhcyByZXNwb25kZWQgb3IgdGltZWQgb3V0IGFuZCB3aWxsIG5vdCBjb25mbGljdCB3aXRoIG5ldyBvbmVzLlxuZnVuY3Rpb24gaW5jcmVtZW50Q29tbWFuZElkKHBvb2wpIHtcblx0aWYocG9vbC5uZXh0Q29tbWFuZElkKysgPj0gY29tbWFuZElkTGltaXQpIHtcblx0XHRwb29sLm5leHRDb21tYW5kSWQgPSAwO1xuXHR9XG59XG5cbi8vIEV4ZWN1dGUgYSBjb21tYW5kIHBsYW5uZWQgdG8gcnVuIG9uIG5leHQgaWRsZVxuZnVuY3Rpb24gZXhlY3V0ZVdhaXRpbmdDb21tYW5kKHBvb2wpIHtcblx0dmFyIHRvRXhlY3V0ZSA9IHBvb2wuaWRsZUNtZFdhaXRpbmc7XG5cdHBvb2wuaWRsZUNtZFdhaXRpbmcgPSBudWxsO1xuXHRwb29sLnBsYW5FeGVjdXRpb24odG9FeGVjdXRlLmNtZCxcblx0XHR0b0V4ZWN1dGUucHJpb3JpdGl6ZWQsXG5cdFx0dG9FeGVjdXRlLm9wdGlvbnNcblx0KTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBzcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bixcblx0dXRpbCA9IHJlcXVpcmUoJ3V0aWwnKSxcblx0ZnMgPSByZXF1aXJlKCdmcycpLFx0XG5cdG1pc2MgPSByZXF1aXJlKCcuL21pc2MnKSxcblx0RXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLFxuXHRDb21tYW5kUG9vbCA9IHJlcXVpcmUoJy4vY29tbWFuZHBvb2wnKS5Db21tYW5kUG9vbFx0XG5cdFNpZ25hbHMgPSByZXF1aXJlKCcuL2NvbW1hbmQnKS5TaWduYWxzO1xuXG4vLyBDcmVhdGUgYSBuZXcgR28tb2JqZWN0IGZvciB0aGUgc3BlY2lmaWVkIC5nby1maWxlLlxuLy8gV2lsbCBhbHNvIGludGlhbGl6ZSBHby1vYmplY3QgaWYgc2Vjb25kIHBhcmFtZXRlciBpcyB0cnVlLlxuLy9cbi8vIFRocm93cyBlcnJvciBpZiBubyBwYXRoIHByb3ZpZGVkIHRvIC5nby1maWxlLlxudXRpbC5pbmhlcml0cyhHbywgRXZlbnRFbWl0dGVyKTtcbmV4cG9ydHMuR28gPSBHbztcbmZ1bmN0aW9uIEdvKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdGlmKG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBvcHRpb25zID09PSBudWxsKSB7XG5cdFx0bWlzYy5yYWlzZUVycm9yKCdObyBvcHRpb25zIHByb3ZpZGVkLicpXG5cdH1cblx0aWYob3B0aW9ucy5wYXRoID09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnBhdGggPT0gbnVsbCkge1xuXHRcdG1pc2MucmFpc2VFcnJvcignTm8gcGF0aCBwcm92aWRlZCB0byAuZ28tZmlsZS4nKTtcblx0fVxuXG5cdG1pc2MubWVyZ2VEZWZhdWx0T3B0aW9ucyhvcHRpb25zLCB7XG5cdFx0bWF4Q29tbWFuZHNSdW5uaW5nOiAxMCxcblx0XHRkZWZhdWx0Q29tbWFuZFRpbWVvdXRTZWM6IDUsXG5cdFx0Y3dkOiBwcm9jZXNzLmN3ZCgpLFxuXHR9KTtcblx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuXHR0aGlzLmdvRmlsZSA9IG9wdGlvbnMucGF0aDtcblx0dGhpcy5wcm9jID0gbnVsbDtcblx0dGhpcy5pbml0aWFsaXplZCA9IGZhbHNlOyAvLyB0cnVlIHdoZW4gR28gaGFzIGJlZW4gaW5pdGlhbGl6ZWQsIGJhY2sgdG8gZmFsc2Ugd2hlbiBHbyBjbG9zZXNcblx0dGhpcy5jbG9zZVBlbmRpbmcgPSBmYWxzZTsgLy8gdHJ1ZSB3aGVuIGNsb3NlKCkgaGFzIGJlZW4gY2FsbGVkIGFuZCBubyBtb3JlIGNvbW1hbmRzIHNob3VsZCBiZSBwbGFubmVkXG5cdHRoaXMudGVybWluYXRlUGVuZGluZyA9IGZhbHNlOyAvLyB0cnVlIHdoZW4gdGVybWluYXRlKCkgaGFzIGJlZW4gY2FsbGVkXG5cdHRoaXMuY29tbWFuZFBvb2wgPSBuZXcgQ29tbWFuZFBvb2wodGhpcylcblxuXHRpZihvcHRpb25zLmluaXRBdE9uY2UpIHtcblx0XHR0aGlzLmluaXQoY2FsbGJhY2spO1xuXHR9XG59XG5cbi8vIEluaXRpYWxpemUgYnkgbGF1bmNoaW5nIGdvIHByb2Nlc3MgYW5kIHByZXBhcmUgZm9yIGNvbW1hbmRzLlxuLy8gRG8gYXMgZWFybHkgYXMgcG9zc2libGUgdG8gYXZvaWQgZGVsYXkgd2hlbiBleGVjdXRpbmcgZmlyc3QgY29tbWFuZC5cbi8vXG4vLyBjYWxsYmFjayBoYXMgcGFyYW1ldGVycyAoZXJyKVxuR28ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjYWxsYmFjaykge1x0XHRcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRmcy5leGlzdHModGhpcy5nb0ZpbGUsIGZ1bmN0aW9uKGV4aXN0cykge1xuXHRcdGlmKCFleGlzdHMpIHtcdFxuXHRcdFx0bWlzYy5jYWxsYmFja0lmQXZhaWxhYmxlKGNhbGxiYWNrLCBtaXNjLmdldEVycm9yKCcuZ28tZmlsZSBub3QgZm91bmQgZm9yIGdpdmVuIHBhdGguJykpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIHNpbXBsZSBleHRlbnNpb24gY2hlY2sgdG8gZGV0ZWN0IGlmIGl0cyBhIHVuIGNvbXBpbGVzIC5nbyBmaWxlXG5cdFx0aWYgKHNlbGYuZ29GaWxlLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnLmdvJykge1xuXHRcdFx0Ly8gU3Bhd24gZ28gcHJvY2VzcyB3aXRoaW4gY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuXHRcdFx0c2VsZi5wcm9jID0gc3Bhd24oJ2dvJywgWydydW4nLCBzZWxmLmdvRmlsZV0sIHsgY3dkOiBzZWxmLm9wdGlvbnMuY3dkLCBlbnY6IHByb2Nlc3MuZW52IH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBTcGF3biBnbyBjb21waWxlZCBmaWxlXG5cdFx0XHRzZWxmLnByb2MgPSBzcGF3biggc2VsZi5nb0ZpbGUsIFtdLCB7IGN3ZDogc2VsZi5vcHRpb25zLmN3ZCwgZW52OiBwcm9jZXNzLmVudiB9KTtcblx0XHR9XG5cblxuXHRcdC8vIFNldHVwIGhhbmRsZXJzXG5cdFx0c2VsZi5wcm9jLnN0ZG91dC5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0aGFuZGxlU3Rkb3V0KHNlbGYsIGRhdGEpO1xuXHRcdH0pO1xuXHRcdHNlbGYucHJvYy5zdGRlcnIub24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKXtcblx0XHRcdGhhbmRsZUVycihzZWxmLCBkYXRhLCBmYWxzZSk7XG5cdFx0fSk7XG5cdFx0c2VsZi5wcm9jLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCl7XG5cdFx0XHRoYW5kbGVDbG9zZShzZWxmKTtcblx0XHR9KTtcdFx0XG5cblx0XHQvLyBJbml0IGNvbXBsZXRlXG5cdFx0c2VsZi5pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0bWlzYy5jYWxsYmFja0lmQXZhaWxhYmxlKGNhbGxiYWNrLCBudWxsKTtcblx0fSk7XG59XG5cbi8vIEdyYWNlZnVsbHkgY2xvc2UgR28gYnkgc2VuZGluZyB0ZXJtaW5hdGlvbiBzaWduYWwgYWZ0ZXIgYWxsIGV4ZWN1dGluZyBjb21tYW5kc1xuLy8gaGFzIGVuZGVkIHRoZWlyIGV4ZWN1dGlvbi5cbi8vIFJldHVybnMgdHJ1ZSBpZiBjbG9zZSBoYXMgYmVlbiBzdGFydGVkLCBvciBmYWxzZSBpZiBHbyBpcyBub3QgaW5pdGlhbGl6ZWQgb3IgaWYgaXRcbi8vIGFscmVhZHkgaGFzIGEgY2xvc2UgcGVuZGluZy5cbkdvLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLmluaXRpYWxpemVkICYmICF0aGlzLmNsb3NlUGVuZGluZyAmJiAhdGhpcy50ZXJtaW5hdGVQZW5kaW5nKSB7XG5cdFx0dGhpcy5jbG9zZVBlbmRpbmcgPSB0cnVlO1xuXHRcdC8vIFNlbmQgcHJpb3JpdGl6ZWQgdGVybWluYXRpb24gc2lnbmFsXG5cdFx0dGhpcy5jb21tYW5kUG9vbC5wbGFuT25JZGxlKFNpZ25hbHMuVGVybWluYXRpb24sIHRydWUpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbi8vIEhhcmQgdGVybWluYXRlIGJ5IHNlbmRpbmcgdGVybWluYXRpb24gb24gYWxsIGNvbW1hbmRzIGFuZCB0ZXJtaW5hdGlvbiBzaWduYWwgdG8gR29cbi8vIFJldHVybnMgdHJ1ZSBpZiB0ZXJtaW5hdGlvbiBoYXMgYmVlbiBzdGFydGVkLCBvciBmYWxzZSBpZiBHbyBpcyBub3QgaW5pdGlhbGl6ZWQgb3IgaWYgaXRcbi8vIGFscmVhZHkgaGFzIGEgdGVybWluYXRpb24gcGVuZGluZy5cbkdvLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRlcm1pbmF0ZSh0aGlzLCB0cnVlKTtcbn1cblxuLy8gQ3JlYXRlIGFuZCBleGVjdXRlIG9yIHF1ZXVlIGEgY29tbWFuZCBvZiBKU09OIGRhdGFcbi8vIFdpbGwgbm90IHF1ZXVlIGNvbW1hbmQgaWYgR28gaXMgbm90IGluaXRpYWxpemVkIG9yIGhhcyBiZWVuIGNsb3NlZCAob3IgY2xvc2UgcGVuZGluZylcbi8vIFRha2VzIHBhcmFtZXRlcnM6XG4vLyBcdFx0ZGF0YSAocmVxdWlyZWQpIC0gYWN0dWFsIGNvbW1hbmQgSlNPTlxuLy9cdFx0Y2FsbGJhY2sgKHJlcXVpcmVkKSAtIHRoZSBjYWxsYmFjayB0byBjYWxsIHdpdGggcG9zc2libGUgcmVzdWx0IHdoZW4gZXhlY3V0aW9uIGVuZHNcbi8vXHRcdG9wdGlvbnMgKG9wdGlvbmFsKSAtIG92ZXJyaWRlcyBkZWZhdWx0IGV4ZWN1dGlvbiBvcHRpb25zXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGNvbW1hbmQgd2FzIHBsYW5uZWQgZm9yIGV4ZWN1dGlvbiwgb3RoZXJ3aXNlIGZhbHNlLlxuR28ucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaywgb3B0aW9ucykge1x0XG5cdGlmKHRoaXMuaW5pdGlhbGl6ZWQgJiYgIXRoaXMuY2xvc2VQZW5kaW5nICYmICF0aGlzLnRlcm1pbmF0ZVBlbmRpbmcpIHtcblx0XHQvLyBJbXBvcnRhbnQgdG8gbm90IGxlYXZlIGdvIGluIGFuIGluZmluaXRlIGxvb3AgZWF0aWcgY3B1XG5cdFx0dHJ5IHsgLy8gQ29udGFpbiBvdXRlciBleGNlcHRpb25zIGFuZCBjbG9zZSBnbyBiZWZvcmUgcmV0aHJvd2luZyBleGNlcHRpb24uXG5cdFx0XHR0aGlzLmNvbW1hbmRQb29sLnBsYW5FeGVjdXRpb24odGhpcy5jb21tYW5kUG9vbC5jcmVhdGVDb21tYW5kKGRhdGEsIGNhbGxiYWNrKSwgZmFsc2UsIG9wdGlvbnMpO1x0XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aGFuZGxlRXJyKHRoaXMsIGUsIGZhbHNlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7IC8vIFJldHVybiB0cnVlIHNpbmNlIHRoZSBjb21tYW5kIGhhcyBiZWVuIHBsYW5uZWQgZm9yIGV4ZWN1dGlvblxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTsgLy8gVGhlIGNvbW1hbmQgd2Fzbid0IHBsYW5uZWQgZm9yIGV4ZWN1dGlvbiwgcmV0dXJuIGZhbHNlXG5cdH1cbn1cblxuLy8gcmVzZXQgdGhlIGJ1ZmZlckRhdGEgd2l0aCBhbiBlbXB0eSBzdHJpbmdcbnZhciBidWZmZXJEYXRhID0gXCJcIjtcblxuLy8gUmVjZWl2ZSBkYXRhIGZyb20gZ28tbW9kdWxlXG5mdW5jdGlvbiBoYW5kbGVTdGRvdXQoZ28sIGRhdGEpIHtcblxuXHQvLyBhcHBlbmQgZGF0YSB0byB0aGUgYnVmZmVyIGZvciBldmVyeSBzdGRvdXRcbiAgICBidWZmZXJEYXRhICs9IGRhdGEudG9TdHJpbmcoKTtcblxuICAgIC8vIGlmIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgbWVzc2FnZSBpbiB0aGUgc3Rkb3V0IHBhcnNlIGl0XG5cdC8vIGFuZCByZXNldCB0aGUgYnVmZmVyIGZvciB0aGUgbmV4dCBzdGRvdXRcbiAgICBpZiAoYnVmZmVyRGF0YS5lbmRzV2l0aChcIlxcblwiKSkge1xuICAgICAgICAvLyBSZXNwb25zZSBtYXkgYmUgc2V2ZXJhbCBjb21tYW5kIHJlc3BvbnNlcyBzZXBhcmF0ZWQgYnkgbmV3IGxpbmVzXG4gICAgICAgIGJ1ZmZlckRhdGEudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAgIC8vIERpc2NhcmQgZW1wdHkgbGluZXNcbiAgICAgICAgICAgIGlmKHJlc3AubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIFBhcnNlIGVhY2ggY29tbWFuZCByZXNwb25zZSB3aXRoIGEgZXZlbnQtbG9vcCBpbiBiZXR3ZWVuIHRvIGF2b2lkIGJsb2NraW5nXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpe3BhcnNlUmVzcG9uc2UoZ28sIHJlc3ApfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBidWZmZXJEYXRhID0gXCJcIjtcbiAgICB9XG59XG5cbi8vIFBhcnNlIGEgX3NpbmdsZV8gY29tbWFuZCByZXNwb25zZSBhcyBKU09OIGFuZCBoYW5kbGUgaXRcbi8vIElmIHBhcnNpbmcgZmFpbHMgYSBpbnRlcm5hbCBlcnJvciBldmVudCB3aWxsIGJlIGVtaXR0ZWQgd2l0aCB0aGUgcmVzcG9uc2UgZGF0YVxuZnVuY3Rpb24gcGFyc2VSZXNwb25zZShnbywgcmVzcCkge1xuXHR2YXIgcGFyc2VkO1xuXHR0cnkge1xuXHRcdHBhcnNlZCA9IEpTT04ucGFyc2UocmVzcCk7XG5cdH0gY2F0Y2ggKGUpIHtcdFx0XG5cdFx0aGFuZGxlRXJyKGdvLCByZXNwLCB0cnVlKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBJbXBvcnRhbnQgdG8gbm90IGxlYXZlIGdvIGluIGFuIGluZmluaXRlIGxvb3AgZWF0aWcgY3B1XG5cdHRyeSB7IC8vIENvbnRhaW4gb3V0ZXIgZXhjZXB0aW9ucyBhbmQgY2xvc2UgZ28gYmVmb3JlIHJldGhyb3dpbmcgZXhjZXB0aW9uLlxuXHRcdGdvLmNvbW1hbmRQb29sLmhhbmRsZVJlc3BvbnNlKHBhcnNlZCkgLy8gSGFuZGxlIHJlc3BvbnNlIG91dHNpZGUgdGhyb3cgdG8gYXZvaWQgY2F0Y2hpbmcgdGhvc2UgZXhjZXB0aW9uc1x0XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRoYW5kbGVFcnIoZ28sIGUsIGZhbHNlKTtcblx0fVx0XG59XG5cbi8vIEVtaXQgZXJyb3IgZXZlbnQgb24gZ28gaW5zdGFuY2UsIHBhc3MgdGhyb3VnaCByYXcgZXJyb3IgZGF0YVxuLy8gRXJyb3JzIG1heSBlaXRoZXIgYmUgaW50ZXJuYWwgcGFyc2VyIGVycm9ycyBvciBleHRlcm5hbCBlcnJvcnMgcmVjZWl2ZWQgZnJvbSBzdGRlcnJcbmZ1bmN0aW9uIGhhbmRsZUVycihnbywgZGF0YSwgcGFyc2VyKSB7XHRcblx0aWYoIXBhcnNlcikgeyAvLyBJZiBleHRlcm5hbCBlcnJvciwgdGVybWluYXRlIGFsbCBjb21tYW5kc1xuXHRcdHRlcm1pbmF0ZShnbywgZmFsc2UpO1xuXHR9XG5cblx0aWYoZ28ubGlzdGVuZXJzKCdlcnJvcicpLmxlbmd0aCA+IDApIHsgLy8gT25seSBlbWl0IGV2ZW50IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnNcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gRW1pdCBhbnkgZXZlbnQgb24gbmV4dCB0aWNrXG5cdFx0XHRnby5lbWl0KCdlcnJvcicsIHtwYXJzZXI6IHBhcnNlciwgZGF0YTogZGF0YX0pO1xuXHRcdH0pO1xuXHR9XHRcbn1cblxuLy8gR28gcGFuaWMgYW5kIHByb2Nlc3MgZW5kcyBjYXVzZXMgY2FsbHMgdG8gdGhpc1xuLy8gRW1pdCBjbG9zZSBldmVudCBvbiBnbyBpbnN0YW5jZVxuZnVuY3Rpb24gaGFuZGxlQ2xvc2UoZ28pIHtcblx0Ly8gSWYgcHJvY2VzcyBjbG9zZXMgd2Ugc2V0IGluaXRpYWxpemVkIHRvIGZhbHNlIHRvIGF2b2lkIGludmFsaWQgY2xvc2UoKSBvciBleGVjdXRlKClcdFxuXHRnby5pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRpZihnby5saXN0ZW5lcnMoJ2Nsb3NlJykubGVuZ3RoID4gMCkgeyAvLyBPbmx5IGVtaXQgZXZlbnQgaWYgdGhlcmUgYXJlIGxpc3RlbmVyc1xuXHRcdGdvLmVtaXQoJ2Nsb3NlJyk7XG5cdH1cdFx0XG59XG5cbi8vIFRlcm1pbmF0ZSBieSBzZW5kaW5nIHRlcm1pbmF0aW9uIG9uIGFsbCBjb21tYW5kcy5cbi8vIElmIGNhbGxlZCB3aXRoIHRydWUgaXQgd2lsbCBhbHNvIGRpcmVjdGx5IHRyeSB0byBzZW5kIGEgdGVybWluYXRpb24gc2lnbmFsIHRvIGdvXG5mdW5jdGlvbiB0ZXJtaW5hdGUoZ28sIHdpdGhTaWduYWwpIHtcblx0aWYoZ28uaW5pdGlhbGl6ZWQgJiYgIWdvLnRlcm1pbmF0ZVBlbmRpbmcpIHtcblx0XHRnby50ZXJtaW5hdGVQZW5kaW5nID0gdHJ1ZTtcblxuXHRcdC8vIERvIHRoZSBhY3R1YWwgdGVybWluYXRpb24gYXN5bmNocm9ub3VzbHlcblx0XHQvLyBDYWxsYmFja3Mgd2lsbCBiZSBlYWNoIHRlcm1pbmF0ZWQgY29tbWFuZCBvciBub3RoaW5nXG5cdFx0cHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpe1xuXHRcdFx0Ly8gVGVsbCBjb21tYW5kIHBvb2wgdG8ga2lsbCBhbGwgY29tbWFuZHNcblx0XHRcdGdvLmNvbW1hbmRQb29sLnRlcm1pbmF0ZSgpO1x0XHRcdFxuXG5cdFx0XHQvLyBTZW5kIHNpZ25hbCBhZnRlciBjb21tYW5kIHBvb2wgdGVybWluYXRpb24sIG90aGVyd2lzZSBpdCB3b3VsZFxuXHRcdFx0Ly8gYmUgcmVtb3ZlZCBieSB0ZXJtaW5hdGUoKVxuXHRcdFx0aWYod2l0aFNpZ25hbCkge1x0XHRcdFx0XHRcblx0XHRcdFx0Z28uY29tbWFuZFBvb2wucGxhbkV4ZWN1dGlvbihTaWduYWxzLlRlcm1pbmF0aW9uLCB0cnVlKTtcdFx0XHRcdFxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XHRcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIENvbnRhaW5zIGdlbmVyYWwgaGVscGVyc1xuXG4vLyBJbnZva2UgY2FsbGJhY2sgaWYgbm90IHVuZGVmaW5lZCB3aXRoIHByb3ZpZGVkIHBhcmFtZXRlclxuZXhwb3J0cy5jYWxsYmFja0lmQXZhaWxhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2ssIHBhcmFtKSB7XG5cdGlmKHR5cGVvZiBjYWxsYmFjayAhPSB1bmRlZmluZWQpIHtcblx0XHRjYWxsYmFjayhwYXJhbSk7XG5cdH1cbn1cblxuZXhwb3J0cy5yYWlzZUVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcblx0dGhyb3cgZ2V0RXJyb3IoZXJyb3IpO1xufVxuXG5leHBvcnRzLmdldEVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcblx0cmV0dXJuIG5ldyBFcnJvcignZ29ub2RlOiAnICsgZXJyb3IpO1xufVxuXG4vLyBNYWtlIHN1cmUgb3B0aW9ucyBub3QgcHJvdmlkZWQgYXJlIHNldCB0byBkZWZhdWx0IHZhbHVlcyBcbmV4cG9ydHMubWVyZ2VEZWZhdWx0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG5cdGZvciAob3B0IGluIGRlZmF1bHRzKSB7XG5cdFx0aWYob3B0aW9uc1tvcHRdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdG9wdGlvbnNbb3B0XSA9IGRlZmF1bHRzW29wdF07XG5cdFx0fSBcblx0fVxufSIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZXhwb3J0cy5RdWV1ZSA9IFF1ZXVlO1xuZnVuY3Rpb24gUXVldWUoKSB7XG5cdHRoaXMuYXJyID0gW107XG59XG5cblF1ZXVlLnByb3RvdHlwZS5lbnF1ZXVlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHR0aGlzLmFyci5wdXNoKGVsZW1lbnQpO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUuZGVxdWV1ZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5hcnIuc2hpZnQoKTtcbn1cblxuUXVldWUucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5hcnIubGVuZ3RoO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5nZXRMZW5ndGgoKSA9PT0gMDtcbn1cblxuUXVldWUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuYXJyLmxlbmd0aCA9IDA7XG59IiwiaW1wb3J0ICogYXMgUGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHsgZ2V0UGF0aCwgU2VhcmNoT2JqZWN0LCBUeXBpZUNvcmUsIFR5cGllUm93SXRlbSB9IGZyb20gXCIuL2luZGV4XCI7XHJcblxyXG5jb25zdCBkZWZhdWx0SWNvbiA9IFwicGtnLWljb24ucG5nXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFR5cGllUGFja2FnZSB7XHJcbiAgICBwcm90ZWN0ZWQgcGFja2FnZURhdGE6IGFueTtcclxuICAgIHByb3RlY3RlZCBwYWNrYWdlTmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIGljb246IHN0cmluZztcclxuICAgIHByb3RlY3RlZCB0eXBpZTogVHlwaWVDb3JlO1xyXG4gICAgcHJvdGVjdGVkIHBrZ0NvbmZpZzogYW55O1xyXG4gICAgcHJvdGVjdGVkIHdpbjogYW55O1xyXG4gICAgcHJvdGVjdGVkIGRiOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgcGFja2FnZXM6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih3aW4sIGNvbmZpZywgcGtnTmFtZSkge1xyXG4gICAgICAgIHRoaXMud2luID0gd2luO1xyXG4gICAgICAgIHRoaXMucGFja2FnZURhdGEgPSB7bmFtZTogcGtnTmFtZSwgcGF0aDogX19kaXJuYW1lfTtcclxuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gcGtnTmFtZTtcclxuICAgICAgICB0aGlzLmRiID0gcGtnTmFtZTtcclxuICAgICAgICB0aGlzLnBrZ0NvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICB0aGlzLmljb24gPSB0aGlzLmdldFBhY2thZ2VQYXRoKCkgKyBkZWZhdWx0SWNvbjtcclxuICAgICAgICB0aGlzLnR5cGllID0gbmV3IFR5cGllQ29yZSh0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgICAgICB0aGlzLnBhY2thZ2VzID0ge307XHJcbiAgICAgICAgdGhpcy5sb2FkQ29uZmlnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhY2thZ2VOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFja2FnZU5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhY2thZ2VQYXRoKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGdldFBhdGgoXCJwYWNrYWdlcy9cIiArIHRoaXMucGFja2FnZU5hbWUgKyBcIi9cIik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldERlZmF1bHRJdGVtKHZhbHVlLCBkZXNjcmlwdGlvbiA9IFwiXCIsIHBhdGggPSBcIlwiLCBpY29uID0gXCJcIik6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBUeXBpZVJvd0l0ZW0oKTtcclxuICAgICAgICBpdGVtLnNldFRpdGxlKHZhbHVlKTtcclxuICAgICAgICBpdGVtLnNldFBhdGgocGF0aCA/IHBhdGggOiB2YWx1ZSk7XHJcbiAgICAgICAgaXRlbS5zZXRJY29uKGljb24gPyBpY29uIDogdGhpcy5pY29uKTtcclxuICAgICAgICBpdGVtLnNldERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uID8gZGVzY3JpcHRpb24gOiBcIlwiKTtcclxuICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5zZXJ0KHZhbHVlLCBkZXNjcmlwdGlvbiA9IFwiXCIsIHBhdGggPSBcIlwiLCBpY29uID0gXCJcIikge1xyXG4gICAgICAgIHRoaXMuaW5zZXJ0SXRlbSh0aGlzLmdldERlZmF1bHRJdGVtKHZhbHVlLCBkZXNjcmlwdGlvbiwgcGF0aCwgaWNvbikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnNlcnRJdGVtKGl0ZW06IFR5cGllUm93SXRlbSkge1xyXG4gICAgICAgIHRoaXMudHlwaWUuaW5zZXJ0KGl0ZW0pLmdvKClcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZWFyY2gob2JqOiBTZWFyY2hPYmplY3QsIGNhbGxiYWNrOiAoZGF0YSkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMudHlwaWUuZnV6enlTZWFyY2gob2JqLnZhbHVlKS5vcmRlckJ5KFwic2NvcmVcIikuZGVzYygpLmdvKClcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBjYWxsYmFjayhkYXRhKSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWN0aXZhdGUocGtnTGlzdDogc3RyaW5nW10sIGl0ZW06IFR5cGllUm93SXRlbSwgY2FsbGJhY2s6IChkYXRhKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgY29uc29sZS5pbmZvKCdObyBvdmVycmlkZSBcImFjdGl2YXRlXCIgbWV0aG9kIGZvdW5kIGluICcgKyB0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW50ZXJQa2cocGtnTGlzdDogc3RyaW5nW10sIGl0ZW0/OiBUeXBpZVJvd0l0ZW0sIGNhbGxiYWNrPzogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmdldEZpcnN0UmVjb3JkcygxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyKHBrZ0xpc3Q6IHN0cmluZ1tdLCBjYWxsYmFjazogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmdldEZpcnN0UmVjb3JkcygxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZShwa2dMaXN0OiBzdHJpbmdbXSwgaXRlbTogVHlwaWVSb3dJdGVtLCBjYWxsYmFjazogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICBjb25zb2xlLmluZm8oJ05vIG92ZXJyaWRlIFwicmVtb3ZlXCIgbWV0aG9kIGZvdW5kIGluICcgKyB0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0SWNvbihpY29uKSB7XHJcbiAgICAgICAgcmV0dXJuIFBhdGguam9pbih0aGlzLmdldFBhY2thZ2VQYXRoKCksIGljb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRGaXJzdFJlY29yZHMobnVtT2ZSZWNvcmRzOiBudW1iZXIgPSAxMCkge1xyXG4gICAgICAgIHRoaXMudHlwaWUuZ2V0Um93cyhudW1PZlJlY29yZHMpLm9yZGVyQnkoXCJjb3VudFwiKS5kZXNjKCkuZ28oKVxyXG4gICAgICAgICAgICAudGhlbihyZXMgPT4gdGhpcy53aW4uc2VuZChcInJlc3VsdExpc3RcIiwgcmVzKSlcclxuICAgICAgICAgICAgLmNhdGNoKGUgPT4gY29uc29sZS5lcnJvcihcImVycm9yIGdldHRpbmcgZmlyc3QgcmVjb3Jkc1wiLCBlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxvYWRDb25maWcoKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJObyBvdmVycmlkZSAnbG9hZENvbmZpZycgbWV0aG9kIGZvdW5kIGluIFwiICsgdGhpcy5wYWNrYWdlTmFtZSk7XHJcbiAgICAgICAgaWYgKHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVnaXN0ZXJpbmcgc2hvcnRjdXQgXCIgKyB0aGlzLnBrZ0NvbmZpZy5zaG9ydGN1dCArIFwiIHRvIFwiICsgdGhpcy5nZXRQYWNrYWdlTmFtZSgpKTtcclxuICAgICAgICAgICAgdGhpcy53aW4ucmVnaXN0ZXJLZXkodGhpcy5wa2dDb25maWcuc2hvcnRjdXQsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luLnNlbmQoXCJjaGFuZ2VQYWNrYWdlXCIsIFt0aGlzLmdldFBhY2thZ2VOYW1lKCldKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luLnNob3coKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGVzdHJveWluZyB0aGUgcGFja2FnZSFcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1bnJlZ2lzdGVyXCIsIHRoaXMucGtnQ29uZmlnKTtcclxuICAgICAgICBpZiAodGhpcy5wa2dDb25maWcuc2hvcnRjdXQpIHtcclxuICAgICAgICAgICAgdGhpcy53aW4udW5yZWdpc3RlcktleSh0aGlzLnBrZ0NvbmZpZy5zaG9ydGN1dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIlxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBHbG9iYWwge1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgc2V0dGluZ3M6IGFueTtcclxuICAgIHB1YmxpYyBzdGF0aWMgc3RhcnRUaW1lOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRUaW1lU2luY2VJbml0KCkge1xyXG4gICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gQXBwR2xvYmFsLnN0YXJ0VGltZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFNldHRpbmdzKCkge1xyXG4gICAgICAgIHJldHVybiBBcHBHbG9iYWwuc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBzZXQobmFtZTogc3RyaW5nLCBvYmo6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGdsb2JhbFtuYW1lXSA9IG9iajtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWxbbmFtZV07XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtHb30gZnJvbSBcInR5cGllLWdvXCI7XHJcbmltcG9ydCBQYWNrZXQgZnJvbSBcIi4vbW9kZWxzL1BhY2tldFwiO1xyXG4vLyBpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmNvbnN0IGFwcEdsb2JhbDogYW55ID0gZ2xvYmFsO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29EaXNwYXRjaGVyIHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdvOiBhbnk7XHJcbiAgICBwdWJsaWMgc3RhdGljIGxpc3RlbmluZzogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgc3RhdGljIGV4ZWN1dGFibGVQYXRoOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwaWVFeGVjdXRhYmxlOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlN0YXJ0aW5nIFR5cGllIFNlcnZpY2UgZm9yIHRoZSBmaXJzdCB0aW1lXCIsIHR5cGllRXhlY3V0YWJsZSk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmV4ZWN1dGFibGVQYXRoID0gdHlwaWVFeGVjdXRhYmxlO1xyXG4gICAgICAgIHRoaXMuc3RhcnRQcm9jZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlbmQocGFja2V0OiBQYWNrZXQpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwic2VuZCBwYWNrZXRcIiwgcGFja2V0KTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uZXhlY3V0ZShwYWNrZXQsIChyZXN1bHQ6IGFueSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJnb3QgYmFja1wiLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLmNsb3NlKCk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhcnRQcm9jZXNzKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU3RhcnRpbmcgVHlwaWUgU2VydmljZVwiLCBHb0Rpc3BhdGNoZXIuZXhlY3V0YWJsZVBhdGgpO1xyXG4gICAgICAgIEdvRGlzcGF0Y2hlci5saXN0ZW5pbmcgPSBmYWxzZTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28gPSBuZXcgR28oe1xyXG4gICAgICAgICAgICBkZWZhdWx0Q29tbWFuZFRpbWVvdXRTZWM6IDYwLFxyXG4gICAgICAgICAgICBtYXhDb21tYW5kc1J1bm5pbmc6IDEwLFxyXG4gICAgICAgICAgICBwYXRoOiBHb0Rpc3BhdGNoZXIuZXhlY3V0YWJsZVBhdGgsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLmluaXQodGhpcy5yZWdpc3Rlcik7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLm9uKFwiY2xvc2VcIiwgKCkgPT4gdGhpcy5vbkNsb3NlKCkpO1xyXG4gICAgICAgIEdvRGlzcGF0Y2hlci5nby5vbihcImVycm9yXCIsIGVyciA9PiBjb25zb2xlLmVycm9yKFwiZ28gZGlzcGF0Y2hlciBoYWQgZXJyb3JcIiwgZXJyKSk7XHJcbiAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiBHb0Rpc3BhdGNoZXIuZ28udGVybWluYXRlKCksIDEwMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ2xvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJnbyBkaXNwYXRjaGVyIHdhcyBjbG9zZWRcIik7XHJcbiAgICAgICAgaWYgKEdvRGlzcGF0Y2hlci5saXN0ZW5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFByb2Nlc3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWdpc3RlcigpOiB2b2lkIHtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uZXhlY3V0ZShcclxuICAgICAgICAgICAge2NvbW1hbmQ6IFwic3RhcnRcIn0sIChyZXN1bHQ6IGFueSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5vaykgeyAgLy8gQ2hlY2sgaWYgcmVzcG9uc2UgaXMgb2tcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBvdXIgY2FzZSB3ZSBqdXN0IGVjaG8gdGhlIGNvbW1hbmQsIHNvIHdlIGNhbiBnZXQgb3VyIHRleHQgYmFja1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVHlwaWUgcmVzcG9uZGVkOiBcIiwgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcEdsb2JhbC5jb3JlTG9nUGF0aCA9IHJlc3BvbnNlLmxvZztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdvRGlzcGF0Y2hlci5saXN0ZW5pbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IEdvRGlzcGF0Y2hlciBmcm9tIFwiLi9Hb0Rpc3BhdGNoZXJcIjtcclxuaW1wb3J0IFBhY2tldCBmcm9tIFwiLi9tb2RlbHMvUGFja2V0XCI7XHJcbmltcG9ydCBTZWFyY2hQYXlsb2FkIGZyb20gXCIuL21vZGVscy9TZWFyY2hQYXlsb2FkXCI7XHJcbmltcG9ydCBUeXBpZVJvd0l0ZW0gZnJvbSBcIi4vbW9kZWxzL1R5cGllUm93SXRlbVwiO1xyXG5cclxuLy8gdGhpcyBpcyBhIGxpdHRsZSBoYWNrIHRvIHVzZSB0aGUgZ2xvYmFsIHZhcmlhYmxlIGluIFR5cGVTY3JpcHRcclxuLy8gaXQgaXMgdXNlZCB0byBnZXQgdGhlIGdvIGRpc3BhdGNoZXIgZnJvbSB0aGUgbWFpbiBwcm9jZXNzIHdlIG5lZWQgaXQgYXMgYSBzaW5nbGV0b25cclxuY29uc3QgZ2xvYmFsQW55OiBhbnkgPSBnbG9iYWw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBpZUNvcmUge1xyXG4gICAgcHJpdmF0ZSBzZWFyY2g6IFNlYXJjaFBheWxvYWQgPSBuZXcgU2VhcmNoUGF5bG9hZCgpO1xyXG4gICAgcHJpdmF0ZSBkYjogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBwYWNrYWdlTmFtZTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBjb21tYW5kOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHBheWxvYWQ6IGFueTtcclxuICAgIHByaXZhdGUgZ29EaXNwYXRjaGVyOiBHb0Rpc3BhdGNoZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGFja2FnZU5hbWU6IHN0cmluZywgZGI/OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdvRGlzcGF0Y2hlciA9IGdsb2JhbEFueS5Hb0Rpc3BhdGNoZXI7XHJcbiAgICAgICAgdGhpcy5kYiA9IGRiID8gZGIgOiBwYWNrYWdlTmFtZTtcclxuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gcGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFzdGVUZXh0KCkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwicGFzdGVUZXh0XCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0ge307XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZENvbGxlY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJhZGRDb2xsZWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0ge25hbWU6IHRoaXMucGFja2FnZU5hbWV9O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVDYWxsZWQoaXRlbSkge1xyXG4gICAgICAgIGl0ZW0uY291bnRVcCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluc2VydChpdGVtLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXVsdGlwbGVJbnNlcnQoaXRlbUxpc3QpIHtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcIm11bHRpcGxlSW5zZXJ0XCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gaXRlbUxpc3Q7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluc2VydChpdGVtOiBUeXBpZVJvd0l0ZW0sIHBlcnNpc3QgPSB0cnVlKSB7XHJcbiAgICAgICAgaXRlbS5zZXREQih0aGlzLmRiKTtcclxuICAgICAgICBpdGVtLnNldFBhY2thZ2UodGhpcy5wYWNrYWdlTmFtZSk7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gcGVyc2lzdCA/IFwiaW5zZXJ0UGVyc2lzdFwiIDogXCJpbnNlcnRcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSBpdGVtLnRvUGF5bG9hZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmUoaXRlbTogVHlwaWVSb3dJdGVtKSB7XHJcbiAgICAgICAgaXRlbS5zZXREQihpdGVtLmdldERCKCkpO1xyXG4gICAgICAgIGl0ZW0uc2V0UGFja2FnZShpdGVtLmdldFBhY2thZ2UoKSk7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJyZW1vdmVcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSBpdGVtLnRvUGF5bG9hZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRLZXkodmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMucGF5bG9hZC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZC5kYiA9IHRoaXMuZGI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLnBhY2thZ2VOYW1lID0gdGhpcy5wYWNrYWdlTmFtZTtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcImdldEtleVwiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRGaWxlc0xpc3QoYWxsb3dlZEV4dDogc3RyaW5nW10sIGRpckxpc3Q6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLmRiID0gdGhpcy5kYjtcclxuICAgICAgICB0aGlzLnBheWxvYWQucGFja2FnZU5hbWUgPSB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZC5hbGxvd2VkRXh0ID0gYWxsb3dlZEV4dDtcclxuICAgICAgICB0aGlzLnBheWxvYWQuZGlyTGlzdCA9IGRpckxpc3Q7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJnZXRFeGVjTGlzdFwiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBmdXp6eVNlYXJjaCh2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnNlYXJjaC50eXBlID0gXCJmdXp6eVwiO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmRiID0gdGhpcy5kYjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJzZWFyY2hcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSB0aGlzLnNlYXJjaDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Um93cyhsaW1pdDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gubGltaXQgPSBsaW1pdDtcclxuICAgICAgICB0aGlzLnNlYXJjaC50eXBlID0gXCJnZXRSb3dzXCI7XHJcbiAgICAgICAgdGhpcy5zZWFyY2guZGIgPSB0aGlzLmRiO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLnBhY2thZ2VOYW1lID0gdGhpcy5wYWNrYWdlTmFtZTtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcInNlYXJjaFwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHRoaXMuc2VhcmNoO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQa2cobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldERCKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZGIgPSBuYW1lO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcmRlckJ5KGZpZWxkOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaC5kaXJlY3Rpb24gPSBcImFzY1wiO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLm9yZGVyQnkgPSBmaWVsZDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXNjKCkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmRpcmVjdGlvbiA9IFwiYXNjXCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc2MoKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2guZGlyZWN0aW9uID0gXCJkZXNjXCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdvKCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ29EaXNwYXRjaGVyLnNlbmQobmV3IFBhY2tldCh0aGlzLmNvbW1hbmQsIHRoaXMucGF5bG9hZCkpO1xyXG4gICAgfVxyXG59XHJcbiIsIlxyXG5pbXBvcnQgQWJzdHJhY3RUeXBpZVBhY2thZ2UgZnJvbSBcIi4vQWJzdHJhY3RUeXBpZVBhY2thZ2VcIjtcclxuaW1wb3J0IEFwcEdsb2JhbCBmcm9tIFwiLi9BcHBHbG9iYWxcIjtcclxuaW1wb3J0IEdvRGlzcGF0Y2hlciBmcm9tIFwiLi9Hb0Rpc3BhdGNoZXJcIjtcclxuaW1wb3J0IFBhY2tldCBmcm9tIFwiLi9tb2RlbHMvUGFja2V0XCI7XHJcbmltcG9ydCBTZWFyY2hPYmplY3QgZnJvbSBcIi4vbW9kZWxzL1NlYXJjaE9iamVjdFwiO1xyXG5pbXBvcnQgVHlwaWVSb3dJdGVtIGZyb20gXCIuL21vZGVscy9UeXBpZVJvd0l0ZW1cIjtcclxuaW1wb3J0IFR5cGllQ29yZSBmcm9tIFwiLi9UeXBpZUNvcmVcIjtcclxuXHJcbmV4cG9ydCB7XHJcbiAgICBBYnN0cmFjdFR5cGllUGFja2FnZSxcclxuICAgIEFwcEdsb2JhbCxcclxuICAgIGdldFBhdGgsXHJcbiAgICBHb0Rpc3BhdGNoZXIsXHJcbiAgICBQYWNrZXQsXHJcbiAgICBUeXBpZUNvcmUsXHJcbiAgICBUeXBpZVJvd0l0ZW0sXHJcbiAgICBTZWFyY2hPYmplY3QsXHJcbn07XHJcblxyXG5pbXBvcnQgKiBhcyBpc0RldiBmcm9tIFwiZWxlY3Ryb24taXMtZGV2XCI7XHJcbmNvbnN0IGdldFBhdGggPSAoc3RhdGljUGF0aCkgPT4ge1xyXG4gICAgaWYgKCFpc0Rldikge1xyXG4gICAgICAgIHJldHVybiBcIi4uL3N0YXRpYy9cIiArIHN0YXRpY1BhdGg7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBzdGF0aWNQYXRoO1xyXG4gICAgfVxyXG59O1xyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFja2V0IHtcclxuICAgIHByaXZhdGUgY29tbWFuZCA9IFwiXCI7XHJcbiAgICBwcml2YXRlIHBheWxvYWQ6IG9iamVjdCA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IoY29tbWFuZDogc3RyaW5nLCBwYXlsb2FkPzogb2JqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkID8gcGF5bG9hZCA6IHt9O1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaE9iamVjdCB7XHJcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBwa2dMaXN0OiBzdHJpbmdbXTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMucGtnTGlzdCA9IFtdO1xyXG4gICAgfVxyXG59XHJcbiIsIlxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWFyY2hQYXlsb2FkIHtcclxuICAgIHB1YmxpYyB0eXBlOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgbGltaXQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyB2YWx1ZTogc3RyaW5nO1xyXG4gICAgcHVibGljIG9yZGVyQnk6IHN0cmluZztcclxuICAgIHB1YmxpYyBkaXJlY3Rpb246IHN0cmluZztcclxuICAgIHB1YmxpYyBwYWNrYWdlTmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGRiOiBzdHJpbmc7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcImZ1enp5XCI7ICAvLyBjYW4gYmUgJ2Z1enp5JyB8ICcnIHxcclxuICAgICAgICB0aGlzLmxpbWl0ID0gMTA7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFwiXCI7ICAgICAgICAgLy8gdGhlIGFjdHVhbCBzZWFyY2ggdmFsdVxyXG4gICAgICAgIHRoaXMub3JkZXJCeSA9IFwic2NvcmVcIjsgIC8vIHRoZSBuYW1lIG9mIHRoZSBmaWVsZCB0byBiZSBvcmRlcmVkIGJ5XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBcImRlc2NcIjtcclxuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gXCJcIjtcclxuICAgICAgICB0aGlzLmRiID0gXCJcIjtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge0lBY3Rpb259IGZyb20gXCIuL0lBY3Rpb25cIjtcclxuaW1wb3J0IHtJTGFiZWx9IGZyb20gXCIuL0lMYWJlbFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHlwaWVSb3dJdGVtIHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShkYXRhKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICBjb25zdCBpdGVtID0gbmV3IFR5cGllUm93SXRlbSgpO1xyXG4gICAgICAgIGl0ZW0uc2V0REIoZGF0YS5kYiA/IGRhdGEuZGIgOiBcImdsb2JhbFwiKTtcclxuICAgICAgICBpdGVtLnNldFBhY2thZ2UoZGF0YS50KTtcclxuICAgICAgICBpdGVtLnNldEFjdGlvbnMoZGF0YS5hKTtcclxuICAgICAgICBpdGVtLnNldFRpdGxlKGRhdGEudGl0bGUpO1xyXG4gICAgICAgIGl0ZW0uc2V0UGF0aChkYXRhLnApO1xyXG4gICAgICAgIGl0ZW0uc2V0RGVzY3JpcHRpb24oZGF0YS5kKTtcclxuICAgICAgICBpdGVtLnNldEljb24oZGF0YS5pKTtcclxuICAgICAgICBpdGVtLnNldENvdW50KGRhdGEuYyk7XHJcbiAgICAgICAgaXRlbS5zZXRTY29yZShkYXRhLnNjb3JlKTtcclxuICAgICAgICBpdGVtLnNldFVuaXh0aW1lKGRhdGEudSk7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBpc1BhY2thZ2UoaXRlbTogVHlwaWVSb3dJdGVtKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW0uZCA9PT0gXCJQYWNrYWdlXCJcclxuICAgICAgICAgICAgfHwgaXRlbS5kID09PSBcIlN1YlBhY2thZ2VcIlxyXG4gICAgICAgICAgICB8fCBpdGVtLnAgPT09IFwiUGFja2FnZVwiXHJcbiAgICAgICAgICAgIHx8IGl0ZW0ucC5zdGFydHNXaXRoKFwiU3ViUGFja2FnZXxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRiOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgZDogc3RyaW5nO1xyXG4gICAgcHVibGljIGk6IHN0cmluZztcclxuICAgIHB1YmxpYyB0OiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgcDogc3RyaW5nO1xyXG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgYzogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBhPzogSUFjdGlvbltdO1xyXG4gICAgcHVibGljIGw/OiBJTGFiZWxbXTtcclxuICAgIHB1YmxpYyBzY29yZT86IG51bWJlcjtcclxuICAgIHB1YmxpYyB1PzogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpdGxlPzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5kYiA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5kID0gXCJcIjtcclxuICAgICAgICB0aGlzLmkgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5wID0gXCJcIjtcclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGUgPyB0aXRsZSA6IFwiXCI7XHJcbiAgICAgICAgdGhpcy5jID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0VGl0bGUodmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRUaXRsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRpdGxlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRBY3Rpb25zKGFjdGlvbkxpc3Q6IElBY3Rpb25bXSk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5hID0gYWN0aW9uTGlzdDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QWN0aW9ucygpOiBJQWN0aW9uW10gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldExhYmVscyhsYWJlbExpc3Q6IElMYWJlbFtdKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLmwgPSBsYWJlbExpc3Q7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldExhYmVscygpOiBJTGFiZWxbXSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGF0aCh2YWx1ZTogc3RyaW5nKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLnAgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGF0aCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldERCKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuZGIgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0REIoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0RGVzY3JpcHRpb24odmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5kID0gdmFsdWUgPyB2YWx1ZSA6IFwiXCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldERlc2NyaXB0aW9uKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0SWNvbih2YWx1ZTogc3RyaW5nKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLmkgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0SWNvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBhY2thZ2UodmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy50ID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhY2thZ2UoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRDb3VudCh2YWx1ZTogbnVtYmVyKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLmMgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb3VudFVwKCk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5jID0gdGhpcy5jICsgMTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0VW5peHRpbWUodmFsdWU6IG51bWJlciB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMudSA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRVbml4dGltZSgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFNjb3JlKHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuc2NvcmUgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0U2NvcmUoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY29yZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9QYXlsb2FkKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGE6IHRoaXMuZ2V0QWN0aW9ucygpLFxyXG4gICAgICAgICAgICBjOiB0aGlzLmdldENvdW50KCksXHJcbiAgICAgICAgICAgIGQ6IHRoaXMuZ2V0RGVzY3JpcHRpb24oKSxcclxuICAgICAgICAgICAgZGI6IHRoaXMuZ2V0REIoKSxcclxuICAgICAgICAgICAgaTogdGhpcy5nZXRJY29uKCksXHJcbiAgICAgICAgICAgIGw6IHRoaXMuZ2V0TGFiZWxzKCksXHJcbiAgICAgICAgICAgIHA6IHRoaXMuZ2V0UGF0aCgpLFxyXG4gICAgICAgICAgICB0OiB0aGlzLmdldFBhY2thZ2UoKSxcclxuICAgICAgICAgICAgdGl0bGU6IHRoaXMuZ2V0VGl0bGUoKSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoaWxkX3Byb2Nlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXZlbnRzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTsiXSwic291cmNlUm9vdCI6IiJ9