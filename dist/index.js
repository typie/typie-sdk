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
		persistDir: process.cwd()
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
			self.proc = spawn('go', ['run', self.goFile, self.options.persistDir], { cwd: self.options.cwd, env: process.env });
		} else {
			// Spawn go compiled file
			self.proc = spawn( self.goFile, [self.options.persistDir], { cwd: self.options.cwd, env: process.env });
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
const AppGlobal_1 = __webpack_require__(/*! ./AppGlobal */ "./src/AppGlobal.ts");
const index_1 = __webpack_require__(/*! ./index */ "./src/index.ts");
const defaultIcon = "pkg-icon.png";
class AbstractTypiePackage {
    constructor(win, config, pkgName) {
        this.win = win;
        this.packageData = { name: pkgName, path: __dirname };
        this.packageName = pkgName;
        this.db = pkgName;
        this.pkgConfig = config;
        this.icon = Path.join(this.getFilePackagePath(), defaultIcon);
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
    getFilePackagePath() {
        return Path.join(AppGlobal_1.default.paths().getPackagesPath(), this.packageName);
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
            .then(data => console.log("insertItem", data))
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
        return Path.join(this.getFilePackagePath(), icon);
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
    static paths() {
        return {
            getStaticPath() { return global["paths.staticPath"]; },
            setStaticPath(absPath) { global["paths.staticPath"] = absPath; },
            getConfigDir() { return global["paths.configDir"]; },
            setConfigDir(absPath) { global["paths.configDir"] = absPath; },
            getMainConfigPath() { return global["paths.mainConfigPath"]; },
            setMainConfigPath(absPath) { global["paths.mainConfigPath"] = absPath; },
            getPackagesPath() { return global["paths.packagesPath"]; },
            setPackagesPath(absPath) { global["paths.packagesPath"] = absPath; },
            getUserDataPath() { return global["paths.userDataPath"]; },
            setUserDataPath(absPath) { global["paths.userDataPath"] = absPath; },
            getLogPath() { return global["paths.logPath"]; },
            setLogPath(absPath) { global["paths.logPath"] = absPath; },
            getLogsDir() { return global["paths.logsDir"]; },
            setLogsDir(absPath) { global["paths.logsDir"] = absPath; },
            getGoDispatchPath() { return global["paths.goDispatchPath"]; },
            setGoDispatchPath(absPath) { global["paths.goDispatchPath"] = absPath; },
            getThemesPath() { return global["paths.themesPath"]; },
            setThemesPath(absPath) { global["paths.themesPath"] = absPath; },
            getSelectedThemePath() { return global["paths.selectedThemePath"]; },
            setSelectedThemePath(absPath) { global["paths.selectedThemePath"] = absPath; },
            getSelectedThemeDir() { return global["paths.selectedThemeDir"]; },
            setSelectedThemeDir(absPath) { global["paths.selectedThemeDir"] = absPath; },
            getDbFolder() { return global["paths.dbFolder"]; },
            setDbFolder(absPath) { global["paths.dbFolder"] = absPath; },
        };
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
const AppGlobal_1 = __webpack_require__(/*! ./AppGlobal */ "./src/AppGlobal.ts");
// import * as path from "path";
const appGlobal = global;
class GoDispatcher {
    constructor(typieExecutable) {
        console.info("Starting Typie Service for the first time", typieExecutable);
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
        console.info("Starting Typie Service", GoDispatcher.executablePath);
        GoDispatcher.listening = false;
        GoDispatcher.go = new typie_go_1.Go({
            defaultCommandTimeoutSec: 60,
            maxCommandsRunning: 10,
            path: GoDispatcher.executablePath,
            persistDir: AppGlobal_1.default.paths().getUserDataPath(),
        });
        GoDispatcher.go.init(this.register);
        GoDispatcher.go.on("close", () => this.onClose());
        GoDispatcher.go.on("error", err => {
            console.error("go dispatcher had error", err.data.toString());
        });
        // setTimeout(() => GoDispatcher.go.terminate(), 10000);
    }
    onClose() {
        console.info("go dispatcher was closed");
        if (GoDispatcher.listening) {
            this.startProcess();
        }
    }
    register() {
        GoDispatcher.go.execute({ command: "start" }, (result, response) => {
            if (result.ok) { // Check if response is ok
                // In our case we just echo the command, so we can get our text back
                console.info("Typie responded: ", response.msg);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90eXBpZS1zZGsvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL3R5cGllLXNkay93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24taXMtZGV2L2luZGV4LmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy90eXBpZS1nby9saWIvY29tbWFuZC5qcyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvdHlwaWUtZ28vbGliL2NvbW1hbmRwb29sLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy90eXBpZS1nby9saWIvZ29ub2RlLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy90eXBpZS1nby9saWIvbWlzYy5qcyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvdHlwaWUtZ28vbGliL3F1ZXVlLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9BYnN0cmFjdFR5cGllUGFja2FnZS50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvQXBwR2xvYmFsLnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9Hb0Rpc3BhdGNoZXIudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL1R5cGllQ29yZS50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL21vZGVscy9QYWNrZXQudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL21vZGVscy9TZWFyY2hPYmplY3QudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL21vZGVscy9TZWFyY2hQYXlsb2FkLnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvVHlwaWVSb3dJdGVtLnRzIiwid2VicGFjazovL3R5cGllLXNkay9leHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJldmVudHNcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJmc1wiIiwid2VicGFjazovL3R5cGllLXNkay9leHRlcm5hbCBcInBhdGhcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJ1dGlsXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDbkVBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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QixDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNqQixDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtTQUN6QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBcEtELCtCQW9LQzs7Ozs7Ozs7Ozs7O0FDdktELDBDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLCtCOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6Ii4vZGlzdC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwidHlwaWUtc2RrXCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcInR5cGllLXNka1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ0eXBpZS1zZGtcIl0gPSBmYWN0b3J5KCk7XG59KShnbG9iYWwsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IGdldEZyb21FbnYgPSBwYXJzZUludChwcm9jZXNzLmVudi5FTEVDVFJPTl9JU19ERVYsIDEwKSA9PT0gMTtcbmNvbnN0IGlzRW52U2V0ID0gJ0VMRUNUUk9OX0lTX0RFVicgaW4gcHJvY2Vzcy5lbnY7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNFbnZTZXQgPyBnZXRGcm9tRW52IDogKHByb2Nlc3MuZGVmYXVsdEFwcCB8fCAvbm9kZV9tb2R1bGVzW1xcXFwvXWVsZWN0cm9uW1xcXFwvXS8udGVzdChwcm9jZXNzLmV4ZWNQYXRoKSk7XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXHJcbi8vXHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXHJcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxyXG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcclxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXHJcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4vL1xyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXHJcbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxyXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcclxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXHJcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcclxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbi8vIENvbW1hbmRzIG11c3QgYmUgZXhlY3V0ZWQgd2l0aGluIGEgY29tbWFuZCBwb29sIHRvIGxpbWl0IGV4ZWN1dGlvbiBjb3VudCBhbmQgdGltZS5cclxuXHJcbnZhciBtaXNjID0gcmVxdWlyZSgnLi9taXNjJyk7XHJcblxyXG4vLyBDcmVhdGUgYSBjb21tYW5kIG9iamVjdCB3aXRoIGlkLCBjb21tYW5kLCBjYWxsYmFjayBhbmQgb3B0aW9uYWxseSBzaWduYWxcclxuZXhwb3J0cy5Db21tYW5kID0gQ29tbWFuZDtcclxuZnVuY3Rpb24gQ29tbWFuZChpZCwgY21kLCBjYWxsYmFjaywgc2lnbmFsKSB7XHJcblx0Ly8gQ29udGFpbiBjb21tb24gZGF0YSB0byBiZSBzaGFyZWQgd2l0aCBnby1tb2R1bGUgaW4gLmNvbW1vblxyXG5cdHRoaXMuY29tbW9uID0ge1xyXG5cdFx0aWQ6IGlkLFxyXG5cdFx0Y21kOiBjbWQsXHJcblx0XHRzaWduYWw6IHNpZ25hbCA9PT0gdW5kZWZpbmVkID8gLTE6IHNpZ25hbCwgLy8gLTEgaXMgbm8gc2lnbmFsXHJcblx0fVxyXG5cdC8vIENvbnRhaW4gaW50ZXJuYWwgZGF0YSBub3QgdG8gYmUgc2VudCBvdmVyIHRoZSBpbnRlcmZhY2UgaW4gLmludGVybmFsXHJcblx0dGhpcy5pbnRlcm5hbCA9IHtcclxuXHRcdGNhbGxiYWNrOiBjYWxsYmFjayxcclxuXHRcdGV4ZWN1dGlvblN0YXJ0ZWQ6IGZhbHNlLFxyXG5cdFx0ZXhlY3V0aW9uRW5kZWQ6IGZhbHNlLFxyXG5cdH1cdFxyXG59XHJcblxyXG4vLyBDYWxsIHRvIHNldCB0aGUgZXhlY3V0aW9uIG9wdGlvbnMgZm9yIHRoaXMgY29tbWFuZC5cclxuLy8gRGVmYXVsdCBvcHRpb25zIHdpbGwgYmUgYWRkZWQgZm9yIHRob3NlIG5vdCBwcm92aWRlZFxyXG5Db21tYW5kLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ocG9vbCwgb3B0aW9ucykge1xyXG5cdHRoaXMuaW50ZXJuYWwub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblx0bWlzYy5tZXJnZURlZmF1bHRPcHRpb25zKHRoaXMuaW50ZXJuYWwub3B0aW9ucywge1xyXG5cdFx0Y29tbWFuZFRpbWVvdXRTZWM6IHBvb2wuZ28ub3B0aW9ucy5kZWZhdWx0Q29tbWFuZFRpbWVvdXRTZWMsXHJcblx0fSk7XHJcbn1cclxuXHJcbi8vIEV4ZWN1dGUgY29tbWFuZCBieSBzZW5kaW5nIGl0IHRvIGdvLW1vZHVsZVxyXG5Db21tYW5kLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24ocG9vbCwgb3B0aW9ucykge1xyXG5cdGV4ZWN1dGlvblN0YXJ0ZWQocG9vbCwgdGhpcyk7XHJcblxyXG5cdC8vIFNlbmQgY29tbW9uIGRhdGEgdG8gZ28tbW9kdWxlXHJcblx0cG9vbC5nby5wcm9jLnN0ZGluLndyaXRlKEpTT04uc3RyaW5naWZ5KHRoaXMuY29tbW9uKSArICdcXG4nKTsgLy8gV3JpdGUgXFxuIHRvIGZsdXNoIHdyaXRlIGJ1ZmZlclx0XHJcblxyXG59XHJcblxyXG4vLyBIYW5kbGUgY29tbWFuZCByZXNwb25zZSBhbmQgaW52b2tlIGNhbGxiYWNrXHJcbkNvbW1hbmQucHJvdG90eXBlLnJlc3BvbnNlID0gZnVuY3Rpb24ocG9vbCwgcmVzcG9uc2VEYXRhKSB7XHJcblx0ZXhlY3V0aW9uU3RvcHBlZChwb29sLCB0aGlzLCByZXNwb25zZURhdGEsIHtvazogdHJ1ZX0pO1x0XHRcclxufVxyXG5cclxuLy8gQ2FsbCBpZiBjb21tYW5kIHJlYWNoZXMgdGltZW91dCwgZW5kcyBleGVjdXRpb24gd2l0aCB0aW1lb3V0IGFzIHJlc3VsdFxyXG5Db21tYW5kLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24ocG9vbCkge1xyXG5cdGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgdGhpcywgbnVsbCwge3RpbWVvdXQ6IHRydWV9KTtcclxufVxyXG5cclxuLy8gQ2FsbCBpZiBjb21tYW5kIGlzIHRvIGJlIHRlcm1pbmF0ZWQsIGVuZHMgZXhlY3V0aW9uIHdpdGggdGVybWluYXRlZCBhcyByZXN1bHRcclxuQ29tbWFuZC5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24ocG9vbCkge1xyXG5cdGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgdGhpcywgbnVsbCwge3Rlcm1pbmF0ZWQ6IHRydWV9KTtcclxufVxyXG5cclxuLy8gQ2FsbCBlYWNoIHRpbWUgdGhlIGNvbW1hbmQgaXMgdG8gYmUgZXhlY3V0ZWQgdG8gdXBkYXRlIHN0YXR1c1xyXG4vLyBIYW5kbGVzIHRoZSBzdGF0ZSBvZiB0aGUgY29tbWFuZCBhcyB3ZWxsIGFzIHRoZSBjb250YWluaW5nIHBvb2wuXHJcbmZ1bmN0aW9uIGV4ZWN1dGlvblN0YXJ0ZWQocG9vbCwgY21kKSB7XHJcblx0Y21kLmludGVybmFsLmV4ZWN1dGlvblN0YXJ0ZWQgPSB0cnVlO1x0XHJcblxyXG5cdHBvb2wucnVubmluZ0NvbW1hbmRzKys7XHJcblx0cG9vbC5oYXNDb21tYW5kc1J1bm5pbmcgPSB0cnVlO1xyXG5cclxuXHQvLyBBZGQgZXhlY3V0aW5nIGNvbW1hbmQgdG8gbWFwXHJcblx0cG9vbC5jb21tYW5kTWFwW2NtZC5jb21tb24uaWRdID0gY21kO1xyXG5cclxuXHQvLyBPbmx5IHRpbWVvdXQgbm9uLXNpZ25hbCBjb21tYW5kc1xyXG5cdGlmKGNtZC5jb21tb24uc2lnbmFsID09PSAtMSkge1xyXG5cdFx0ZW5nYWdlVGltZW91dChwb29sLCBjbWQpO1xyXG5cdH0gXHJcbn1cclxuXHJcbi8vIENhbGwgZWFjaCB0aW1lIHRoZSBjb21tYW5kIGhhcyBiZWVuIHJlY2VpdmVkL3RpbWVkIG91dC9hYm9ydGVkIChzdG9wcGVkIGV4ZWN1dGlvbikgdG8gdXBkYXRlIHBvb2wgc3RhdHVzXHJcbi8vIEhhbmRsZXMgdGhlIHN0YXRlIG9mIHRoZSBjb21tYW5kIGFzIHdlbGwgYXMgdGhlIGNvbnRhaW5pbmcgcG9vbC5cclxuZnVuY3Rpb24gZXhlY3V0aW9uU3RvcHBlZChwb29sLCBjbWQsIHJlc3BvbnNlRGF0YSwgcmVzdWx0KSB7XHJcblx0aWYoIXJlc3VsdC50aW1lb3V0KSB7XHJcblx0XHRjbGVhclRpbWVvdXQoY21kLmludGVybmFsLnRpbWVvdXQpOyAvLyBTdG9wIHRpbWVvdXQgdGltZXJcclxuXHR9XHRcclxuXHRjbWQuaW50ZXJuYWwuZXhlY3V0aW9uRW5kZWQgPSB0cnVlO1xyXG5cclxuXHRwb29sLnJ1bm5pbmdDb21tYW5kcy0tO1xyXG5cdGlmKHBvb2wucnVubmluZ0NvbW1hbmRzIDw9IDApIHtcclxuXHRcdHBvb2wucnVubmluZ0NvbW1hbmRzID0gMDsgLy8gVG8gYmUgc2FmZVxyXG5cdFx0cG9vbC5oYXNDb21tYW5kc1J1bm5pbmcgPSBmYWxzZTtcclxuXHRcdHBvb2wuZW50ZXJlZElkbGUoKTsgLy8gUG9vbCBpcyBub3cgaWRsZVxyXG5cdH1cclxuXHJcblx0Ly8gU2luY2UgY29tbWFuZCBpcyBub3cgZG9uZSB3ZSBkZWxldGUgaXQgZnJvbSB0aGUgY29tbWFuZE1hcFx0XHJcblx0ZGVsZXRlIHBvb2wuY29tbWFuZE1hcFtjbWQuY29tbW9uLmlkXTtcclxuXHRwb29sLndvcmtRdWV1ZSgpOyAvLyBXaWxsIGJlIGFkZGVkIHRvIGV2ZW50IGxvb3BcclxuXHJcblx0Ly8gSW52b2tlIGNhbGxiYWNrIGxhc3RcclxuXHRpZihjbWQuaW50ZXJuYWwuY2FsbGJhY2sgIT09IHVuZGVmaW5lZCAmJiBjbWQuaW50ZXJuYWwuY2FsbGJhY2sgIT09IG51bGwpIHtcclxuXHRcdHZhciByZXNwb25zZVJlc3VsdCA9IHtcclxuXHRcdFx0b2s6IHJlc3VsdC5vayA9PT0gdHJ1ZSxcclxuXHRcdFx0dGltZW91dDogcmVzdWx0LnRpbWVvdXQgPT09IHRydWUsXHJcblx0XHRcdHRlcm1pbmF0ZWQ6IHJlc3VsdC50ZXJtaW5hdGVkID09PSB0cnVlLFxyXG5cdFx0fVxyXG5cdFx0Y21kLmludGVybmFsLmNhbGxiYWNrKHJlc3BvbnNlUmVzdWx0LCByZXNwb25zZURhdGEpO1xyXG5cdH1cclxufVxyXG5cclxuLy8gQWN0aXZhdGUgdGltZW91dCB0aW1lciB0byBhYm9ydCBjb21tYW5kcyBydW5uaW5nIGZvciB0b28gbG9uZ1xyXG4vLyBDYWxscyBleGVjdXRpb25TdG9wcGVkIHVwb24gdGltZW91dC5cclxuZnVuY3Rpb24gZW5nYWdlVGltZW91dChwb29sLCBjbWQpIHtcclxuXHRjbWQuaW50ZXJuYWwudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHRcdFxyXG5cdFx0Ly8gQ29tbWFuZCB0aW1lZCBvdXQsIGFib3J0IGV4ZWN1dGlvblxyXG5cdFx0Y21kLnRpbWVvdXQocG9vbCk7XHJcblx0fSwgY21kLmludGVybmFsLm9wdGlvbnMuY29tbWFuZFRpbWVvdXRTZWMgKiAxMDAwKTtcclxufVxyXG5cclxuLy8gQ29tbW9uIHNpZ25hbHNcclxuZXhwb3J0cy5TaWduYWxzID0ge1xyXG5cdFRlcm1pbmF0aW9uOiBuZXcgQ29tbWFuZCgwLCBudWxsLCBudWxsLCAxKSxcclxufSIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cclxuLy9cclxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcclxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxyXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcclxuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxyXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XHJcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxyXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuLy9cclxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcclxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbi8vXHJcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1NcclxuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxyXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXHJcbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxyXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1JcclxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxyXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG5cclxuY29uc3QgY29tbWFuZElkTGltaXQgPSAxZTk7XHJcblxyXG52YXIgbWlzYyA9IHJlcXVpcmUoJy4vbWlzYycpLFxyXG5cdFF1ZXVlID0gcmVxdWlyZSgnLi9xdWV1ZScpLlF1ZXVlLFx0XHJcblx0Q29tbWFuZCA9IHJlcXVpcmUoJy4vY29tbWFuZCcpLkNvbW1hbmQ7XHJcblxyXG5leHBvcnRzLkNvbW1hbmRQb29sID0gQ29tbWFuZFBvb2w7XHJcbmZ1bmN0aW9uIENvbW1hbmRQb29sKGdvKSB7XHJcblx0dGhpcy5nbyA9IGdvO1xyXG5cdHRoaXMuY29tbWFuZE1hcCA9IHt9LFxyXG5cdHRoaXMubmV4dENvbW1hbmRJZCA9IDA7XHJcblx0dGhpcy5ydW5uaW5nQ29tbWFuZHMgPSAwO1xyXG5cdHRoaXMuaGFzQ29tbWFuZHNSdW5uaW5nID0gZmFsc2U7XHJcblxyXG5cdHRoaXMuaWRsZUNtZFdhaXRpbmcgPSBudWxsOyAvLyBQcm92aWRlIHRoZSBhYmlsaXR5IHRvIGV4ZWN1dGUgYSBjb21tYW5kIHVwb24gbmV4dCBpZGxlXHJcblx0XHJcblx0dGhpcy5jb21tYW5kUXVldWUgPSBuZXcgUXVldWUoKTtcclxufVxyXG5cclxuLy8gUGxhbiB0aGUgZXhlY3V0aW9uIG9mIGEgY29tbWFuZCBhbmQgc2V0IGV4ZWN1dGlvbiBvcHRpb25zLlxyXG4vLyBOb25lIHByaW9yaXRpemVkIGNvbW1hbmRzIG1heSBiZSBxdWV1ZWQgaW5zdGVhZCBvZiBkaXJlY3RseSBleGVjdXRlZCBpZiBleGNlZWRpbmcgY29tbWFuZCBsaW1pdC5cclxuQ29tbWFuZFBvb2wucHJvdG90eXBlLnBsYW5FeGVjdXRpb24gPSBmdW5jdGlvbihjbWQsIHByaW9yaXRpemVkLCBvcHRpb25zKSB7XHJcblx0Y21kLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XHJcblx0Ly8gSWYgY29tbWFuZCBub3QgcHJpb3JpdGl6ZWQgbWFrZSBzdXJlIGl0IGRvZXMgbm90IGV4Y2VlZCBjb21tYW5kIGxpbWl0XHJcblx0Ly9jb25zb2xlLmxvZyh0aGlzLmdvLm9wdGlvbnMubWF4Q29tbWFuZHNSdW5uaW5nKVx0XHJcblx0ZXhlY3V0ZUNvbW1hbmQodGhpcywgY21kLCBwcmlvcml0aXplZCk7XHJcbn1cclxuXHJcbi8vIEhhbmRsZSBKU09OIHJlc3BvbnNlIGFuZCBwcm9jZXNzIGNvbW1hbmQgY2FsbGJhY2sgYW5kIGVuZCBvZiBleGVjdXRpb24gXHJcbi8vIEFsc28gbWFuYWdlIHRoZSBxdWV1ZSBpZiByZXF1aXJlZC4gXHJcbkNvbW1hbmRQb29sLnByb3RvdHlwZS5oYW5kbGVSZXNwb25zZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0dmFyIHJlc3BDbWQgPSB0aGlzLmNvbW1hbmRNYXBbcmVzcG9uc2UuaWRdXHJcblx0aWYocmVzcENtZCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRyZXNwQ21kLnJlc3BvbnNlKHRoaXMsIHJlc3BvbnNlLmRhdGEpO1x0XHJcblx0fSBlbHNlIHtcclxuXHRcdC8vIENvbW1hbmQgbWF5IGhhdmUgdGltZWQgb3V0IG9yIG90aGVyd2lzZSBhYm9ydGVkIHNvIHdlIHRocm93IHRoZSByZXNwb25zZSBhd2F5XHJcblx0fVx0XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBhIGNvbW1hbmQgd2l0aCBzcGVjaWZpZWQgZGF0YSBhbmQgY2FsbGJhY2sgd2l0aCBuZXcgSURcclxuQ29tbWFuZFBvb2wucHJvdG90eXBlLmNyZWF0ZUNvbW1hbmQgPSBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xyXG5cdGNtZCA9IG5ldyBDb21tYW5kKHRoaXMubmV4dENvbW1hbmRJZCwgZGF0YSwgY2FsbGJhY2spO1xyXG5cdGluY3JlbWVudENvbW1hbmRJZCh0aGlzKTtcclxuXHRyZXR1cm4gY21kO1xyXG59XHJcblxyXG4vLyBDaGVjayBpZiBjb21tYW5kcyBhcmUgcXVldWVkLCBhbmQgaWYgc28gZXhlY3V0ZSB0aGVtIG9uIG5leHQgZXZlbnQgbG9vcFxyXG5Db21tYW5kUG9vbC5wcm90b3R5cGUud29ya1F1ZXVlID0gZnVuY3Rpb24oKSB7XHJcblx0aWYoIXRoaXMuY29tbWFuZFF1ZXVlLmlzRW1wdHkoKSkgeyAvLyBDaGVjayBpZiBxdWV1ZSBpcyBlbXB0eSBmaXJzdFxyXG5cdFx0dmFyIHBvb2wgPSB0aGlzO1xyXG5cdFx0Ly8gRGVxdWV1ZSBjb21tYW5kIGhlcmUgbm90IG9uIG5leHRUaWNrKCkgdG8gYXZvaWQgbXVsdGlwbGUgZGVxdWV1ZXMgZm9yIHNhbWUgaXRlbVxyXG5cdFx0dmFyIG5leHRDbWQgPSBwb29sLmNvbW1hbmRRdWV1ZS5kZXF1ZXVlKCk7XHJcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkgeyAvLyBFeGVjdXRlIG5leHQgY29tbWFuZHMgb24gbmV4dCB0aWNrXHJcblx0XHRcdGV4ZWN1dGVDb21tYW5kKHBvb2wsIG5leHRDbWQsIGZhbHNlKTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxuLy8gUGxhbiBhIHNpbmdsZSBjb21tYW5kIHRvIGJlIHJ1biB0aGUgbmV4dCB0aW1lIHRoZSBjb21tYW5kIHBvb2wgaXMgaWRsZVxyXG4vLyAobm8gcnVubmluZyBjb21tYW5kcykuIENhbGxpbmcgdGhpcyBzZXZlcmFsIHRpbWVzIHdpdGhvdXQgaGF2aW5nIGFuIGlkbGUgcGVyaW9kXHJcbi8vIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91c2x5IHBsYW5uZWQgb24gaWRsZSBjb21tYW5kc1xyXG5Db21tYW5kUG9vbC5wcm90b3R5cGUucGxhbk9uSWRsZSA9IGZ1bmN0aW9uKGNtZCwgcHJpb3JpdGl6ZWQsIG9wdGlvbnMpIHtcclxuXHR0aGlzLmlkbGVDbWRXYWl0aW5nID0ge1xyXG5cdFx0Y21kOiBjbWQsXHJcblx0XHRwcmlvcml0aXplZDogcHJpb3JpdGl6ZWQsXHJcblx0XHRvcHRpb3M6IG9wdGlvbnMsXHJcblx0fTtcclxuXHQvLyBJZiB0aGVyZSdzIG5vIGNvbW1hbmRzIHJ1bm5pbmcsIGV4ZWN1dGUgaXQgcmlnaHQgYXdheVxyXG5cdGlmKCF0aGlzLmhhc0NvbW1hbmRzUnVubmluZykge1xyXG5cdFx0ZXhlY3V0ZVdhaXRpbmdDb21tYW5kKHRoaXMpO1xyXG5cdH1cclxufVxyXG5cclxuLy8gQ2FsbCB3aGVuIHBvb2wgaGFzIGVudGVyZWQgaWRsZSwgaS5lLiBoYXMgbm8gY29tbWFuZHMgcnVubmluZyBhcyBvZiBub3dcclxuQ29tbWFuZFBvb2wucHJvdG90eXBlLmVudGVyZWRJZGxlID0gZnVuY3Rpb24oKSB7XHJcblx0Ly8gQ2hlY2sgaWYgdGhlcmUncyBhIGNvbW1hbmQgd2FpdGluZyBmb3IgaWRsZVxyXG5cdGlmKHRoaXMuaWRsZUNtZFdhaXRpbmcgIT0gbnVsbCkge1xyXG5cdFx0Ly8gRXhlY3V0ZSB3YWl0aW5nIGNvbW1hbmQgb24gbmV4dCB0aWNrXHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRleGVjdXRlV2FpdGluZ0NvbW1hbmQoc2VsZik7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbi8vIENhdXNlcyBhbGwgcnVubmluZyBjb21tYW5kcyB0byB0aW1lb3V0XHJcbkNvbW1hbmRQb29sLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbigpIHtcclxuXHR0aGlzLmNvbW1hbmRRdWV1ZS5jbGVhcigpOyAvLyBDbGVhciBjb21tYW5kIHF1ZXVlXHJcblx0dGhpcy5pZGxlQ21kV2FpdGluZyA9IG51bGw7IC8vIFRocm93IGF3YXkgYW55IHdhaXRpbmcgY29tbWFuZFxyXG5cclxuXHRmb3IodmFyIGNtZElkIGluIHRoaXMuY29tbWFuZE1hcCkge1xyXG5cdFx0dmFyIGNtZCA9IHRoaXMuY29tbWFuZE1hcFtjbWRJZF07XHJcblx0XHRpZihjbWQuaW50ZXJuYWwuZXhlY3V0aW9uU3RhcnRlZCAmJiAhY21kLmludGVybmFsLmV4ZWN1dGlvbkVuZGVkKSB7XHJcblx0XHRcdGNtZC50ZXJtaW5hdGUodGhpcyk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vLyBFeGVjdXRlIGEgY29tbWFuZCBpZiBkb2VzIG5vdCBleGNlZWQgY29tbWFuZCBjb3VudCBsaW1pdCBhbmQgY29tbWFuZCBxdWV1ZSBpcyBlbXB0eVxyXG4vLyBvdGhlcndpc2UgcXVldWUgY29tbWFuZCBmb3IgbGF0ZXIgZXhlY3V0aW9uLlxyXG5mdW5jdGlvbiBleGVjdXRlQ29tbWFuZChwb29sLCBjbWQsIHByaW9yaXRpemVkKSB7XHJcblx0aWYoIXByaW9yaXRpemVkICYmIChwb29sLnJ1bm5pbmdDb21tYW5kcyA+PSBwb29sLmdvLm9wdGlvbnMubWF4Q29tbWFuZHNSdW5uaW5nKSkge1xyXG5cdFx0Ly8gRXhjZWVkcyBsaW1pdCwgcXVldWUgY29tbWFuZCBpbnN0ZWFkIG9mIHJ1bm5pbmdcclxuXHRcdHBvb2wuY29tbWFuZFF1ZXVlLmVucXVldWUoY21kKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gRXhlY3V0ZSBjb21tYW5kXHRcclxuXHRcdGNtZC5leGVjdXRlKHBvb2wpO1x0XHJcblx0fVxyXG59XHJcblxyXG4vLyBSZXNldCBuZXh0Q29tbWFuZElkIGlmIGdyb3dpbmcgcGFzdCBsaW1pdFxyXG4vLyBMaW1pdCBzaG91bGQgYmUgc2V0IGhpZ2ggZW5vdWdoIHNvIHRoYXQgdGhlIG9sZCBjb21tYW5kIGZvciBJRCAwXHJcbi8vIG1vc3QgbGlrZWx5IGhhcyByZXNwb25kZWQgb3IgdGltZWQgb3V0IGFuZCB3aWxsIG5vdCBjb25mbGljdCB3aXRoIG5ldyBvbmVzLlxyXG5mdW5jdGlvbiBpbmNyZW1lbnRDb21tYW5kSWQocG9vbCkge1xyXG5cdGlmKHBvb2wubmV4dENvbW1hbmRJZCsrID49IGNvbW1hbmRJZExpbWl0KSB7XHJcblx0XHRwb29sLm5leHRDb21tYW5kSWQgPSAwO1xyXG5cdH1cclxufVxyXG5cclxuLy8gRXhlY3V0ZSBhIGNvbW1hbmQgcGxhbm5lZCB0byBydW4gb24gbmV4dCBpZGxlXHJcbmZ1bmN0aW9uIGV4ZWN1dGVXYWl0aW5nQ29tbWFuZChwb29sKSB7XHJcblx0dmFyIHRvRXhlY3V0ZSA9IHBvb2wuaWRsZUNtZFdhaXRpbmc7XHJcblx0cG9vbC5pZGxlQ21kV2FpdGluZyA9IG51bGw7XHJcblx0cG9vbC5wbGFuRXhlY3V0aW9uKHRvRXhlY3V0ZS5jbWQsXHJcblx0XHR0b0V4ZWN1dGUucHJpb3JpdGl6ZWQsXHJcblx0XHR0b0V4ZWN1dGUub3B0aW9uc1xyXG5cdCk7XHJcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXHJcbi8vXHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXHJcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxyXG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcclxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXHJcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4vL1xyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXHJcbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxyXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcclxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXHJcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcclxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbnZhciBzcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bixcclxuXHR1dGlsID0gcmVxdWlyZSgndXRpbCcpLFxyXG5cdGZzID0gcmVxdWlyZSgnZnMnKSxcdFxyXG5cdG1pc2MgPSByZXF1aXJlKCcuL21pc2MnKSxcclxuXHRFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIsXHJcblx0Q29tbWFuZFBvb2wgPSByZXF1aXJlKCcuL2NvbW1hbmRwb29sJykuQ29tbWFuZFBvb2xcdFxyXG5cdFNpZ25hbHMgPSByZXF1aXJlKCcuL2NvbW1hbmQnKS5TaWduYWxzO1xyXG5cclxuLy8gQ3JlYXRlIGEgbmV3IEdvLW9iamVjdCBmb3IgdGhlIHNwZWNpZmllZCAuZ28tZmlsZS5cclxuLy8gV2lsbCBhbHNvIGludGlhbGl6ZSBHby1vYmplY3QgaWYgc2Vjb25kIHBhcmFtZXRlciBpcyB0cnVlLlxyXG4vL1xyXG4vLyBUaHJvd3MgZXJyb3IgaWYgbm8gcGF0aCBwcm92aWRlZCB0byAuZ28tZmlsZS5cclxudXRpbC5pbmhlcml0cyhHbywgRXZlbnRFbWl0dGVyKTtcclxuZXhwb3J0cy5HbyA9IEdvO1xyXG5mdW5jdGlvbiBHbyhvcHRpb25zLCBjYWxsYmFjaykge1xyXG5cdGlmKG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBvcHRpb25zID09PSBudWxsKSB7XHJcblx0XHRtaXNjLnJhaXNlRXJyb3IoJ05vIG9wdGlvbnMgcHJvdmlkZWQuJylcclxuXHR9XHJcblx0aWYob3B0aW9ucy5wYXRoID09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnBhdGggPT0gbnVsbCkge1xyXG5cdFx0bWlzYy5yYWlzZUVycm9yKCdObyBwYXRoIHByb3ZpZGVkIHRvIC5nby1maWxlLicpO1xyXG5cdH1cclxuXHJcblx0bWlzYy5tZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcclxuXHRcdG1heENvbW1hbmRzUnVubmluZzogMTAsXHJcblx0XHRkZWZhdWx0Q29tbWFuZFRpbWVvdXRTZWM6IDUsXHJcblx0XHRjd2Q6IHByb2Nlc3MuY3dkKCksXHJcblx0XHRwZXJzaXN0RGlyOiBwcm9jZXNzLmN3ZCgpXHJcblx0fSk7XHJcblx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuXHJcblx0dGhpcy5nb0ZpbGUgPSBvcHRpb25zLnBhdGg7XHJcblx0dGhpcy5wcm9jID0gbnVsbDtcclxuXHR0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7IC8vIHRydWUgd2hlbiBHbyBoYXMgYmVlbiBpbml0aWFsaXplZCwgYmFjayB0byBmYWxzZSB3aGVuIEdvIGNsb3Nlc1xyXG5cdHRoaXMuY2xvc2VQZW5kaW5nID0gZmFsc2U7IC8vIHRydWUgd2hlbiBjbG9zZSgpIGhhcyBiZWVuIGNhbGxlZCBhbmQgbm8gbW9yZSBjb21tYW5kcyBzaG91bGQgYmUgcGxhbm5lZFxyXG5cdHRoaXMudGVybWluYXRlUGVuZGluZyA9IGZhbHNlOyAvLyB0cnVlIHdoZW4gdGVybWluYXRlKCkgaGFzIGJlZW4gY2FsbGVkXHJcblx0dGhpcy5jb21tYW5kUG9vbCA9IG5ldyBDb21tYW5kUG9vbCh0aGlzKVxyXG5cclxuXHRpZihvcHRpb25zLmluaXRBdE9uY2UpIHtcclxuXHRcdHRoaXMuaW5pdChjYWxsYmFjayk7XHJcblx0fVxyXG59XHJcblxyXG4vLyBJbml0aWFsaXplIGJ5IGxhdW5jaGluZyBnbyBwcm9jZXNzIGFuZCBwcmVwYXJlIGZvciBjb21tYW5kcy5cclxuLy8gRG8gYXMgZWFybHkgYXMgcG9zc2libGUgdG8gYXZvaWQgZGVsYXkgd2hlbiBleGVjdXRpbmcgZmlyc3QgY29tbWFuZC5cclxuLy9cclxuLy8gY2FsbGJhY2sgaGFzIHBhcmFtZXRlcnMgKGVycilcclxuR28ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjYWxsYmFjaykge1x0XHRcclxuXHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0ZnMuZXhpc3RzKHRoaXMuZ29GaWxlLCBmdW5jdGlvbihleGlzdHMpIHtcclxuXHRcdGlmKCFleGlzdHMpIHtcdFxyXG5cdFx0XHRtaXNjLmNhbGxiYWNrSWZBdmFpbGFibGUoY2FsbGJhY2ssIG1pc2MuZ2V0RXJyb3IoJy5nby1maWxlIG5vdCBmb3VuZCBmb3IgZ2l2ZW4gcGF0aC4nKSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBzaW1wbGUgZXh0ZW5zaW9uIGNoZWNrIHRvIGRldGVjdCBpZiBpdHMgYSB1biBjb21waWxlcyAuZ28gZmlsZVxyXG5cdFx0aWYgKHNlbGYuZ29GaWxlLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnLmdvJykge1xyXG5cdFx0XHQvLyBTcGF3biBnbyBwcm9jZXNzIHdpdGhpbiBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5XHJcblx0XHRcdHNlbGYucHJvYyA9IHNwYXduKCdnbycsIFsncnVuJywgc2VsZi5nb0ZpbGUsIHNlbGYub3B0aW9ucy5wZXJzaXN0RGlyXSwgeyBjd2Q6IHNlbGYub3B0aW9ucy5jd2QsIGVudjogcHJvY2Vzcy5lbnYgfSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBTcGF3biBnbyBjb21waWxlZCBmaWxlXHJcblx0XHRcdHNlbGYucHJvYyA9IHNwYXduKCBzZWxmLmdvRmlsZSwgW3NlbGYub3B0aW9ucy5wZXJzaXN0RGlyXSwgeyBjd2Q6IHNlbGYub3B0aW9ucy5jd2QsIGVudjogcHJvY2Vzcy5lbnYgfSk7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8vIFNldHVwIGhhbmRsZXJzXHJcblx0XHRzZWxmLnByb2Muc3Rkb3V0Lm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdGhhbmRsZVN0ZG91dChzZWxmLCBkYXRhKTtcclxuXHRcdH0pO1xyXG5cdFx0c2VsZi5wcm9jLnN0ZGVyci5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRoYW5kbGVFcnIoc2VsZiwgZGF0YSwgZmFsc2UpO1xyXG5cdFx0fSk7XHJcblx0XHRzZWxmLnByb2Mub24oJ2Nsb3NlJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0aGFuZGxlQ2xvc2Uoc2VsZik7XHJcblx0XHR9KTtcdFx0XHJcblxyXG5cdFx0Ly8gSW5pdCBjb21wbGV0ZVxyXG5cdFx0c2VsZi5pbml0aWFsaXplZCA9IHRydWU7XHJcblx0XHRtaXNjLmNhbGxiYWNrSWZBdmFpbGFibGUoY2FsbGJhY2ssIG51bGwpO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vLyBHcmFjZWZ1bGx5IGNsb3NlIEdvIGJ5IHNlbmRpbmcgdGVybWluYXRpb24gc2lnbmFsIGFmdGVyIGFsbCBleGVjdXRpbmcgY29tbWFuZHNcclxuLy8gaGFzIGVuZGVkIHRoZWlyIGV4ZWN1dGlvbi5cclxuLy8gUmV0dXJucyB0cnVlIGlmIGNsb3NlIGhhcyBiZWVuIHN0YXJ0ZWQsIG9yIGZhbHNlIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBpZiBpdFxyXG4vLyBhbHJlYWR5IGhhcyBhIGNsb3NlIHBlbmRpbmcuXHJcbkdvLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG5cdGlmKHRoaXMuaW5pdGlhbGl6ZWQgJiYgIXRoaXMuY2xvc2VQZW5kaW5nICYmICF0aGlzLnRlcm1pbmF0ZVBlbmRpbmcpIHtcclxuXHRcdHRoaXMuY2xvc2VQZW5kaW5nID0gdHJ1ZTtcclxuXHRcdC8vIFNlbmQgcHJpb3JpdGl6ZWQgdGVybWluYXRpb24gc2lnbmFsXHJcblx0XHR0aGlzLmNvbW1hbmRQb29sLnBsYW5PbklkbGUoU2lnbmFscy5UZXJtaW5hdGlvbiwgdHJ1ZSk7XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcbi8vIEhhcmQgdGVybWluYXRlIGJ5IHNlbmRpbmcgdGVybWluYXRpb24gb24gYWxsIGNvbW1hbmRzIGFuZCB0ZXJtaW5hdGlvbiBzaWduYWwgdG8gR29cclxuLy8gUmV0dXJucyB0cnVlIGlmIHRlcm1pbmF0aW9uIGhhcyBiZWVuIHN0YXJ0ZWQsIG9yIGZhbHNlIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBpZiBpdFxyXG4vLyBhbHJlYWR5IGhhcyBhIHRlcm1pbmF0aW9uIHBlbmRpbmcuXHJcbkdvLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGVybWluYXRlKHRoaXMsIHRydWUpO1xyXG59XHJcblxyXG4vLyBDcmVhdGUgYW5kIGV4ZWN1dGUgb3IgcXVldWUgYSBjb21tYW5kIG9mIEpTT04gZGF0YVxyXG4vLyBXaWxsIG5vdCBxdWV1ZSBjb21tYW5kIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBoYXMgYmVlbiBjbG9zZWQgKG9yIGNsb3NlIHBlbmRpbmcpXHJcbi8vIFRha2VzIHBhcmFtZXRlcnM6XHJcbi8vIFx0XHRkYXRhIChyZXF1aXJlZCkgLSBhY3R1YWwgY29tbWFuZCBKU09OXHJcbi8vXHRcdGNhbGxiYWNrIChyZXF1aXJlZCkgLSB0aGUgY2FsbGJhY2sgdG8gY2FsbCB3aXRoIHBvc3NpYmxlIHJlc3VsdCB3aGVuIGV4ZWN1dGlvbiBlbmRzXHJcbi8vXHRcdG9wdGlvbnMgKG9wdGlvbmFsKSAtIG92ZXJyaWRlcyBkZWZhdWx0IGV4ZWN1dGlvbiBvcHRpb25zXHJcbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgY29tbWFuZCB3YXMgcGxhbm5lZCBmb3IgZXhlY3V0aW9uLCBvdGhlcndpc2UgZmFsc2UuXHJcbkdvLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpIHtcdFxyXG5cdGlmKHRoaXMuaW5pdGlhbGl6ZWQgJiYgIXRoaXMuY2xvc2VQZW5kaW5nICYmICF0aGlzLnRlcm1pbmF0ZVBlbmRpbmcpIHtcclxuXHRcdC8vIEltcG9ydGFudCB0byBub3QgbGVhdmUgZ28gaW4gYW4gaW5maW5pdGUgbG9vcCBlYXRpZyBjcHVcclxuXHRcdHRyeSB7IC8vIENvbnRhaW4gb3V0ZXIgZXhjZXB0aW9ucyBhbmQgY2xvc2UgZ28gYmVmb3JlIHJldGhyb3dpbmcgZXhjZXB0aW9uLlxyXG5cdFx0XHR0aGlzLmNvbW1hbmRQb29sLnBsYW5FeGVjdXRpb24odGhpcy5jb21tYW5kUG9vbC5jcmVhdGVDb21tYW5kKGRhdGEsIGNhbGxiYWNrKSwgZmFsc2UsIG9wdGlvbnMpO1x0XHJcblx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdGhhbmRsZUVycih0aGlzLCBlLCBmYWxzZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTsgLy8gUmV0dXJuIHRydWUgc2luY2UgdGhlIGNvbW1hbmQgaGFzIGJlZW4gcGxhbm5lZCBmb3IgZXhlY3V0aW9uXHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBmYWxzZTsgLy8gVGhlIGNvbW1hbmQgd2Fzbid0IHBsYW5uZWQgZm9yIGV4ZWN1dGlvbiwgcmV0dXJuIGZhbHNlXHJcblx0fVxyXG59XHJcblxyXG4vLyByZXNldCB0aGUgYnVmZmVyRGF0YSB3aXRoIGFuIGVtcHR5IHN0cmluZ1xyXG52YXIgYnVmZmVyRGF0YSA9IFwiXCI7XHJcblxyXG4vLyBSZWNlaXZlIGRhdGEgZnJvbSBnby1tb2R1bGVcclxuZnVuY3Rpb24gaGFuZGxlU3Rkb3V0KGdvLCBkYXRhKSB7XHJcblxyXG5cdC8vIGFwcGVuZCBkYXRhIHRvIHRoZSBidWZmZXIgZm9yIGV2ZXJ5IHN0ZG91dFxyXG4gICAgYnVmZmVyRGF0YSArPSBkYXRhLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgLy8gaWYgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBtZXNzYWdlIGluIHRoZSBzdGRvdXQgcGFyc2UgaXRcclxuXHQvLyBhbmQgcmVzZXQgdGhlIGJ1ZmZlciBmb3IgdGhlIG5leHQgc3Rkb3V0XHJcbiAgICBpZiAoYnVmZmVyRGF0YS5lbmRzV2l0aChcIlxcblwiKSkge1xyXG4gICAgICAgIC8vIFJlc3BvbnNlIG1heSBiZSBzZXZlcmFsIGNvbW1hbmQgcmVzcG9uc2VzIHNlcGFyYXRlZCBieSBuZXcgbGluZXNcclxuICAgICAgICBidWZmZXJEYXRhLnRvU3RyaW5nKCkuc3BsaXQoXCJcXG5cIikuZm9yRWFjaChmdW5jdGlvbihyZXNwKSB7XHJcbiAgICAgICAgICAgIC8vIERpc2NhcmQgZW1wdHkgbGluZXNcclxuICAgICAgICAgICAgaWYocmVzcC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBlYWNoIGNvbW1hbmQgcmVzcG9uc2Ugd2l0aCBhIGV2ZW50LWxvb3AgaW4gYmV0d2VlbiB0byBhdm9pZCBibG9ja2luZ1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpe3BhcnNlUmVzcG9uc2UoZ28sIHJlc3ApfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBidWZmZXJEYXRhID0gXCJcIjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gUGFyc2UgYSBfc2luZ2xlXyBjb21tYW5kIHJlc3BvbnNlIGFzIEpTT04gYW5kIGhhbmRsZSBpdFxyXG4vLyBJZiBwYXJzaW5nIGZhaWxzIGEgaW50ZXJuYWwgZXJyb3IgZXZlbnQgd2lsbCBiZSBlbWl0dGVkIHdpdGggdGhlIHJlc3BvbnNlIGRhdGFcclxuZnVuY3Rpb24gcGFyc2VSZXNwb25zZShnbywgcmVzcCkge1xyXG5cdHZhciBwYXJzZWQ7XHJcblx0dHJ5IHtcclxuXHRcdHBhcnNlZCA9IEpTT04ucGFyc2UocmVzcCk7XHJcblx0fSBjYXRjaCAoZSkge1x0XHRcclxuXHRcdGhhbmRsZUVycihnbywgcmVzcCwgdHJ1ZSk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHQvLyBJbXBvcnRhbnQgdG8gbm90IGxlYXZlIGdvIGluIGFuIGluZmluaXRlIGxvb3AgZWF0aWcgY3B1XHJcblx0dHJ5IHsgLy8gQ29udGFpbiBvdXRlciBleGNlcHRpb25zIGFuZCBjbG9zZSBnbyBiZWZvcmUgcmV0aHJvd2luZyBleGNlcHRpb24uXHJcblx0XHRnby5jb21tYW5kUG9vbC5oYW5kbGVSZXNwb25zZShwYXJzZWQpIC8vIEhhbmRsZSByZXNwb25zZSBvdXRzaWRlIHRocm93IHRvIGF2b2lkIGNhdGNoaW5nIHRob3NlIGV4Y2VwdGlvbnNcdFxyXG5cdH0gY2F0Y2ggKGUpIHtcclxuXHRcdGhhbmRsZUVycihnbywgZSwgZmFsc2UpO1xyXG5cdH1cdFxyXG59XHJcblxyXG4vLyBFbWl0IGVycm9yIGV2ZW50IG9uIGdvIGluc3RhbmNlLCBwYXNzIHRocm91Z2ggcmF3IGVycm9yIGRhdGFcclxuLy8gRXJyb3JzIG1heSBlaXRoZXIgYmUgaW50ZXJuYWwgcGFyc2VyIGVycm9ycyBvciBleHRlcm5hbCBlcnJvcnMgcmVjZWl2ZWQgZnJvbSBzdGRlcnJcclxuZnVuY3Rpb24gaGFuZGxlRXJyKGdvLCBkYXRhLCBwYXJzZXIpIHtcdFxyXG5cdGlmKCFwYXJzZXIpIHsgLy8gSWYgZXh0ZXJuYWwgZXJyb3IsIHRlcm1pbmF0ZSBhbGwgY29tbWFuZHNcclxuXHRcdHRlcm1pbmF0ZShnbywgZmFsc2UpO1xyXG5cdH1cclxuXHJcblx0aWYoZ28ubGlzdGVuZXJzKCdlcnJvcicpLmxlbmd0aCA+IDApIHsgLy8gT25seSBlbWl0IGV2ZW50IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnNcclxuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XHJcblx0XHRcdC8vIEVtaXQgYW55IGV2ZW50IG9uIG5leHQgdGlja1xyXG5cdFx0XHRnby5lbWl0KCdlcnJvcicsIHtwYXJzZXI6IHBhcnNlciwgZGF0YTogZGF0YX0pO1xyXG5cdFx0fSk7XHJcblx0fVx0XHJcbn1cclxuXHJcbi8vIEdvIHBhbmljIGFuZCBwcm9jZXNzIGVuZHMgY2F1c2VzIGNhbGxzIHRvIHRoaXNcclxuLy8gRW1pdCBjbG9zZSBldmVudCBvbiBnbyBpbnN0YW5jZVxyXG5mdW5jdGlvbiBoYW5kbGVDbG9zZShnbykge1xyXG5cdC8vIElmIHByb2Nlc3MgY2xvc2VzIHdlIHNldCBpbml0aWFsaXplZCB0byBmYWxzZSB0byBhdm9pZCBpbnZhbGlkIGNsb3NlKCkgb3IgZXhlY3V0ZSgpXHRcclxuXHRnby5pbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cdGlmKGdvLmxpc3RlbmVycygnY2xvc2UnKS5sZW5ndGggPiAwKSB7IC8vIE9ubHkgZW1pdCBldmVudCBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzXHJcblx0XHRnby5lbWl0KCdjbG9zZScpO1xyXG5cdH1cdFx0XHJcbn1cclxuXHJcbi8vIFRlcm1pbmF0ZSBieSBzZW5kaW5nIHRlcm1pbmF0aW9uIG9uIGFsbCBjb21tYW5kcy5cclxuLy8gSWYgY2FsbGVkIHdpdGggdHJ1ZSBpdCB3aWxsIGFsc28gZGlyZWN0bHkgdHJ5IHRvIHNlbmQgYSB0ZXJtaW5hdGlvbiBzaWduYWwgdG8gZ29cclxuZnVuY3Rpb24gdGVybWluYXRlKGdvLCB3aXRoU2lnbmFsKSB7XHJcblx0aWYoZ28uaW5pdGlhbGl6ZWQgJiYgIWdvLnRlcm1pbmF0ZVBlbmRpbmcpIHtcclxuXHRcdGdvLnRlcm1pbmF0ZVBlbmRpbmcgPSB0cnVlO1xyXG5cclxuXHRcdC8vIERvIHRoZSBhY3R1YWwgdGVybWluYXRpb24gYXN5bmNocm9ub3VzbHlcclxuXHRcdC8vIENhbGxiYWNrcyB3aWxsIGJlIGVhY2ggdGVybWluYXRlZCBjb21tYW5kIG9yIG5vdGhpbmdcclxuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKXtcclxuXHRcdFx0Ly8gVGVsbCBjb21tYW5kIHBvb2wgdG8ga2lsbCBhbGwgY29tbWFuZHNcclxuXHRcdFx0Z28uY29tbWFuZFBvb2wudGVybWluYXRlKCk7XHRcdFx0XHJcblxyXG5cdFx0XHQvLyBTZW5kIHNpZ25hbCBhZnRlciBjb21tYW5kIHBvb2wgdGVybWluYXRpb24sIG90aGVyd2lzZSBpdCB3b3VsZFxyXG5cdFx0XHQvLyBiZSByZW1vdmVkIGJ5IHRlcm1pbmF0ZSgpXHJcblx0XHRcdGlmKHdpdGhTaWduYWwpIHtcdFx0XHRcdFx0XHJcblx0XHRcdFx0Z28uY29tbWFuZFBvb2wucGxhbkV4ZWN1dGlvbihTaWduYWxzLlRlcm1pbmF0aW9uLCB0cnVlKTtcdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cdFxyXG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEpvaG4gR3JhbnN0csO2bVxyXG4vL1xyXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxyXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXHJcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xyXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXHJcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcclxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXHJcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4vL1xyXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxyXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuLy9cclxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xyXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cclxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXHJcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxyXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXHJcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcblxyXG4vLyBDb250YWlucyBnZW5lcmFsIGhlbHBlcnNcclxuXHJcbi8vIEludm9rZSBjYWxsYmFjayBpZiBub3QgdW5kZWZpbmVkIHdpdGggcHJvdmlkZWQgcGFyYW1ldGVyXHJcbmV4cG9ydHMuY2FsbGJhY2tJZkF2YWlsYWJsZSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBwYXJhbSkge1xyXG5cdGlmKHR5cGVvZiBjYWxsYmFjayAhPSB1bmRlZmluZWQpIHtcclxuXHRcdGNhbGxiYWNrKHBhcmFtKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydHMucmFpc2VFcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XHJcblx0dGhyb3cgZ2V0RXJyb3IoZXJyb3IpO1xyXG59XHJcblxyXG5leHBvcnRzLmdldEVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcclxuXHRyZXR1cm4gbmV3IEVycm9yKCdnb25vZGU6ICcgKyBlcnJvcik7XHJcbn1cclxuXHJcbi8vIE1ha2Ugc3VyZSBvcHRpb25zIG5vdCBwcm92aWRlZCBhcmUgc2V0IHRvIGRlZmF1bHQgdmFsdWVzIFxyXG5leHBvcnRzLm1lcmdlRGVmYXVsdE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zLCBkZWZhdWx0cykge1xyXG5cdGZvciAob3B0IGluIGRlZmF1bHRzKSB7XHJcblx0XHRpZihvcHRpb25zW29wdF0gPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRvcHRpb25zW29wdF0gPSBkZWZhdWx0c1tvcHRdO1xyXG5cdFx0fSBcclxuXHR9XHJcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXHJcbi8vXHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXHJcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxyXG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcclxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXHJcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4vL1xyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXHJcbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxyXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcclxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXHJcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcclxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbmV4cG9ydHMuUXVldWUgPSBRdWV1ZTtcclxuZnVuY3Rpb24gUXVldWUoKSB7XHJcblx0dGhpcy5hcnIgPSBbXTtcclxufVxyXG5cclxuUXVldWUucHJvdG90eXBlLmVucXVldWUgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcblx0dGhpcy5hcnIucHVzaChlbGVtZW50KTtcclxufVxyXG5cclxuUXVldWUucHJvdG90eXBlLmRlcXVldWUgPSBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcy5hcnIuc2hpZnQoKTtcclxufVxyXG5cclxuUXVldWUucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzLmFyci5sZW5ndGg7XHJcbn1cclxuXHJcblF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXMuZ2V0TGVuZ3RoKCkgPT09IDA7XHJcbn1cclxuXHJcblF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xyXG5cdHRoaXMuYXJyLmxlbmd0aCA9IDA7XHJcbn0iLCJpbXBvcnQgKiBhcyBQYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBBcHBHbG9iYWwgZnJvbSBcIi4vQXBwR2xvYmFsXCI7XHJcbmltcG9ydCB7Z2V0UGF0aCwgU2VhcmNoT2JqZWN0LCBUeXBpZUNvcmUsIFR5cGllUm93SXRlbX0gZnJvbSBcIi4vaW5kZXhcIjtcclxuXHJcbmNvbnN0IGRlZmF1bHRJY29uID0gXCJwa2ctaWNvbi5wbmdcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0VHlwaWVQYWNrYWdlIHtcclxuICAgIHByb3RlY3RlZCBwYWNrYWdlRGF0YTogYW55O1xyXG4gICAgcHJvdGVjdGVkIHBhY2thZ2VOYW1lOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgaWNvbjogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIHR5cGllOiBUeXBpZUNvcmU7XHJcbiAgICBwcm90ZWN0ZWQgcGtnQ29uZmlnOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgd2luOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgZGI6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBwYWNrYWdlczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdpbiwgY29uZmlnLCBwa2dOYW1lKSB7XHJcbiAgICAgICAgdGhpcy53aW4gPSB3aW47XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlRGF0YSA9IHtuYW1lOiBwa2dOYW1lLCBwYXRoOiBfX2Rpcm5hbWV9O1xyXG4gICAgICAgIHRoaXMucGFja2FnZU5hbWUgPSBwa2dOYW1lO1xyXG4gICAgICAgIHRoaXMuZGIgPSBwa2dOYW1lO1xyXG4gICAgICAgIHRoaXMucGtnQ29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIHRoaXMuaWNvbiA9IFBhdGguam9pbih0aGlzLmdldEZpbGVQYWNrYWdlUGF0aCgpLCBkZWZhdWx0SWNvbik7XHJcbiAgICAgICAgdGhpcy50eXBpZSA9IG5ldyBUeXBpZUNvcmUodGhpcy5wYWNrYWdlTmFtZSk7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMubG9hZENvbmZpZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrYWdlTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrYWdlUGF0aCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBnZXRQYXRoKFwicGFja2FnZXMvXCIgKyB0aGlzLnBhY2thZ2VOYW1lICsgXCIvXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRGaWxlUGFja2FnZVBhdGgoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gUGF0aC5qb2luKEFwcEdsb2JhbC5wYXRocygpLmdldFBhY2thZ2VzUGF0aCgpLCB0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RGVmYXVsdEl0ZW0odmFsdWUsIGRlc2NyaXB0aW9uID0gXCJcIiwgcGF0aCA9IFwiXCIsIGljb24gPSBcIlwiKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICBjb25zdCBpdGVtID0gbmV3IFR5cGllUm93SXRlbSgpO1xyXG4gICAgICAgIGl0ZW0uc2V0VGl0bGUodmFsdWUpO1xyXG4gICAgICAgIGl0ZW0uc2V0UGF0aChwYXRoID8gcGF0aCA6IHZhbHVlKTtcclxuICAgICAgICBpdGVtLnNldEljb24oaWNvbiA/IGljb24gOiB0aGlzLmljb24pO1xyXG4gICAgICAgIGl0ZW0uc2V0RGVzY3JpcHRpb24oZGVzY3JpcHRpb24gPyBkZXNjcmlwdGlvbiA6IFwiXCIpO1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnNlcnQodmFsdWUsIGRlc2NyaXB0aW9uID0gXCJcIiwgcGF0aCA9IFwiXCIsIGljb24gPSBcIlwiKSB7XHJcbiAgICAgICAgdGhpcy5pbnNlcnRJdGVtKHRoaXMuZ2V0RGVmYXVsdEl0ZW0odmFsdWUsIGRlc2NyaXB0aW9uLCBwYXRoLCBpY29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluc2VydEl0ZW0oaXRlbTogVHlwaWVSb3dJdGVtKSB7XHJcbiAgICAgICAgdGhpcy50eXBpZS5pbnNlcnQoaXRlbSkuZ28oKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IGNvbnNvbGUubG9nKFwiaW5zZXJ0SXRlbVwiLCBkYXRhKSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZWFyY2gob2JqOiBTZWFyY2hPYmplY3QsIGNhbGxiYWNrOiAoZGF0YSkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMudHlwaWUuZnV6enlTZWFyY2gob2JqLnZhbHVlKS5vcmRlckJ5KFwic2NvcmVcIikuZGVzYygpLmdvKClcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBjYWxsYmFjayhkYXRhKSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWN0aXZhdGUocGtnTGlzdDogc3RyaW5nW10sIGl0ZW06IFR5cGllUm93SXRlbSwgY2FsbGJhY2s6IChkYXRhKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgY29uc29sZS5pbmZvKCdObyBvdmVycmlkZSBcImFjdGl2YXRlXCIgbWV0aG9kIGZvdW5kIGluICcgKyB0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW50ZXJQa2cocGtnTGlzdDogc3RyaW5nW10sIGl0ZW0/OiBUeXBpZVJvd0l0ZW0sIGNhbGxiYWNrPzogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmdldEZpcnN0UmVjb3JkcygxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyKHBrZ0xpc3Q6IHN0cmluZ1tdLCBjYWxsYmFjazogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmdldEZpcnN0UmVjb3JkcygxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZShwa2dMaXN0OiBzdHJpbmdbXSwgaXRlbTogVHlwaWVSb3dJdGVtLCBjYWxsYmFjazogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICBjb25zb2xlLmluZm8oJ05vIG92ZXJyaWRlIFwicmVtb3ZlXCIgbWV0aG9kIGZvdW5kIGluICcgKyB0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0SWNvbihpY29uKSB7XHJcbiAgICAgICAgcmV0dXJuIFBhdGguam9pbih0aGlzLmdldEZpbGVQYWNrYWdlUGF0aCgpLCBpY29uKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Rmlyc3RSZWNvcmRzKG51bU9mUmVjb3JkczogbnVtYmVyID0gMTApIHtcclxuICAgICAgICB0aGlzLnR5cGllLmdldFJvd3MobnVtT2ZSZWNvcmRzKS5vcmRlckJ5KFwiY291bnRcIikuZGVzYygpLmdvKClcclxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHRoaXMud2luLnNlbmQoXCJyZXN1bHRMaXN0XCIsIHJlcykpXHJcbiAgICAgICAgICAgIC5jYXRjaChlID0+IGNvbnNvbGUuZXJyb3IoXCJlcnJvciBnZXR0aW5nIGZpcnN0IHJlY29yZHNcIiwgZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkQ29uZmlnKCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiTm8gb3ZlcnJpZGUgJ2xvYWRDb25maWcnIG1ldGhvZCBmb3VuZCBpbiBcIiArIHRoaXMucGFja2FnZU5hbWUpO1xyXG4gICAgICAgIGlmICh0aGlzLnBrZ0NvbmZpZy5zaG9ydGN1dCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlZ2lzdGVyaW5nIHNob3J0Y3V0IFwiICsgdGhpcy5wa2dDb25maWcuc2hvcnRjdXQgKyBcIiB0byBcIiArIHRoaXMuZ2V0UGFja2FnZU5hbWUoKSk7XHJcbiAgICAgICAgICAgIHRoaXMud2luLnJlZ2lzdGVyS2V5KHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndpbi5zZW5kKFwiY2hhbmdlUGFja2FnZVwiLCBbdGhpcy5nZXRQYWNrYWdlTmFtZSgpXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndpbi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImRlc3Ryb3lpbmcgdGhlIHBhY2thZ2UhXCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidW5yZWdpc3RlclwiLCB0aGlzLnBrZ0NvbmZpZyk7XHJcbiAgICAgICAgaWYgKHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMud2luLnVucmVnaXN0ZXJLZXkodGhpcy5wa2dDb25maWcuc2hvcnRjdXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwR2xvYmFsIHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldHRpbmdzOiBhbnk7XHJcbiAgICBwdWJsaWMgc3RhdGljIHN0YXJ0VGltZTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0VGltZVNpbmNlSW5pdCgpIHtcclxuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIEFwcEdsb2JhbC5zdGFydFRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRTZXR0aW5ncygpIHtcclxuICAgICAgICByZXR1cm4gQXBwR2xvYmFsLnNldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgc2V0KG5hbWU6IHN0cmluZywgb2JqOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBnbG9iYWxbbmFtZV0gPSBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcclxuICAgICAgICByZXR1cm4gZ2xvYmFsW25hbWVdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcGF0aHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0U3RhdGljUGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gZ2xvYmFsW1wicGF0aHMuc3RhdGljUGF0aFwiXTsgfSxcclxuICAgICAgICAgICAgc2V0U3RhdGljUGF0aChhYnNQYXRoOiBzdHJpbmcpIHsgZ2xvYmFsW1wicGF0aHMuc3RhdGljUGF0aFwiXSA9IGFic1BhdGg7IH0sXHJcbiAgICAgICAgICAgIGdldENvbmZpZ0RpcigpOiBzdHJpbmcgeyByZXR1cm4gZ2xvYmFsW1wicGF0aHMuY29uZmlnRGlyXCJdOyB9LFxyXG4gICAgICAgICAgICBzZXRDb25maWdEaXIoYWJzUGF0aDogc3RyaW5nKSB7IGdsb2JhbFtcInBhdGhzLmNvbmZpZ0RpclwiXSA9IGFic1BhdGg7IH0sXHJcbiAgICAgICAgICAgIGdldE1haW5Db25maWdQYXRoKCk6IHN0cmluZyB7IHJldHVybiBnbG9iYWxbXCJwYXRocy5tYWluQ29uZmlnUGF0aFwiXTsgfSxcclxuICAgICAgICAgICAgc2V0TWFpbkNvbmZpZ1BhdGgoYWJzUGF0aDogc3RyaW5nKSB7IGdsb2JhbFtcInBhdGhzLm1haW5Db25maWdQYXRoXCJdID0gYWJzUGF0aDsgfSxcclxuICAgICAgICAgICAgZ2V0UGFja2FnZXNQYXRoKCk6IHN0cmluZyB7IHJldHVybiBnbG9iYWxbXCJwYXRocy5wYWNrYWdlc1BhdGhcIl07IH0sXHJcbiAgICAgICAgICAgIHNldFBhY2thZ2VzUGF0aChhYnNQYXRoOiBzdHJpbmcpIHsgZ2xvYmFsW1wicGF0aHMucGFja2FnZXNQYXRoXCJdID0gYWJzUGF0aDsgfSxcclxuICAgICAgICAgICAgZ2V0VXNlckRhdGFQYXRoKCk6IHN0cmluZyB7IHJldHVybiBnbG9iYWxbXCJwYXRocy51c2VyRGF0YVBhdGhcIl07IH0sXHJcbiAgICAgICAgICAgIHNldFVzZXJEYXRhUGF0aChhYnNQYXRoOiBzdHJpbmcpIHsgZ2xvYmFsW1wicGF0aHMudXNlckRhdGFQYXRoXCJdID0gYWJzUGF0aDsgfSxcclxuICAgICAgICAgICAgZ2V0TG9nUGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gZ2xvYmFsW1wicGF0aHMubG9nUGF0aFwiXTsgfSxcclxuICAgICAgICAgICAgc2V0TG9nUGF0aChhYnNQYXRoOiBzdHJpbmcpIHsgZ2xvYmFsW1wicGF0aHMubG9nUGF0aFwiXSA9IGFic1BhdGg7IH0sXHJcbiAgICAgICAgICAgIGdldExvZ3NEaXIoKTogc3RyaW5nIHsgcmV0dXJuIGdsb2JhbFtcInBhdGhzLmxvZ3NEaXJcIl07IH0sXHJcbiAgICAgICAgICAgIHNldExvZ3NEaXIoYWJzUGF0aDogc3RyaW5nKSB7IGdsb2JhbFtcInBhdGhzLmxvZ3NEaXJcIl0gPSBhYnNQYXRoOyB9LFxyXG4gICAgICAgICAgICBnZXRHb0Rpc3BhdGNoUGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gZ2xvYmFsW1wicGF0aHMuZ29EaXNwYXRjaFBhdGhcIl07IH0sXHJcbiAgICAgICAgICAgIHNldEdvRGlzcGF0Y2hQYXRoKGFic1BhdGg6IHN0cmluZykgeyBnbG9iYWxbXCJwYXRocy5nb0Rpc3BhdGNoUGF0aFwiXSA9IGFic1BhdGg7IH0sXHJcbiAgICAgICAgICAgIGdldFRoZW1lc1BhdGgoKTogc3RyaW5nIHsgcmV0dXJuIGdsb2JhbFtcInBhdGhzLnRoZW1lc1BhdGhcIl07IH0sXHJcbiAgICAgICAgICAgIHNldFRoZW1lc1BhdGgoYWJzUGF0aDogc3RyaW5nKSB7IGdsb2JhbFtcInBhdGhzLnRoZW1lc1BhdGhcIl0gPSBhYnNQYXRoOyB9LFxyXG4gICAgICAgICAgICBnZXRTZWxlY3RlZFRoZW1lUGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gZ2xvYmFsW1wicGF0aHMuc2VsZWN0ZWRUaGVtZVBhdGhcIl07IH0sXHJcbiAgICAgICAgICAgIHNldFNlbGVjdGVkVGhlbWVQYXRoKGFic1BhdGg6IHN0cmluZykgeyBnbG9iYWxbXCJwYXRocy5zZWxlY3RlZFRoZW1lUGF0aFwiXSA9IGFic1BhdGg7IH0sXHJcbiAgICAgICAgICAgIGdldFNlbGVjdGVkVGhlbWVEaXIoKTogc3RyaW5nIHsgcmV0dXJuIGdsb2JhbFtcInBhdGhzLnNlbGVjdGVkVGhlbWVEaXJcIl07IH0sXHJcbiAgICAgICAgICAgIHNldFNlbGVjdGVkVGhlbWVEaXIoYWJzUGF0aDogc3RyaW5nKSB7IGdsb2JhbFtcInBhdGhzLnNlbGVjdGVkVGhlbWVEaXJcIl0gPSBhYnNQYXRoOyB9LFxyXG4gICAgICAgICAgICBnZXREYkZvbGRlcigpOiBzdHJpbmcgeyByZXR1cm4gZ2xvYmFsW1wicGF0aHMuZGJGb2xkZXJcIl07IH0sXHJcbiAgICAgICAgICAgIHNldERiRm9sZGVyKGFic1BhdGg6IHN0cmluZykgeyBnbG9iYWxbXCJwYXRocy5kYkZvbGRlclwiXSA9IGFic1BhdGg7IH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge0dvfSBmcm9tIFwidHlwaWUtZ29cIjtcclxuaW1wb3J0IEFwcEdsb2JhbCBmcm9tIFwiLi9BcHBHbG9iYWxcIjtcclxuaW1wb3J0IFBhY2tldCBmcm9tIFwiLi9tb2RlbHMvUGFja2V0XCI7XHJcbi8vIGltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcclxuY29uc3QgYXBwR2xvYmFsOiBhbnkgPSBnbG9iYWw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb0Rpc3BhdGNoZXIge1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ286IGFueTtcclxuICAgIHB1YmxpYyBzdGF0aWMgbGlzdGVuaW5nOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZXhlY3V0YWJsZVBhdGg6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBpZUV4ZWN1dGFibGU6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIlN0YXJ0aW5nIFR5cGllIFNlcnZpY2UgZm9yIHRoZSBmaXJzdCB0aW1lXCIsIHR5cGllRXhlY3V0YWJsZSk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmV4ZWN1dGFibGVQYXRoID0gdHlwaWVFeGVjdXRhYmxlO1xyXG4gICAgICAgIHRoaXMuc3RhcnRQcm9jZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlbmQocGFja2V0OiBQYWNrZXQpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwic2VuZCBwYWNrZXRcIiwgcGFja2V0KTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uZXhlY3V0ZShwYWNrZXQsIChyZXN1bHQ6IGFueSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJnb3QgYmFja1wiLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLmNsb3NlKCk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhcnRQcm9jZXNzKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIlN0YXJ0aW5nIFR5cGllIFNlcnZpY2VcIiwgR29EaXNwYXRjaGVyLmV4ZWN1dGFibGVQYXRoKTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIubGlzdGVuaW5nID0gZmFsc2U7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvID0gbmV3IEdvKHtcclxuICAgICAgICAgICAgZGVmYXVsdENvbW1hbmRUaW1lb3V0U2VjOiA2MCxcclxuICAgICAgICAgICAgbWF4Q29tbWFuZHNSdW5uaW5nOiAxMCxcclxuICAgICAgICAgICAgcGF0aDogR29EaXNwYXRjaGVyLmV4ZWN1dGFibGVQYXRoLFxyXG4gICAgICAgICAgICBwZXJzaXN0RGlyOiBBcHBHbG9iYWwucGF0aHMoKS5nZXRVc2VyRGF0YVBhdGgoKSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uaW5pdCh0aGlzLnJlZ2lzdGVyKTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28ub24oXCJjbG9zZVwiLCAoKSA9PiB0aGlzLm9uQ2xvc2UoKSk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLm9uKFwiZXJyb3JcIiwgZXJyID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImdvIGRpc3BhdGNoZXIgaGFkIGVycm9yXCIsIGVyci5kYXRhLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4gR29EaXNwYXRjaGVyLmdvLnRlcm1pbmF0ZSgpLCAxMDAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNsb3NlKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcImdvIGRpc3BhdGNoZXIgd2FzIGNsb3NlZFwiKTtcclxuICAgICAgICBpZiAoR29EaXNwYXRjaGVyLmxpc3RlbmluZykge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0UHJvY2VzcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZ2lzdGVyKCk6IHZvaWQge1xyXG4gICAgICAgIEdvRGlzcGF0Y2hlci5nby5leGVjdXRlKFxyXG4gICAgICAgICAgICB7Y29tbWFuZDogXCJzdGFydFwifSwgKHJlc3VsdDogYW55LCByZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm9rKSB7ICAvLyBDaGVjayBpZiByZXNwb25zZSBpcyBva1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluIG91ciBjYXNlIHdlIGp1c3QgZWNobyB0aGUgY29tbWFuZCwgc28gd2UgY2FuIGdldCBvdXIgdGV4dCBiYWNrXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiVHlwaWUgcmVzcG9uZGVkOiBcIiwgcmVzcG9uc2UubXNnKTtcclxuICAgICAgICAgICAgICAgICAgICBhcHBHbG9iYWwuY29yZUxvZ1BhdGggPSByZXNwb25zZS5sb2c7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVyciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBHb0Rpc3BhdGNoZXIubGlzdGVuaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCBHb0Rpc3BhdGNoZXIgZnJvbSBcIi4vR29EaXNwYXRjaGVyXCI7XHJcbmltcG9ydCBQYWNrZXQgZnJvbSBcIi4vbW9kZWxzL1BhY2tldFwiO1xyXG5pbXBvcnQgU2VhcmNoUGF5bG9hZCBmcm9tIFwiLi9tb2RlbHMvU2VhcmNoUGF5bG9hZFwiO1xyXG5pbXBvcnQgVHlwaWVSb3dJdGVtIGZyb20gXCIuL21vZGVscy9UeXBpZVJvd0l0ZW1cIjtcclxuXHJcbi8vIHRoaXMgaXMgYSBsaXR0bGUgaGFjayB0byB1c2UgdGhlIGdsb2JhbCB2YXJpYWJsZSBpbiBUeXBlU2NyaXB0XHJcbi8vIGl0IGlzIHVzZWQgdG8gZ2V0IHRoZSBnbyBkaXNwYXRjaGVyIGZyb20gdGhlIG1haW4gcHJvY2VzcyB3ZSBuZWVkIGl0IGFzIGEgc2luZ2xldG9uXHJcbmNvbnN0IGdsb2JhbEFueTogYW55ID0gZ2xvYmFsO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHlwaWVDb3JlIHtcclxuICAgIHByaXZhdGUgc2VhcmNoOiBTZWFyY2hQYXlsb2FkID0gbmV3IFNlYXJjaFBheWxvYWQoKTtcclxuICAgIHByaXZhdGUgZGI6IHN0cmluZztcclxuICAgIHByaXZhdGUgcGFja2FnZU5hbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgY29tbWFuZDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBwYXlsb2FkOiBhbnk7XHJcbiAgICBwcml2YXRlIGdvRGlzcGF0Y2hlcjogR29EaXNwYXRjaGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBhY2thZ2VOYW1lOiBzdHJpbmcsIGRiPzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nb0Rpc3BhdGNoZXIgPSBnbG9iYWxBbnkuR29EaXNwYXRjaGVyO1xyXG4gICAgICAgIHRoaXMuZGIgPSBkYiA/IGRiIDogcGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlTmFtZSA9IHBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhc3RlVGV4dCgpIHtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcInBhc3RlVGV4dFwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHt9O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDb2xsZWN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiYWRkQ29sbGVjdGlvblwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHtuYW1lOiB0aGlzLnBhY2thZ2VOYW1lfTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlQ2FsbGVkKGl0ZW0pIHtcclxuICAgICAgICBpdGVtLmNvdW50VXAoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnNlcnQoaXRlbSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG11bHRpcGxlSW5zZXJ0KGl0ZW1MaXN0KSB7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJtdWx0aXBsZUluc2VydFwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IGl0ZW1MaXN0O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnNlcnQoaXRlbTogVHlwaWVSb3dJdGVtLCBwZXJzaXN0ID0gdHJ1ZSkge1xyXG4gICAgICAgIGl0ZW0uc2V0REIodGhpcy5kYik7XHJcbiAgICAgICAgaXRlbS5zZXRQYWNrYWdlKHRoaXMucGFja2FnZU5hbWUpO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IHBlcnNpc3QgPyBcImluc2VydFBlcnNpc3RcIiA6IFwiaW5zZXJ0XCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gaXRlbS50b1BheWxvYWQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlKGl0ZW06IFR5cGllUm93SXRlbSkge1xyXG4gICAgICAgIGl0ZW0uc2V0REIoaXRlbS5nZXREQigpKTtcclxuICAgICAgICBpdGVtLnNldFBhY2thZ2UoaXRlbS5nZXRQYWNrYWdlKCkpO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwicmVtb3ZlXCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gaXRlbS50b1BheWxvYWQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0S2V5KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnBheWxvYWQudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnBheWxvYWQuZGIgPSB0aGlzLmRiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJnZXRLZXlcIjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RmlsZXNMaXN0KGFsbG93ZWRFeHQ6IHN0cmluZ1tdLCBkaXJMaXN0OiBzdHJpbmdbXSkge1xyXG4gICAgICAgIHRoaXMucGF5bG9hZC5kYiA9IHRoaXMuZGI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLnBhY2thZ2VOYW1lID0gdGhpcy5wYWNrYWdlTmFtZTtcclxuICAgICAgICB0aGlzLnBheWxvYWQuYWxsb3dlZEV4dCA9IGFsbG93ZWRFeHQ7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLmRpckxpc3QgPSBkaXJMaXN0O1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiZ2V0RXhlY0xpc3RcIjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZnV6enlTZWFyY2godmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gudHlwZSA9IFwiZnV6enlcIjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5kYiA9IHRoaXMuZGI7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gucGFja2FnZU5hbWUgPSB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwic2VhcmNoXCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gdGhpcy5zZWFyY2g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJvd3MobGltaXQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmxpbWl0ID0gbGltaXQ7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gudHlwZSA9IFwiZ2V0Um93c1wiO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmRiID0gdGhpcy5kYjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJzZWFyY2hcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSB0aGlzLnNlYXJjaDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGtnKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMucGFja2FnZU5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXREQihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmRiID0gbmFtZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3JkZXJCeShmaWVsZDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2guZGlyZWN0aW9uID0gXCJhc2NcIjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5vcmRlckJ5ID0gZmllbGQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzYygpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaC5kaXJlY3Rpb24gPSBcImFzY1wiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXNjKCkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmRpcmVjdGlvbiA9IFwiZGVzY1wiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnbygpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdvRGlzcGF0Y2hlci5zZW5kKG5ldyBQYWNrZXQodGhpcy5jb21tYW5kLCB0aGlzLnBheWxvYWQpKTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBBYnN0cmFjdFR5cGllUGFja2FnZSBmcm9tIFwiLi9BYnN0cmFjdFR5cGllUGFja2FnZVwiO1xyXG5pbXBvcnQgQXBwR2xvYmFsIGZyb20gXCIuL0FwcEdsb2JhbFwiO1xyXG5pbXBvcnQgR29EaXNwYXRjaGVyIGZyb20gXCIuL0dvRGlzcGF0Y2hlclwiO1xyXG5pbXBvcnQgUGFja2V0IGZyb20gXCIuL21vZGVscy9QYWNrZXRcIjtcclxuaW1wb3J0IFNlYXJjaE9iamVjdCBmcm9tIFwiLi9tb2RlbHMvU2VhcmNoT2JqZWN0XCI7XHJcbmltcG9ydCBUeXBpZVJvd0l0ZW0gZnJvbSBcIi4vbW9kZWxzL1R5cGllUm93SXRlbVwiO1xyXG5pbXBvcnQgVHlwaWVDb3JlIGZyb20gXCIuL1R5cGllQ29yZVwiO1xyXG5cclxuZXhwb3J0IHtcclxuICAgIEFic3RyYWN0VHlwaWVQYWNrYWdlLFxyXG4gICAgQXBwR2xvYmFsLFxyXG4gICAgZ2V0UGF0aCxcclxuICAgIEdvRGlzcGF0Y2hlcixcclxuICAgIFBhY2tldCxcclxuICAgIFR5cGllQ29yZSxcclxuICAgIFR5cGllUm93SXRlbSxcclxuICAgIFNlYXJjaE9iamVjdCxcclxufTtcclxuXHJcbmltcG9ydCAqIGFzIGlzRGV2IGZyb20gXCJlbGVjdHJvbi1pcy1kZXZcIjtcclxuY29uc3QgZ2V0UGF0aCA9IChzdGF0aWNQYXRoKTogc3RyaW5nID0+IHtcclxuICAgIGlmICghaXNEZXYpIHtcclxuICAgICAgICByZXR1cm4gXCIuLi9zdGF0aWMvXCIgKyBzdGF0aWNQYXRoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc3RhdGljUGF0aDtcclxuICAgIH1cclxufTtcclxuIiwiXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhY2tldCB7XHJcbiAgICBwcml2YXRlIGNvbW1hbmQgPSBcIlwiO1xyXG4gICAgcHJpdmF0ZSBwYXlsb2FkOiBvYmplY3QgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKGNvbW1hbmQ6IHN0cmluZywgcGF5bG9hZD86IG9iamVjdCkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZCA/IHBheWxvYWQgOiB7fTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTZWFyY2hPYmplY3Qge1xyXG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgcGtnTGlzdDogc3RyaW5nW107XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gXCJcIjtcclxuICAgICAgICB0aGlzLnBrZ0xpc3QgPSBbXTtcclxuICAgIH1cclxufVxyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoUGF5bG9hZCB7XHJcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGxpbWl0OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBvcmRlckJ5OiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgZGlyZWN0aW9uOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgcGFja2FnZU5hbWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBkYjogc3RyaW5nO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJmdXp6eVwiOyAgLy8gY2FuIGJlICdmdXp6eScgfCAnJyB8XHJcbiAgICAgICAgdGhpcy5saW1pdCA9IDEwO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiOyAgICAgICAgIC8vIHRoZSBhY3R1YWwgc2VhcmNoIHZhbHVcclxuICAgICAgICB0aGlzLm9yZGVyQnkgPSBcInNjb3JlXCI7ICAvLyB0aGUgbmFtZSBvZiB0aGUgZmllbGQgdG8gYmUgb3JkZXJlZCBieVxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gXCJkZXNjXCI7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5kYiA9IFwiXCI7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtJQWN0aW9ufSBmcm9tIFwiLi9JQWN0aW9uXCI7XHJcbmltcG9ydCB7SUxhYmVsfSBmcm9tIFwiLi9JTGFiZWxcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGllUm93SXRlbSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGF0YSk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBUeXBpZVJvd0l0ZW0oKTtcclxuICAgICAgICBpdGVtLnNldERCKGRhdGEuZGIgPyBkYXRhLmRiIDogXCJnbG9iYWxcIik7XHJcbiAgICAgICAgaXRlbS5zZXRQYWNrYWdlKGRhdGEudCk7XHJcbiAgICAgICAgaXRlbS5zZXRBY3Rpb25zKGRhdGEuYSk7XHJcbiAgICAgICAgaXRlbS5zZXRUaXRsZShkYXRhLnRpdGxlKTtcclxuICAgICAgICBpdGVtLnNldFBhdGgoZGF0YS5wKTtcclxuICAgICAgICBpdGVtLnNldERlc2NyaXB0aW9uKGRhdGEuZCk7XHJcbiAgICAgICAgaXRlbS5zZXRJY29uKGRhdGEuaSk7XHJcbiAgICAgICAgaXRlbS5zZXRDb3VudChkYXRhLmMpO1xyXG4gICAgICAgIGl0ZW0uc2V0U2NvcmUoZGF0YS5zY29yZSk7XHJcbiAgICAgICAgaXRlbS5zZXRVbml4dGltZShkYXRhLnUpO1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaXNQYWNrYWdlKGl0ZW06IFR5cGllUm93SXRlbSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBpdGVtLmQgPT09IFwiUGFja2FnZVwiXHJcbiAgICAgICAgICAgIHx8IGl0ZW0uZCA9PT0gXCJTdWJQYWNrYWdlXCJcclxuICAgICAgICAgICAgfHwgaXRlbS5wID09PSBcIlBhY2thZ2VcIlxyXG4gICAgICAgICAgICB8fCBpdGVtLnAuc3RhcnRzV2l0aChcIlN1YlBhY2thZ2V8XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkYjogc3RyaW5nO1xyXG4gICAgcHVibGljIGQ6IHN0cmluZztcclxuICAgIHB1YmxpYyBpOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdDogc3RyaW5nO1xyXG4gICAgcHVibGljIHA6IHN0cmluZztcclxuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGM6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgYT86IElBY3Rpb25bXTtcclxuICAgIHB1YmxpYyBsPzogSUxhYmVsW107XHJcbiAgICBwdWJsaWMgc2NvcmU/OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdT86IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZT86IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZGIgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuZCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5pID0gXCJcIjtcclxuICAgICAgICB0aGlzLnQgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMucCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlID8gdGl0bGUgOiBcIlwiO1xyXG4gICAgICAgIHRoaXMuYyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFRpdGxlKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMudGl0bGUgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VGl0bGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aXRsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0QWN0aW9ucyhhY3Rpb25MaXN0OiBJQWN0aW9uW10pOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuYSA9IGFjdGlvbkxpc3Q7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEFjdGlvbnMoKTogSUFjdGlvbltdIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRMYWJlbHMobGFiZWxMaXN0OiBJTGFiZWxbXSk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5sID0gbGFiZWxMaXN0O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYWJlbHMoKTogSUxhYmVsW10gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBhdGgodmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5wID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhdGgoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXREQih2YWx1ZTogc3RyaW5nKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLmRiID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldERCKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuZCA9IHZhbHVlID8gdmFsdWUgOiBcIlwiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREZXNjcmlwdGlvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldEljb24odmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5pID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEljb24oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQYWNrYWdlKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMudCA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrYWdlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0Q291bnQodmFsdWU6IG51bWJlcik6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5jID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY291bnRVcCgpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuYyA9IHRoaXMuYyArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFVuaXh0aW1lKHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLnUgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VW5peHRpbWUoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRTY29yZSh2YWx1ZTogbnVtYmVyIHwgdW5kZWZpbmVkKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLnNjb3JlID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFNjb3JlKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NvcmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvUGF5bG9hZCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhOiB0aGlzLmdldEFjdGlvbnMoKSxcclxuICAgICAgICAgICAgYzogdGhpcy5nZXRDb3VudCgpLFxyXG4gICAgICAgICAgICBkOiB0aGlzLmdldERlc2NyaXB0aW9uKCksXHJcbiAgICAgICAgICAgIGRiOiB0aGlzLmdldERCKCksXHJcbiAgICAgICAgICAgIGk6IHRoaXMuZ2V0SWNvbigpLFxyXG4gICAgICAgICAgICBsOiB0aGlzLmdldExhYmVscygpLFxyXG4gICAgICAgICAgICBwOiB0aGlzLmdldFBhdGgoKSxcclxuICAgICAgICAgICAgdDogdGhpcy5nZXRQYWNrYWdlKCksXHJcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLmdldFRpdGxlKCksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==