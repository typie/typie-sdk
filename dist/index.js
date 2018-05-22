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
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
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
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
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
        console.info('No o      verride "activate" method found in ' + this.packageName);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90eXBpZS1zZGsvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL3R5cGllLXNkay93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24taXMtZGV2L2luZGV4LmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy9nb25vZGUvbGliL2NvbW1hbmQuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvY29tbWFuZHBvb2wuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvZ29ub2RlLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy9nb25vZGUvbGliL21pc2MuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvcXVldWUuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL0Fic3RyYWN0VHlwaWVQYWNrYWdlLnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9BcHBHbG9iYWwudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL0dvRGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvVHlwaWUudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvUGFja2V0LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvU2VhcmNoT2JqZWN0LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvU2VhcmNoUGF5bG9hZC50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvbW9kZWxzL1R5cGllUm93SXRlbS50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJjaGlsZF9wcm9jZXNzXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUN6RUE7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFO0FBQ0E7O0FBRUE7QUFDQTtB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SCxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN4QixFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNqQixDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNqQixDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtTQUN6QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBeEpELCtCQXdKQzs7Ozs7Ozs7Ozs7O0FDMUpELDBDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLCtCOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6Ii4vZGlzdC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwidHlwaWUtc2RrXCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcInR5cGllLXNka1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ0eXBpZS1zZGtcIl0gPSBmYWN0b3J5KCk7XG59KShnbG9iYWwsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgd2FzbSBtb2R1bGVzXG4gXHR2YXIgaW5zdGFsbGVkV2FzbU1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIG9iamVjdCB3aXRoIGFsbCBjb21waWxlZCBXZWJBc3NlbWJseS5Nb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLncgPSB7fTtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBnZXRGcm9tRW52ID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuRUxFQ1RST05fSVNfREVWLCAxMCkgPT09IDE7XG5jb25zdCBpc0VudlNldCA9ICdFTEVDVFJPTl9JU19ERVYnIGluIHByb2Nlc3MuZW52O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRW52U2V0ID8gZ2V0RnJvbUVudiA6IChwcm9jZXNzLmRlZmF1bHRBcHAgfHwgL25vZGVfbW9kdWxlc1tcXFxcL11lbGVjdHJvbltcXFxcL10vLnRlc3QocHJvY2Vzcy5leGVjUGF0aCkpO1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEpvaG4gR3JhbnN0csO2bVxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBDb21tYW5kcyBtdXN0IGJlIGV4ZWN1dGVkIHdpdGhpbiBhIGNvbW1hbmQgcG9vbCB0byBsaW1pdCBleGVjdXRpb24gY291bnQgYW5kIHRpbWUuXG5cbnZhciBtaXNjID0gcmVxdWlyZSgnLi9taXNjJyk7XG5cbi8vIENyZWF0ZSBhIGNvbW1hbmQgb2JqZWN0IHdpdGggaWQsIGNvbW1hbmQsIGNhbGxiYWNrIGFuZCBvcHRpb25hbGx5IHNpZ25hbFxuZXhwb3J0cy5Db21tYW5kID0gQ29tbWFuZDtcbmZ1bmN0aW9uIENvbW1hbmQoaWQsIGNtZCwgY2FsbGJhY2ssIHNpZ25hbCkge1xuXHQvLyBDb250YWluIGNvbW1vbiBkYXRhIHRvIGJlIHNoYXJlZCB3aXRoIGdvLW1vZHVsZSBpbiAuY29tbW9uXG5cdHRoaXMuY29tbW9uID0ge1xuXHRcdGlkOiBpZCxcblx0XHRjbWQ6IGNtZCxcblx0XHRzaWduYWw6IHNpZ25hbCA9PT0gdW5kZWZpbmVkID8gLTE6IHNpZ25hbCwgLy8gLTEgaXMgbm8gc2lnbmFsXG5cdH1cblx0Ly8gQ29udGFpbiBpbnRlcm5hbCBkYXRhIG5vdCB0byBiZSBzZW50IG92ZXIgdGhlIGludGVyZmFjZSBpbiAuaW50ZXJuYWxcblx0dGhpcy5pbnRlcm5hbCA9IHtcblx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0ZXhlY3V0aW9uU3RhcnRlZDogZmFsc2UsXG5cdFx0ZXhlY3V0aW9uRW5kZWQ6IGZhbHNlLFxuXHR9XHRcbn1cblxuLy8gQ2FsbCB0byBzZXQgdGhlIGV4ZWN1dGlvbiBvcHRpb25zIGZvciB0aGlzIGNvbW1hbmQuXG4vLyBEZWZhdWx0IG9wdGlvbnMgd2lsbCBiZSBhZGRlZCBmb3IgdGhvc2Ugbm90IHByb3ZpZGVkXG5Db21tYW5kLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ocG9vbCwgb3B0aW9ucykge1xuXHR0aGlzLmludGVybmFsLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRtaXNjLm1lcmdlRGVmYXVsdE9wdGlvbnModGhpcy5pbnRlcm5hbC5vcHRpb25zLCB7XG5cdFx0Y29tbWFuZFRpbWVvdXRTZWM6IHBvb2wuZ28ub3B0aW9ucy5kZWZhdWx0Q29tbWFuZFRpbWVvdXRTZWMsXG5cdH0pO1xufVxuXG4vLyBFeGVjdXRlIGNvbW1hbmQgYnkgc2VuZGluZyBpdCB0byBnby1tb2R1bGVcbkNvbW1hbmQucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbihwb29sLCBvcHRpb25zKSB7XG5cdGV4ZWN1dGlvblN0YXJ0ZWQocG9vbCwgdGhpcyk7XG5cblx0Ly8gU2VuZCBjb21tb24gZGF0YSB0byBnby1tb2R1bGVcblx0cG9vbC5nby5wcm9jLnN0ZGluLndyaXRlKEpTT04uc3RyaW5naWZ5KHRoaXMuY29tbW9uKSArICdcXG4nKTsgLy8gV3JpdGUgXFxuIHRvIGZsdXNoIHdyaXRlIGJ1ZmZlclx0XG5cbn1cblxuLy8gSGFuZGxlIGNvbW1hbmQgcmVzcG9uc2UgYW5kIGludm9rZSBjYWxsYmFja1xuQ29tbWFuZC5wcm90b3R5cGUucmVzcG9uc2UgPSBmdW5jdGlvbihwb29sLCByZXNwb25zZURhdGEpIHtcblx0ZXhlY3V0aW9uU3RvcHBlZChwb29sLCB0aGlzLCByZXNwb25zZURhdGEsIHtvazogdHJ1ZX0pO1x0XHRcbn1cblxuLy8gQ2FsbCBpZiBjb21tYW5kIHJlYWNoZXMgdGltZW91dCwgZW5kcyBleGVjdXRpb24gd2l0aCB0aW1lb3V0IGFzIHJlc3VsdFxuQ29tbWFuZC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKHBvb2wpIHtcblx0ZXhlY3V0aW9uU3RvcHBlZChwb29sLCB0aGlzLCBudWxsLCB7dGltZW91dDogdHJ1ZX0pO1xufVxuXG4vLyBDYWxsIGlmIGNvbW1hbmQgaXMgdG8gYmUgdGVybWluYXRlZCwgZW5kcyBleGVjdXRpb24gd2l0aCB0ZXJtaW5hdGVkIGFzIHJlc3VsdFxuQ29tbWFuZC5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24ocG9vbCkge1xuXHRleGVjdXRpb25TdG9wcGVkKHBvb2wsIHRoaXMsIG51bGwsIHt0ZXJtaW5hdGVkOiB0cnVlfSk7XG59XG5cbi8vIENhbGwgZWFjaCB0aW1lIHRoZSBjb21tYW5kIGlzIHRvIGJlIGV4ZWN1dGVkIHRvIHVwZGF0ZSBzdGF0dXNcbi8vIEhhbmRsZXMgdGhlIHN0YXRlIG9mIHRoZSBjb21tYW5kIGFzIHdlbGwgYXMgdGhlIGNvbnRhaW5pbmcgcG9vbC5cbmZ1bmN0aW9uIGV4ZWN1dGlvblN0YXJ0ZWQocG9vbCwgY21kKSB7XG5cdGNtZC5pbnRlcm5hbC5leGVjdXRpb25TdGFydGVkID0gdHJ1ZTtcdFxuXG5cdHBvb2wucnVubmluZ0NvbW1hbmRzKys7XG5cdHBvb2wuaGFzQ29tbWFuZHNSdW5uaW5nID0gdHJ1ZTtcblxuXHQvLyBBZGQgZXhlY3V0aW5nIGNvbW1hbmQgdG8gbWFwXG5cdHBvb2wuY29tbWFuZE1hcFtjbWQuY29tbW9uLmlkXSA9IGNtZDtcblxuXHQvLyBPbmx5IHRpbWVvdXQgbm9uLXNpZ25hbCBjb21tYW5kc1xuXHRpZihjbWQuY29tbW9uLnNpZ25hbCA9PT0gLTEpIHtcblx0XHRlbmdhZ2VUaW1lb3V0KHBvb2wsIGNtZCk7XG5cdH0gXG59XG5cbi8vIENhbGwgZWFjaCB0aW1lIHRoZSBjb21tYW5kIGhhcyBiZWVuIHJlY2VpdmVkL3RpbWVkIG91dC9hYm9ydGVkIChzdG9wcGVkIGV4ZWN1dGlvbikgdG8gdXBkYXRlIHBvb2wgc3RhdHVzXG4vLyBIYW5kbGVzIHRoZSBzdGF0ZSBvZiB0aGUgY29tbWFuZCBhcyB3ZWxsIGFzIHRoZSBjb250YWluaW5nIHBvb2wuXG5mdW5jdGlvbiBleGVjdXRpb25TdG9wcGVkKHBvb2wsIGNtZCwgcmVzcG9uc2VEYXRhLCByZXN1bHQpIHtcblx0aWYoIXJlc3VsdC50aW1lb3V0KSB7XG5cdFx0Y2xlYXJUaW1lb3V0KGNtZC5pbnRlcm5hbC50aW1lb3V0KTsgLy8gU3RvcCB0aW1lb3V0IHRpbWVyXG5cdH1cdFxuXHRjbWQuaW50ZXJuYWwuZXhlY3V0aW9uRW5kZWQgPSB0cnVlO1xuXG5cdHBvb2wucnVubmluZ0NvbW1hbmRzLS07XG5cdGlmKHBvb2wucnVubmluZ0NvbW1hbmRzIDw9IDApIHtcblx0XHRwb29sLnJ1bm5pbmdDb21tYW5kcyA9IDA7IC8vIFRvIGJlIHNhZmVcblx0XHRwb29sLmhhc0NvbW1hbmRzUnVubmluZyA9IGZhbHNlO1xuXHRcdHBvb2wuZW50ZXJlZElkbGUoKTsgLy8gUG9vbCBpcyBub3cgaWRsZVxuXHR9XG5cblx0Ly8gU2luY2UgY29tbWFuZCBpcyBub3cgZG9uZSB3ZSBkZWxldGUgaXQgZnJvbSB0aGUgY29tbWFuZE1hcFx0XG5cdGRlbGV0ZSBwb29sLmNvbW1hbmRNYXBbY21kLmNvbW1vbi5pZF07XG5cdHBvb2wud29ya1F1ZXVlKCk7IC8vIFdpbGwgYmUgYWRkZWQgdG8gZXZlbnQgbG9vcFxuXG5cdC8vIEludm9rZSBjYWxsYmFjayBsYXN0XG5cdGlmKGNtZC5pbnRlcm5hbC5jYWxsYmFjayAhPT0gdW5kZWZpbmVkICYmIGNtZC5pbnRlcm5hbC5jYWxsYmFjayAhPT0gbnVsbCkge1xuXHRcdHZhciByZXNwb25zZVJlc3VsdCA9IHtcblx0XHRcdG9rOiByZXN1bHQub2sgPT09IHRydWUsXG5cdFx0XHR0aW1lb3V0OiByZXN1bHQudGltZW91dCA9PT0gdHJ1ZSxcblx0XHRcdHRlcm1pbmF0ZWQ6IHJlc3VsdC50ZXJtaW5hdGVkID09PSB0cnVlLFxuXHRcdH1cblx0XHRjbWQuaW50ZXJuYWwuY2FsbGJhY2socmVzcG9uc2VSZXN1bHQsIHJlc3BvbnNlRGF0YSk7XG5cdH1cbn1cblxuLy8gQWN0aXZhdGUgdGltZW91dCB0aW1lciB0byBhYm9ydCBjb21tYW5kcyBydW5uaW5nIGZvciB0b28gbG9uZ1xuLy8gQ2FsbHMgZXhlY3V0aW9uU3RvcHBlZCB1cG9uIHRpbWVvdXQuXG5mdW5jdGlvbiBlbmdhZ2VUaW1lb3V0KHBvb2wsIGNtZCkge1xuXHRjbWQuaW50ZXJuYWwudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHRcdFxuXHRcdC8vIENvbW1hbmQgdGltZWQgb3V0LCBhYm9ydCBleGVjdXRpb25cblx0XHRjbWQudGltZW91dChwb29sKTtcblx0fSwgY21kLmludGVybmFsLm9wdGlvbnMuY29tbWFuZFRpbWVvdXRTZWMgKiAxMDAwKTtcbn1cblxuLy8gQ29tbW9uIHNpZ25hbHNcbmV4cG9ydHMuU2lnbmFscyA9IHtcblx0VGVybWluYXRpb246IG5ldyBDb21tYW5kKDAsIG51bGwsIG51bGwsIDEpLFxufSIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuY29uc3QgY29tbWFuZElkTGltaXQgPSAxZTk7XG5cbnZhciBtaXNjID0gcmVxdWlyZSgnLi9taXNjJyksXG5cdFF1ZXVlID0gcmVxdWlyZSgnLi9xdWV1ZScpLlF1ZXVlLFx0XG5cdENvbW1hbmQgPSByZXF1aXJlKCcuL2NvbW1hbmQnKS5Db21tYW5kO1xuXG5leHBvcnRzLkNvbW1hbmRQb29sID0gQ29tbWFuZFBvb2w7XG5mdW5jdGlvbiBDb21tYW5kUG9vbChnbykge1xuXHR0aGlzLmdvID0gZ287XG5cdHRoaXMuY29tbWFuZE1hcCA9IHt9LFxuXHR0aGlzLm5leHRDb21tYW5kSWQgPSAwO1xuXHR0aGlzLnJ1bm5pbmdDb21tYW5kcyA9IDA7XG5cdHRoaXMuaGFzQ29tbWFuZHNSdW5uaW5nID0gZmFsc2U7XG5cblx0dGhpcy5pZGxlQ21kV2FpdGluZyA9IG51bGw7IC8vIFByb3ZpZGUgdGhlIGFiaWxpdHkgdG8gZXhlY3V0ZSBhIGNvbW1hbmQgdXBvbiBuZXh0IGlkbGVcblx0XG5cdHRoaXMuY29tbWFuZFF1ZXVlID0gbmV3IFF1ZXVlKCk7XG59XG5cbi8vIFBsYW4gdGhlIGV4ZWN1dGlvbiBvZiBhIGNvbW1hbmQgYW5kIHNldCBleGVjdXRpb24gb3B0aW9ucy5cbi8vIE5vbmUgcHJpb3JpdGl6ZWQgY29tbWFuZHMgbWF5IGJlIHF1ZXVlZCBpbnN0ZWFkIG9mIGRpcmVjdGx5IGV4ZWN1dGVkIGlmIGV4Y2VlZGluZyBjb21tYW5kIGxpbWl0LlxuQ29tbWFuZFBvb2wucHJvdG90eXBlLnBsYW5FeGVjdXRpb24gPSBmdW5jdGlvbihjbWQsIHByaW9yaXRpemVkLCBvcHRpb25zKSB7XG5cdGNtZC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuXHQvLyBJZiBjb21tYW5kIG5vdCBwcmlvcml0aXplZCBtYWtlIHN1cmUgaXQgZG9lcyBub3QgZXhjZWVkIGNvbW1hbmQgbGltaXRcblx0Ly9jb25zb2xlLmxvZyh0aGlzLmdvLm9wdGlvbnMubWF4Q29tbWFuZHNSdW5uaW5nKVx0XG5cdGV4ZWN1dGVDb21tYW5kKHRoaXMsIGNtZCwgcHJpb3JpdGl6ZWQpO1xufVxuXG4vLyBIYW5kbGUgSlNPTiByZXNwb25zZSBhbmQgcHJvY2VzcyBjb21tYW5kIGNhbGxiYWNrIGFuZCBlbmQgb2YgZXhlY3V0aW9uIFxuLy8gQWxzbyBtYW5hZ2UgdGhlIHF1ZXVlIGlmIHJlcXVpcmVkLiBcbkNvbW1hbmRQb29sLnByb3RvdHlwZS5oYW5kbGVSZXNwb25zZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdHZhciByZXNwQ21kID0gdGhpcy5jb21tYW5kTWFwW3Jlc3BvbnNlLmlkXVxuXHRpZihyZXNwQ21kICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXNwQ21kLnJlc3BvbnNlKHRoaXMsIHJlc3BvbnNlLmRhdGEpO1x0XG5cdH0gZWxzZSB7XG5cdFx0Ly8gQ29tbWFuZCBtYXkgaGF2ZSB0aW1lZCBvdXQgb3Igb3RoZXJ3aXNlIGFib3J0ZWQgc28gd2UgdGhyb3cgdGhlIHJlc3BvbnNlIGF3YXlcblx0fVx0XG59XG5cbi8vIENyZWF0ZSBhIGNvbW1hbmQgd2l0aCBzcGVjaWZpZWQgZGF0YSBhbmQgY2FsbGJhY2sgd2l0aCBuZXcgSURcbkNvbW1hbmRQb29sLnByb3RvdHlwZS5jcmVhdGVDb21tYW5kID0gZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcblx0Y21kID0gbmV3IENvbW1hbmQodGhpcy5uZXh0Q29tbWFuZElkLCBkYXRhLCBjYWxsYmFjayk7XG5cdGluY3JlbWVudENvbW1hbmRJZCh0aGlzKTtcblx0cmV0dXJuIGNtZDtcbn1cblxuLy8gQ2hlY2sgaWYgY29tbWFuZHMgYXJlIHF1ZXVlZCwgYW5kIGlmIHNvIGV4ZWN1dGUgdGhlbSBvbiBuZXh0IGV2ZW50IGxvb3BcbkNvbW1hbmRQb29sLnByb3RvdHlwZS53b3JrUXVldWUgPSBmdW5jdGlvbigpIHtcblx0aWYoIXRoaXMuY29tbWFuZFF1ZXVlLmlzRW1wdHkoKSkgeyAvLyBDaGVjayBpZiBxdWV1ZSBpcyBlbXB0eSBmaXJzdFxuXHRcdHZhciBwb29sID0gdGhpcztcblx0XHQvLyBEZXF1ZXVlIGNvbW1hbmQgaGVyZSBub3Qgb24gbmV4dFRpY2soKSB0byBhdm9pZCBtdWx0aXBsZSBkZXF1ZXVlcyBmb3Igc2FtZSBpdGVtXG5cdFx0dmFyIG5leHRDbWQgPSBwb29sLmNvbW1hbmRRdWV1ZS5kZXF1ZXVlKCk7XG5cdFx0cHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHsgLy8gRXhlY3V0ZSBuZXh0IGNvbW1hbmRzIG9uIG5leHQgdGlja1xuXHRcdFx0ZXhlY3V0ZUNvbW1hbmQocG9vbCwgbmV4dENtZCwgZmFsc2UpO1xuXHRcdH0pO1xuXHR9XG59XG5cbi8vIFBsYW4gYSBzaW5nbGUgY29tbWFuZCB0byBiZSBydW4gdGhlIG5leHQgdGltZSB0aGUgY29tbWFuZCBwb29sIGlzIGlkbGVcbi8vIChubyBydW5uaW5nIGNvbW1hbmRzKS4gQ2FsbGluZyB0aGlzIHNldmVyYWwgdGltZXMgd2l0aG91dCBoYXZpbmcgYW4gaWRsZSBwZXJpb2Rcbi8vIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91c2x5IHBsYW5uZWQgb24gaWRsZSBjb21tYW5kc1xuQ29tbWFuZFBvb2wucHJvdG90eXBlLnBsYW5PbklkbGUgPSBmdW5jdGlvbihjbWQsIHByaW9yaXRpemVkLCBvcHRpb25zKSB7XG5cdHRoaXMuaWRsZUNtZFdhaXRpbmcgPSB7XG5cdFx0Y21kOiBjbWQsXG5cdFx0cHJpb3JpdGl6ZWQ6IHByaW9yaXRpemVkLFxuXHRcdG9wdGlvczogb3B0aW9ucyxcblx0fTtcblx0Ly8gSWYgdGhlcmUncyBubyBjb21tYW5kcyBydW5uaW5nLCBleGVjdXRlIGl0IHJpZ2h0IGF3YXlcblx0aWYoIXRoaXMuaGFzQ29tbWFuZHNSdW5uaW5nKSB7XG5cdFx0ZXhlY3V0ZVdhaXRpbmdDb21tYW5kKHRoaXMpO1xuXHR9XG59XG5cbi8vIENhbGwgd2hlbiBwb29sIGhhcyBlbnRlcmVkIGlkbGUsIGkuZS4gaGFzIG5vIGNvbW1hbmRzIHJ1bm5pbmcgYXMgb2Ygbm93XG5Db21tYW5kUG9vbC5wcm90b3R5cGUuZW50ZXJlZElkbGUgPSBmdW5jdGlvbigpIHtcblx0Ly8gQ2hlY2sgaWYgdGhlcmUncyBhIGNvbW1hbmQgd2FpdGluZyBmb3IgaWRsZVxuXHRpZih0aGlzLmlkbGVDbWRXYWl0aW5nICE9IG51bGwpIHtcblx0XHQvLyBFeGVjdXRlIHdhaXRpbmcgY29tbWFuZCBvbiBuZXh0IHRpY2tcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0cHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcblx0XHRcdGV4ZWN1dGVXYWl0aW5nQ29tbWFuZChzZWxmKTtcblx0XHR9KTtcblx0fVxufVxuXG4vLyBDYXVzZXMgYWxsIHJ1bm5pbmcgY29tbWFuZHMgdG8gdGltZW91dFxuQ29tbWFuZFBvb2wucHJvdG90eXBlLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmNvbW1hbmRRdWV1ZS5jbGVhcigpOyAvLyBDbGVhciBjb21tYW5kIHF1ZXVlXG5cdHRoaXMuaWRsZUNtZFdhaXRpbmcgPSBudWxsOyAvLyBUaHJvdyBhd2F5IGFueSB3YWl0aW5nIGNvbW1hbmRcblxuXHRmb3IodmFyIGNtZElkIGluIHRoaXMuY29tbWFuZE1hcCkge1xuXHRcdHZhciBjbWQgPSB0aGlzLmNvbW1hbmRNYXBbY21kSWRdO1xuXHRcdGlmKGNtZC5pbnRlcm5hbC5leGVjdXRpb25TdGFydGVkICYmICFjbWQuaW50ZXJuYWwuZXhlY3V0aW9uRW5kZWQpIHtcblx0XHRcdGNtZC50ZXJtaW5hdGUodGhpcyk7XG5cdFx0fVxuXHR9XG59XG5cbi8vIEV4ZWN1dGUgYSBjb21tYW5kIGlmIGRvZXMgbm90IGV4Y2VlZCBjb21tYW5kIGNvdW50IGxpbWl0IGFuZCBjb21tYW5kIHF1ZXVlIGlzIGVtcHR5XG4vLyBvdGhlcndpc2UgcXVldWUgY29tbWFuZCBmb3IgbGF0ZXIgZXhlY3V0aW9uLlxuZnVuY3Rpb24gZXhlY3V0ZUNvbW1hbmQocG9vbCwgY21kLCBwcmlvcml0aXplZCkge1xuXHRpZighcHJpb3JpdGl6ZWQgJiYgKHBvb2wucnVubmluZ0NvbW1hbmRzID49IHBvb2wuZ28ub3B0aW9ucy5tYXhDb21tYW5kc1J1bm5pbmcpKSB7XG5cdFx0Ly8gRXhjZWVkcyBsaW1pdCwgcXVldWUgY29tbWFuZCBpbnN0ZWFkIG9mIHJ1bm5pbmdcblx0XHRwb29sLmNvbW1hbmRRdWV1ZS5lbnF1ZXVlKGNtZCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gRXhlY3V0ZSBjb21tYW5kXHRcblx0XHRjbWQuZXhlY3V0ZShwb29sKTtcdFxuXHR9XG59XG5cbi8vIFJlc2V0IG5leHRDb21tYW5kSWQgaWYgZ3Jvd2luZyBwYXN0IGxpbWl0XG4vLyBMaW1pdCBzaG91bGQgYmUgc2V0IGhpZ2ggZW5vdWdoIHNvIHRoYXQgdGhlIG9sZCBjb21tYW5kIGZvciBJRCAwXG4vLyBtb3N0IGxpa2VseSBoYXMgcmVzcG9uZGVkIG9yIHRpbWVkIG91dCBhbmQgd2lsbCBub3QgY29uZmxpY3Qgd2l0aCBuZXcgb25lcy5cbmZ1bmN0aW9uIGluY3JlbWVudENvbW1hbmRJZChwb29sKSB7XG5cdGlmKHBvb2wubmV4dENvbW1hbmRJZCsrID49IGNvbW1hbmRJZExpbWl0KSB7XG5cdFx0cG9vbC5uZXh0Q29tbWFuZElkID0gMDtcblx0fVxufVxuXG4vLyBFeGVjdXRlIGEgY29tbWFuZCBwbGFubmVkIHRvIHJ1biBvbiBuZXh0IGlkbGVcbmZ1bmN0aW9uIGV4ZWN1dGVXYWl0aW5nQ29tbWFuZChwb29sKSB7XG5cdHZhciB0b0V4ZWN1dGUgPSBwb29sLmlkbGVDbWRXYWl0aW5nO1xuXHRwb29sLmlkbGVDbWRXYWl0aW5nID0gbnVsbDtcblx0cG9vbC5wbGFuRXhlY3V0aW9uKHRvRXhlY3V0ZS5jbWQsXG5cdFx0dG9FeGVjdXRlLnByaW9yaXRpemVkLFxuXHRcdHRvRXhlY3V0ZS5vcHRpb25zXG5cdCk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEpvaG4gR3JhbnN0csO2bVxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgc3Bhd24gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuc3Bhd24sXG5cdHV0aWwgPSByZXF1aXJlKCd1dGlsJyksXG5cdGZzID0gcmVxdWlyZSgnZnMnKSxcdFxuXHRtaXNjID0gcmVxdWlyZSgnLi9taXNjJyksXG5cdEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcixcblx0Q29tbWFuZFBvb2wgPSByZXF1aXJlKCcuL2NvbW1hbmRwb29sJykuQ29tbWFuZFBvb2xcdFxuXHRTaWduYWxzID0gcmVxdWlyZSgnLi9jb21tYW5kJykuU2lnbmFscztcblxuLy8gQ3JlYXRlIGEgbmV3IEdvLW9iamVjdCBmb3IgdGhlIHNwZWNpZmllZCAuZ28tZmlsZS5cbi8vIFdpbGwgYWxzbyBpbnRpYWxpemUgR28tb2JqZWN0IGlmIHNlY29uZCBwYXJhbWV0ZXIgaXMgdHJ1ZS5cbi8vXG4vLyBUaHJvd3MgZXJyb3IgaWYgbm8gcGF0aCBwcm92aWRlZCB0byAuZ28tZmlsZS5cbnV0aWwuaW5oZXJpdHMoR28sIEV2ZW50RW1pdHRlcik7XG5leHBvcnRzLkdvID0gR287XG5mdW5jdGlvbiBHbyhvcHRpb25zLCBjYWxsYmFjaykge1xuXHRpZihvcHRpb25zID09PSB1bmRlZmluZWQgfHwgb3B0aW9ucyA9PT0gbnVsbCkge1xuXHRcdG1pc2MucmFpc2VFcnJvcignTm8gb3B0aW9ucyBwcm92aWRlZC4nKVxuXHR9XG5cdGlmKG9wdGlvbnMucGF0aCA9PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5wYXRoID09IG51bGwpIHtcblx0XHRtaXNjLnJhaXNlRXJyb3IoJ05vIHBhdGggcHJvdmlkZWQgdG8gLmdvLWZpbGUuJyk7XG5cdH1cblxuXHRtaXNjLm1lcmdlRGVmYXVsdE9wdGlvbnMob3B0aW9ucywge1xuXHRcdG1heENvbW1hbmRzUnVubmluZzogMTAsXG5cdFx0ZGVmYXVsdENvbW1hbmRUaW1lb3V0U2VjOiA1LFxuXHRcdGN3ZDogcHJvY2Vzcy5jd2QoKSxcblx0fSk7XG5cdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0dGhpcy5nb0ZpbGUgPSBvcHRpb25zLnBhdGg7XG5cdHRoaXMucHJvYyA9IG51bGw7XG5cdHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTsgLy8gdHJ1ZSB3aGVuIEdvIGhhcyBiZWVuIGluaXRpYWxpemVkLCBiYWNrIHRvIGZhbHNlIHdoZW4gR28gY2xvc2VzXG5cdHRoaXMuY2xvc2VQZW5kaW5nID0gZmFsc2U7IC8vIHRydWUgd2hlbiBjbG9zZSgpIGhhcyBiZWVuIGNhbGxlZCBhbmQgbm8gbW9yZSBjb21tYW5kcyBzaG91bGQgYmUgcGxhbm5lZFxuXHR0aGlzLnRlcm1pbmF0ZVBlbmRpbmcgPSBmYWxzZTsgLy8gdHJ1ZSB3aGVuIHRlcm1pbmF0ZSgpIGhhcyBiZWVuIGNhbGxlZFxuXHR0aGlzLmNvbW1hbmRQb29sID0gbmV3IENvbW1hbmRQb29sKHRoaXMpXG5cblx0aWYob3B0aW9ucy5pbml0QXRPbmNlKSB7XG5cdFx0dGhpcy5pbml0KGNhbGxiYWNrKTtcblx0fVxufVxuXG4vLyBJbml0aWFsaXplIGJ5IGxhdW5jaGluZyBnbyBwcm9jZXNzIGFuZCBwcmVwYXJlIGZvciBjb21tYW5kcy5cbi8vIERvIGFzIGVhcmx5IGFzIHBvc3NpYmxlIHRvIGF2b2lkIGRlbGF5IHdoZW4gZXhlY3V0aW5nIGZpcnN0IGNvbW1hbmQuXG4vL1xuLy8gY2FsbGJhY2sgaGFzIHBhcmFtZXRlcnMgKGVycilcbkdvLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcdFx0XG5cdHZhciBzZWxmID0gdGhpcztcblx0ZnMuZXhpc3RzKHRoaXMuZ29GaWxlLCBmdW5jdGlvbihleGlzdHMpIHtcblx0XHRpZighZXhpc3RzKSB7XHRcblx0XHRcdG1pc2MuY2FsbGJhY2tJZkF2YWlsYWJsZShjYWxsYmFjaywgbWlzYy5nZXRFcnJvcignLmdvLWZpbGUgbm90IGZvdW5kIGZvciBnaXZlbiBwYXRoLicpKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBzaW1wbGUgZXh0ZW5zaW9uIGNoZWNrIHRvIGRldGVjdCBpZiBpdHMgYSB1biBjb21waWxlcyAuZ28gZmlsZVxuXHRcdGlmIChzZWxmLmdvRmlsZS5zbGljZSgtMykudG9Mb3dlckNhc2UoKSA9PT0gJy5nbycpIHtcblx0XHRcdC8vIFNwYXduIGdvIHByb2Nlc3Mgd2l0aGluIGN1cnJlbnQgd29ya2luZyBkaXJlY3Rvcnlcblx0XHRcdHNlbGYucHJvYyA9IHNwYXduKCdnbycsIFsncnVuJywgc2VsZi5nb0ZpbGVdLCB7IGN3ZDogc2VsZi5vcHRpb25zLmN3ZCwgZW52OiBwcm9jZXNzLmVudiB9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gU3Bhd24gZ28gY29tcGlsZWQgZmlsZVxuXHRcdFx0c2VsZi5wcm9jID0gc3Bhd24oIHNlbGYuZ29GaWxlLCBbXSwgeyBjd2Q6IHNlbGYub3B0aW9ucy5jd2QsIGVudjogcHJvY2Vzcy5lbnYgfSk7XG5cdFx0fVxuXG5cblx0XHQvLyBTZXR1cCBoYW5kbGVyc1xuXHRcdHNlbGYucHJvYy5zdGRvdXQub24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKXtcblx0XHRcdGhhbmRsZVN0ZG91dChzZWxmLCBkYXRhKTtcblx0XHR9KTtcblx0XHRzZWxmLnByb2Muc3RkZXJyLm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRoYW5kbGVFcnIoc2VsZiwgZGF0YSwgZmFsc2UpO1xuXHRcdH0pO1xuXHRcdHNlbGYucHJvYy5vbignY2xvc2UnLCBmdW5jdGlvbigpe1xuXHRcdFx0aGFuZGxlQ2xvc2Uoc2VsZik7XG5cdFx0fSk7XHRcdFxuXG5cdFx0Ly8gSW5pdCBjb21wbGV0ZVxuXHRcdHNlbGYuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdG1pc2MuY2FsbGJhY2tJZkF2YWlsYWJsZShjYWxsYmFjaywgbnVsbCk7XG5cdH0pO1xufVxuXG4vLyBHcmFjZWZ1bGx5IGNsb3NlIEdvIGJ5IHNlbmRpbmcgdGVybWluYXRpb24gc2lnbmFsIGFmdGVyIGFsbCBleGVjdXRpbmcgY29tbWFuZHNcbi8vIGhhcyBlbmRlZCB0aGVpciBleGVjdXRpb24uXG4vLyBSZXR1cm5zIHRydWUgaWYgY2xvc2UgaGFzIGJlZW4gc3RhcnRlZCwgb3IgZmFsc2UgaWYgR28gaXMgbm90IGluaXRpYWxpemVkIG9yIGlmIGl0XG4vLyBhbHJlYWR5IGhhcyBhIGNsb3NlIHBlbmRpbmcuXG5Hby5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0aWYodGhpcy5pbml0aWFsaXplZCAmJiAhdGhpcy5jbG9zZVBlbmRpbmcgJiYgIXRoaXMudGVybWluYXRlUGVuZGluZykge1xuXHRcdHRoaXMuY2xvc2VQZW5kaW5nID0gdHJ1ZTtcblx0XHQvLyBTZW5kIHByaW9yaXRpemVkIHRlcm1pbmF0aW9uIHNpZ25hbFxuXHRcdHRoaXMuY29tbWFuZFBvb2wucGxhbk9uSWRsZShTaWduYWxzLlRlcm1pbmF0aW9uLCB0cnVlKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG4vLyBIYXJkIHRlcm1pbmF0ZSBieSBzZW5kaW5nIHRlcm1pbmF0aW9uIG9uIGFsbCBjb21tYW5kcyBhbmQgdGVybWluYXRpb24gc2lnbmFsIHRvIEdvXG4vLyBSZXR1cm5zIHRydWUgaWYgdGVybWluYXRpb24gaGFzIGJlZW4gc3RhcnRlZCwgb3IgZmFsc2UgaWYgR28gaXMgbm90IGluaXRpYWxpemVkIG9yIGlmIGl0XG4vLyBhbHJlYWR5IGhhcyBhIHRlcm1pbmF0aW9uIHBlbmRpbmcuXG5Hby5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0ZXJtaW5hdGUodGhpcywgdHJ1ZSk7XG59XG5cbi8vIENyZWF0ZSBhbmQgZXhlY3V0ZSBvciBxdWV1ZSBhIGNvbW1hbmQgb2YgSlNPTiBkYXRhXG4vLyBXaWxsIG5vdCBxdWV1ZSBjb21tYW5kIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBoYXMgYmVlbiBjbG9zZWQgKG9yIGNsb3NlIHBlbmRpbmcpXG4vLyBUYWtlcyBwYXJhbWV0ZXJzOlxuLy8gXHRcdGRhdGEgKHJlcXVpcmVkKSAtIGFjdHVhbCBjb21tYW5kIEpTT05cbi8vXHRcdGNhbGxiYWNrIChyZXF1aXJlZCkgLSB0aGUgY2FsbGJhY2sgdG8gY2FsbCB3aXRoIHBvc3NpYmxlIHJlc3VsdCB3aGVuIGV4ZWN1dGlvbiBlbmRzXG4vL1x0XHRvcHRpb25zIChvcHRpb25hbCkgLSBvdmVycmlkZXMgZGVmYXVsdCBleGVjdXRpb24gb3B0aW9uc1xuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjb21tYW5kIHdhcyBwbGFubmVkIGZvciBleGVjdXRpb24sIG90aGVyd2lzZSBmYWxzZS5cbkdvLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpIHtcdFxuXHRpZih0aGlzLmluaXRpYWxpemVkICYmICF0aGlzLmNsb3NlUGVuZGluZyAmJiAhdGhpcy50ZXJtaW5hdGVQZW5kaW5nKSB7XG5cdFx0Ly8gSW1wb3J0YW50IHRvIG5vdCBsZWF2ZSBnbyBpbiBhbiBpbmZpbml0ZSBsb29wIGVhdGlnIGNwdVxuXHRcdHRyeSB7IC8vIENvbnRhaW4gb3V0ZXIgZXhjZXB0aW9ucyBhbmQgY2xvc2UgZ28gYmVmb3JlIHJldGhyb3dpbmcgZXhjZXB0aW9uLlxuXHRcdFx0dGhpcy5jb21tYW5kUG9vbC5wbGFuRXhlY3V0aW9uKHRoaXMuY29tbWFuZFBvb2wuY3JlYXRlQ29tbWFuZChkYXRhLCBjYWxsYmFjayksIGZhbHNlLCBvcHRpb25zKTtcdFxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGhhbmRsZUVycih0aGlzLCBlLCBmYWxzZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlOyAvLyBSZXR1cm4gdHJ1ZSBzaW5jZSB0aGUgY29tbWFuZCBoYXMgYmVlbiBwbGFubmVkIGZvciBleGVjdXRpb25cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7IC8vIFRoZSBjb21tYW5kIHdhc24ndCBwbGFubmVkIGZvciBleGVjdXRpb24sIHJldHVybiBmYWxzZVxuXHR9XG59XG5cbi8vIHJlc2V0IHRoZSBidWZmZXJEYXRhIHdpdGggYW4gZW1wdHkgc3RyaW5nXG52YXIgYnVmZmVyRGF0YSA9IFwiXCI7XG5cbi8vIFJlY2VpdmUgZGF0YSBmcm9tIGdvLW1vZHVsZVxuZnVuY3Rpb24gaGFuZGxlU3Rkb3V0KGdvLCBkYXRhKSB7XG5cblx0Ly8gYXBwZW5kIGRhdGEgdG8gdGhlIGJ1ZmZlciBmb3IgZXZlcnkgc3Rkb3V0XG4gICAgYnVmZmVyRGF0YSArPSBkYXRhLnRvU3RyaW5nKCk7XG5cbiAgICAvLyBpZiByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIG1lc3NhZ2UgaW4gdGhlIHN0ZG91dCBwYXJzZSBpdFxuXHQvLyBhbmQgcmVzZXQgdGhlIGJ1ZmZlciBmb3IgdGhlIG5leHQgc3Rkb3V0XG4gICAgaWYgKGJ1ZmZlckRhdGEuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgICAgLy8gUmVzcG9uc2UgbWF5IGJlIHNldmVyYWwgY29tbWFuZCByZXNwb25zZXMgc2VwYXJhdGVkIGJ5IG5ldyBsaW5lc1xuICAgICAgICBidWZmZXJEYXRhLnRvU3RyaW5nKCkuc3BsaXQoXCJcXG5cIikuZm9yRWFjaChmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgICAvLyBEaXNjYXJkIGVtcHR5IGxpbmVzXG4gICAgICAgICAgICBpZihyZXNwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBlYWNoIGNvbW1hbmQgcmVzcG9uc2Ugd2l0aCBhIGV2ZW50LWxvb3AgaW4gYmV0d2VlbiB0byBhdm9pZCBibG9ja2luZ1xuICAgICAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKXtwYXJzZVJlc3BvbnNlKGdvLCByZXNwKX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnVmZmVyRGF0YSA9IFwiXCI7XG4gICAgfVxufVxuXG4vLyBQYXJzZSBhIF9zaW5nbGVfIGNvbW1hbmQgcmVzcG9uc2UgYXMgSlNPTiBhbmQgaGFuZGxlIGl0XG4vLyBJZiBwYXJzaW5nIGZhaWxzIGEgaW50ZXJuYWwgZXJyb3IgZXZlbnQgd2lsbCBiZSBlbWl0dGVkIHdpdGggdGhlIHJlc3BvbnNlIGRhdGFcbmZ1bmN0aW9uIHBhcnNlUmVzcG9uc2UoZ28sIHJlc3ApIHtcblx0dmFyIHBhcnNlZDtcblx0dHJ5IHtcblx0XHRwYXJzZWQgPSBKU09OLnBhcnNlKHJlc3ApO1xuXHR9IGNhdGNoIChlKSB7XHRcdFxuXHRcdGhhbmRsZUVycihnbywgcmVzcCwgdHJ1ZSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gSW1wb3J0YW50IHRvIG5vdCBsZWF2ZSBnbyBpbiBhbiBpbmZpbml0ZSBsb29wIGVhdGlnIGNwdVxuXHR0cnkgeyAvLyBDb250YWluIG91dGVyIGV4Y2VwdGlvbnMgYW5kIGNsb3NlIGdvIGJlZm9yZSByZXRocm93aW5nIGV4Y2VwdGlvbi5cblx0XHRnby5jb21tYW5kUG9vbC5oYW5kbGVSZXNwb25zZShwYXJzZWQpIC8vIEhhbmRsZSByZXNwb25zZSBvdXRzaWRlIHRocm93IHRvIGF2b2lkIGNhdGNoaW5nIHRob3NlIGV4Y2VwdGlvbnNcdFxuXHR9IGNhdGNoIChlKSB7XG5cdFx0aGFuZGxlRXJyKGdvLCBlLCBmYWxzZSk7XG5cdH1cdFxufVxuXG4vLyBFbWl0IGVycm9yIGV2ZW50IG9uIGdvIGluc3RhbmNlLCBwYXNzIHRocm91Z2ggcmF3IGVycm9yIGRhdGFcbi8vIEVycm9ycyBtYXkgZWl0aGVyIGJlIGludGVybmFsIHBhcnNlciBlcnJvcnMgb3IgZXh0ZXJuYWwgZXJyb3JzIHJlY2VpdmVkIGZyb20gc3RkZXJyXG5mdW5jdGlvbiBoYW5kbGVFcnIoZ28sIGRhdGEsIHBhcnNlcikge1x0XG5cdGlmKCFwYXJzZXIpIHsgLy8gSWYgZXh0ZXJuYWwgZXJyb3IsIHRlcm1pbmF0ZSBhbGwgY29tbWFuZHNcblx0XHR0ZXJtaW5hdGUoZ28sIGZhbHNlKTtcblx0fVxuXG5cdGlmKGdvLmxpc3RlbmVycygnZXJyb3InKS5sZW5ndGggPiAwKSB7IC8vIE9ubHkgZW1pdCBldmVudCBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzXG5cdFx0cHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcblx0XHRcdC8vIEVtaXQgYW55IGV2ZW50IG9uIG5leHQgdGlja1xuXHRcdFx0Z28uZW1pdCgnZXJyb3InLCB7cGFyc2VyOiBwYXJzZXIsIGRhdGE6IGRhdGF9KTtcblx0XHR9KTtcblx0fVx0XG59XG5cbi8vIEdvIHBhbmljIGFuZCBwcm9jZXNzIGVuZHMgY2F1c2VzIGNhbGxzIHRvIHRoaXNcbi8vIEVtaXQgY2xvc2UgZXZlbnQgb24gZ28gaW5zdGFuY2VcbmZ1bmN0aW9uIGhhbmRsZUNsb3NlKGdvKSB7XG5cdC8vIElmIHByb2Nlc3MgY2xvc2VzIHdlIHNldCBpbml0aWFsaXplZCB0byBmYWxzZSB0byBhdm9pZCBpbnZhbGlkIGNsb3NlKCkgb3IgZXhlY3V0ZSgpXHRcblx0Z28uaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0aWYoZ28ubGlzdGVuZXJzKCdjbG9zZScpLmxlbmd0aCA+IDApIHsgLy8gT25seSBlbWl0IGV2ZW50IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnNcblx0XHRnby5lbWl0KCdjbG9zZScpO1xuXHR9XHRcdFxufVxuXG4vLyBUZXJtaW5hdGUgYnkgc2VuZGluZyB0ZXJtaW5hdGlvbiBvbiBhbGwgY29tbWFuZHMuXG4vLyBJZiBjYWxsZWQgd2l0aCB0cnVlIGl0IHdpbGwgYWxzbyBkaXJlY3RseSB0cnkgdG8gc2VuZCBhIHRlcm1pbmF0aW9uIHNpZ25hbCB0byBnb1xuZnVuY3Rpb24gdGVybWluYXRlKGdvLCB3aXRoU2lnbmFsKSB7XG5cdGlmKGdvLmluaXRpYWxpemVkICYmICFnby50ZXJtaW5hdGVQZW5kaW5nKSB7XG5cdFx0Z28udGVybWluYXRlUGVuZGluZyA9IHRydWU7XG5cblx0XHQvLyBEbyB0aGUgYWN0dWFsIHRlcm1pbmF0aW9uIGFzeW5jaHJvbm91c2x5XG5cdFx0Ly8gQ2FsbGJhY2tzIHdpbGwgYmUgZWFjaCB0ZXJtaW5hdGVkIGNvbW1hbmQgb3Igbm90aGluZ1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKXtcblx0XHRcdC8vIFRlbGwgY29tbWFuZCBwb29sIHRvIGtpbGwgYWxsIGNvbW1hbmRzXG5cdFx0XHRnby5jb21tYW5kUG9vbC50ZXJtaW5hdGUoKTtcdFx0XHRcblxuXHRcdFx0Ly8gU2VuZCBzaWduYWwgYWZ0ZXIgY29tbWFuZCBwb29sIHRlcm1pbmF0aW9uLCBvdGhlcndpc2UgaXQgd291bGRcblx0XHRcdC8vIGJlIHJlbW92ZWQgYnkgdGVybWluYXRlKClcblx0XHRcdGlmKHdpdGhTaWduYWwpIHtcdFx0XHRcdFx0XG5cdFx0XHRcdGdvLmNvbW1hbmRQb29sLnBsYW5FeGVjdXRpb24oU2lnbmFscy5UZXJtaW5hdGlvbiwgdHJ1ZSk7XHRcdFx0XHRcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVx0XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEpvaG4gR3JhbnN0csO2bVxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBDb250YWlucyBnZW5lcmFsIGhlbHBlcnNcblxuLy8gSW52b2tlIGNhbGxiYWNrIGlmIG5vdCB1bmRlZmluZWQgd2l0aCBwcm92aWRlZCBwYXJhbWV0ZXJcbmV4cG9ydHMuY2FsbGJhY2tJZkF2YWlsYWJsZSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBwYXJhbSkge1xuXHRpZih0eXBlb2YgY2FsbGJhY2sgIT0gdW5kZWZpbmVkKSB7XG5cdFx0Y2FsbGJhY2socGFyYW0pO1xuXHR9XG59XG5cbmV4cG9ydHMucmFpc2VFcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdHRocm93IGdldEVycm9yKGVycm9yKTtcbn1cblxuZXhwb3J0cy5nZXRFcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdHJldHVybiBuZXcgRXJyb3IoJ2dvbm9kZTogJyArIGVycm9yKTtcbn1cblxuLy8gTWFrZSBzdXJlIG9wdGlvbnMgbm90IHByb3ZpZGVkIGFyZSBzZXQgdG8gZGVmYXVsdCB2YWx1ZXMgXG5leHBvcnRzLm1lcmdlRGVmYXVsdE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zLCBkZWZhdWx0cykge1xuXHRmb3IgKG9wdCBpbiBkZWZhdWx0cykge1xuXHRcdGlmKG9wdGlvbnNbb3B0XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvcHRpb25zW29wdF0gPSBkZWZhdWx0c1tvcHRdO1xuXHRcdH0gXG5cdH1cbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmV4cG9ydHMuUXVldWUgPSBRdWV1ZTtcbmZ1bmN0aW9uIFF1ZXVlKCkge1xuXHR0aGlzLmFyciA9IFtdO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUuZW5xdWV1ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0dGhpcy5hcnIucHVzaChlbGVtZW50KTtcbn1cblxuUXVldWUucHJvdG90eXBlLmRlcXVldWUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuYXJyLnNoaWZ0KCk7XG59XG5cblF1ZXVlLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuYXJyLmxlbmd0aDtcbn1cblxuUXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuZ2V0TGVuZ3RoKCkgPT09IDA7XG59XG5cblF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmFyci5sZW5ndGggPSAwO1xufSIsImltcG9ydCAqIGFzIFBhdGggZnJvbSBcInBhdGhcIjtcclxuXHJcbmltcG9ydCB7IGdldFBhdGgsIFNlYXJjaE9iamVjdCwgVHlwaWUsIFR5cGllUm93SXRlbSB9IGZyb20gXCIuL2luZGV4XCI7XHJcblxyXG5jb25zdCBkZWZhdWx0SWNvbiA9IFwicGtnLWljb24ucG5nXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdFR5cGllUGFja2FnZSB7XHJcbiAgICBwcm90ZWN0ZWQgcGFja2FnZURhdGE6IGFueTtcclxuICAgIHByb3RlY3RlZCBwYWNrYWdlTmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIGljb246IHN0cmluZztcclxuICAgIHByb3RlY3RlZCB0eXBpZTogVHlwaWU7XHJcbiAgICBwcm90ZWN0ZWQgcGtnQ29uZmlnOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgd2luOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgZGI6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBwYWNrYWdlczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdpbiwgY29uZmlnLCBwa2dOYW1lKSB7XHJcbiAgICAgICAgdGhpcy53aW4gPSB3aW47XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlRGF0YSA9IHtuYW1lOiBwa2dOYW1lLCBwYXRoOiBfX2Rpcm5hbWV9O1xyXG4gICAgICAgIHRoaXMucGFja2FnZU5hbWUgPSBwa2dOYW1lO1xyXG4gICAgICAgIHRoaXMuZGIgPSBwa2dOYW1lO1xyXG4gICAgICAgIHRoaXMucGtnQ29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIHRoaXMuaWNvbiA9IHRoaXMuZ2V0UGFja2FnZVBhdGgoKSArIGRlZmF1bHRJY29uO1xyXG4gICAgICAgIHRoaXMudHlwaWUgPSBuZXcgVHlwaWUodGhpcy5wYWNrYWdlTmFtZSk7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMubG9hZENvbmZpZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrYWdlTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrYWdlUGF0aCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBnZXRQYXRoKFwicGFja2FnZXMvXCIgKyB0aGlzLnBhY2thZ2VOYW1lICsgXCIvXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREZWZhdWx0SXRlbSh2YWx1ZSwgZGVzY3JpcHRpb24gPSBcIlwiLCBwYXRoID0gXCJcIiwgaWNvbiA9IFwiXCIpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBuZXcgVHlwaWVSb3dJdGVtKCk7XHJcbiAgICAgICAgaXRlbS5zZXRUaXRsZSh2YWx1ZSk7XHJcbiAgICAgICAgaXRlbS5zZXRQYXRoKHBhdGggPyBwYXRoIDogdmFsdWUpO1xyXG4gICAgICAgIGl0ZW0uc2V0SWNvbihpY29uID8gaWNvbiA6IHRoaXMuaWNvbik7XHJcbiAgICAgICAgaXRlbS5zZXREZXNjcmlwdGlvbihkZXNjcmlwdGlvbiA/IGRlc2NyaXB0aW9uIDogXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluc2VydCh2YWx1ZSwgZGVzY3JpcHRpb24gPSBcIlwiLCBwYXRoID0gXCJcIiwgaWNvbiA9IFwiXCIpIHtcclxuICAgICAgICB0aGlzLmluc2VydEl0ZW0odGhpcy5nZXREZWZhdWx0SXRlbSh2YWx1ZSwgZGVzY3JpcHRpb24sIHBhdGgsIGljb24pKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5zZXJ0SXRlbShpdGVtOiBUeXBpZVJvd0l0ZW0pIHtcclxuICAgICAgICB0aGlzLnR5cGllLmluc2VydChpdGVtKS5nbygpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gY29uc29sZS5sb2coZGF0YSkpXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2VhcmNoKG9iajogU2VhcmNoT2JqZWN0LCBjYWxsYmFjazogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLnR5cGllLmZ1enp5U2VhcmNoKG9iai52YWx1ZSkub3JkZXJCeShcInNjb3JlXCIpLmRlc2MoKS5nbygpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gY2FsbGJhY2soZGF0YSkpXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFjdGl2YXRlKHBrZ0xpc3Q6IHN0cmluZ1tdLCBpdGVtOiBUeXBpZVJvd0l0ZW0sIGNhbGxiYWNrOiAoZGF0YSkgPT4gdm9pZCkge1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbygnTm8gbyAgICAgIHZlcnJpZGUgXCJhY3RpdmF0ZVwiIG1ldGhvZCBmb3VuZCBpbiAnICsgdGhpcy5wYWNrYWdlTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVudGVyUGtnKHBrZ0xpc3Q6IHN0cmluZ1tdLCBpdGVtPzogVHlwaWVSb3dJdGVtLCBjYWxsYmFjaz86IChkYXRhKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5nZXRGaXJzdFJlY29yZHMoMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhcihwa2dMaXN0OiBzdHJpbmdbXSwgY2FsbGJhY2s6IChkYXRhKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5nZXRGaXJzdFJlY29yZHMoMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmUocGtnTGlzdDogc3RyaW5nW10sIGl0ZW06IFR5cGllUm93SXRlbSwgY2FsbGJhY2s6IChkYXRhKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgY29uc29sZS5pbmZvKCdObyBvdmVycmlkZSBcInJlbW92ZVwiIG1ldGhvZCBmb3VuZCBpbiAnICsgdGhpcy5wYWNrYWdlTmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEljb24oaWNvbikge1xyXG4gICAgICAgIHJldHVybiBQYXRoLmpvaW4odGhpcy5nZXRQYWNrYWdlUGF0aCgpLCBpY29uKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Rmlyc3RSZWNvcmRzKG51bU9mUmVjb3JkczogbnVtYmVyID0gMTApIHtcclxuICAgICAgICB0aGlzLnR5cGllLmdldFJvd3MobnVtT2ZSZWNvcmRzKS5vcmRlckJ5KFwiY291bnRcIikuZGVzYygpLmdvKClcclxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHRoaXMud2luLnNlbmQoXCJyZXN1bHRMaXN0XCIsIHJlcykpXHJcbiAgICAgICAgICAgIC5jYXRjaChlID0+IGNvbnNvbGUuZXJyb3IoXCJlcnJvciBnZXR0aW5nIGZpcnN0IHJlY29yZHNcIiwgZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkQ29uZmlnKCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiTm8gb3ZlcnJpZGUgJ2xvYWRDb25maWcnIG1ldGhvZCBmb3VuZCBpbiBcIiArIHRoaXMucGFja2FnZU5hbWUpO1xyXG4gICAgICAgIGlmICh0aGlzLnBrZ0NvbmZpZy5zaG9ydGN1dCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlZ2lzdGVyaW5nIHNob3J0Y3V0IFwiICsgdGhpcy5wa2dDb25maWcuc2hvcnRjdXQgKyBcIiB0byBcIiArIHRoaXMuZ2V0UGFja2FnZU5hbWUoKSk7XHJcbiAgICAgICAgICAgIHRoaXMud2luLnJlZ2lzdGVyS2V5KHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndpbi5zZW5kKFwiY2hhbmdlUGFja2FnZVwiLCBbdGhpcy5nZXRQYWNrYWdlTmFtZSgpXSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImRlc3Ryb3lpbmcgdGhlIHBhY2thZ2UhXCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidW5yZWdpc3RlclwiLCB0aGlzLnBrZ0NvbmZpZyk7XHJcbiAgICAgICAgaWYgKHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMud2luLnVucmVnaXN0ZXJLZXkodGhpcy5wa2dDb25maWcuc2hvcnRjdXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwR2xvYmFsIHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldHRpbmdzOiBhbnk7XHJcbiAgICBwdWJsaWMgc3RhdGljIHN0YXJ0VGltZTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0VGltZVNpbmNlSW5pdCgpIHtcclxuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIEFwcEdsb2JhbC5zdGFydFRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRTZXR0aW5ncygpIHtcclxuICAgICAgICByZXR1cm4gQXBwR2xvYmFsLnNldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgc2V0KG5hbWU6IHN0cmluZywgb2JqOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBnbG9iYWxbbmFtZV0gPSBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQobmFtZTogc3RyaW5nKTogYW55IHtcclxuICAgICAgICByZXR1cm4gZ2xvYmFsW25hbWVdO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7R299IGZyb20gXCJnb25vZGVcIjtcclxuaW1wb3J0IFBhY2tldCBmcm9tIFwiLi9tb2RlbHMvUGFja2V0XCI7XHJcbi8vIGltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcclxuY29uc3QgYXBwR2xvYmFsOiBhbnkgPSBnbG9iYWw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb0Rpc3BhdGNoZXIge1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ286IGFueTtcclxuICAgIHB1YmxpYyBzdGF0aWMgbGlzdGVuaW5nOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZXhlY3V0YWJsZVBhdGg6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBpZUV4ZWN1dGFibGU6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU3RhcnRpbmcgVHlwaWUgU2VydmljZSBmb3IgdGhlIGZpcnN0IHRpbWVcIiwgdHlwaWVFeGVjdXRhYmxlKTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZXhlY3V0YWJsZVBhdGggPSB0eXBpZUV4ZWN1dGFibGU7XHJcbiAgICAgICAgdGhpcy5zdGFydFByb2Nlc3MoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2VuZChwYWNrZXQ6IFBhY2tldCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJzZW5kIHBhY2tldFwiLCBwYWNrZXQpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIEdvRGlzcGF0Y2hlci5nby5leGVjdXRlKHBhY2tldCwgKHJlc3VsdDogYW55LCByZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdvdCBiYWNrXCIsIHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQub2spIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5kYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9zZSgpOiB2b2lkIHtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uY2xvc2UoKTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIubGlzdGVuaW5nID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFByb2Nlc3MoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJTdGFydGluZyBUeXBpZSBTZXJ2aWNlXCIsIEdvRGlzcGF0Y2hlci5leGVjdXRhYmxlUGF0aCk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IGZhbHNlO1xyXG4gICAgICAgIEdvRGlzcGF0Y2hlci5nbyA9IG5ldyBHbyh7XHJcbiAgICAgICAgICAgIGRlZmF1bHRDb21tYW5kVGltZW91dFNlYzogNjAsXHJcbiAgICAgICAgICAgIG1heENvbW1hbmRzUnVubmluZzogMTAsXHJcbiAgICAgICAgICAgIHBhdGg6IEdvRGlzcGF0Y2hlci5leGVjdXRhYmxlUGF0aCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uaW5pdCh0aGlzLnJlZ2lzdGVyKTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28ub24oXCJjbG9zZVwiLCAoKSA9PiB0aGlzLm9uQ2xvc2UoKSk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLm9uKFwiZXJyb3JcIiwgZXJyID0+IGNvbnNvbGUuZXJyb3IoXCJnbyBkaXNwYXRjaGVyIGhhZCBlcnJvclwiLCBlcnIpKTtcclxuICAgICAgICAvLyBzZXRUaW1lb3V0KCgpID0+IEdvRGlzcGF0Y2hlci5nby50ZXJtaW5hdGUoKSwgMTAwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25DbG9zZSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImdvIGRpc3BhdGNoZXIgd2FzIGNsb3NlZFwiKTtcclxuICAgICAgICBpZiAoR29EaXNwYXRjaGVyLmxpc3RlbmluZykge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0UHJvY2VzcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZ2lzdGVyKCk6IHZvaWQge1xyXG4gICAgICAgIEdvRGlzcGF0Y2hlci5nby5leGVjdXRlKFxyXG4gICAgICAgICAgICB7Y29tbWFuZDogXCJzdGFydFwifSwgKHJlc3VsdDogYW55LCByZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm9rKSB7ICAvLyBDaGVjayBpZiByZXNwb25zZSBpcyBva1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluIG91ciBjYXNlIHdlIGp1c3QgZWNobyB0aGUgY29tbWFuZCwgc28gd2UgY2FuIGdldCBvdXIgdGV4dCBiYWNrXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUeXBpZSByZXNwb25kZWQ6IFwiLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwR2xvYmFsLmNvcmVMb2dQYXRoID0gcmVzcG9uc2UubG9nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5lcnIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgR29EaXNwYXRjaGVyIGZyb20gXCIuL0dvRGlzcGF0Y2hlclwiO1xyXG5pbXBvcnQgUGFja2V0IGZyb20gXCIuL21vZGVscy9QYWNrZXRcIjtcclxuaW1wb3J0IFNlYXJjaFBheWxvYWQgZnJvbSBcIi4vbW9kZWxzL1NlYXJjaFBheWxvYWRcIjtcclxuaW1wb3J0IFR5cGllUm93SXRlbSBmcm9tIFwiLi9tb2RlbHMvVHlwaWVSb3dJdGVtXCI7XHJcblxyXG4vLyB0aGlzIGlzIGEgbGl0dGxlIGhhY2sgdG8gdXNlIHRoZSBnbG9iYWwgdmFyaWFibGUgaW4gVHlwZVNjcmlwdFxyXG4vLyBpdCBpcyB1c2VkIHRvIGdldCB0aGUgZ28gZGlzcGF0Y2hlciBmcm9tIHRoZSBtYWluIHByb2Nlc3Mgd2UgbmVlZCBpdCBhcyBhIHNpbmdsZXRvblxyXG5jb25zdCBnbG9iYWxBbnk6IGFueSA9IGdsb2JhbDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGllIHtcclxuICAgIHByaXZhdGUgc2VhcmNoOiBTZWFyY2hQYXlsb2FkID0gbmV3IFNlYXJjaFBheWxvYWQoKTtcclxuICAgIHByaXZhdGUgZGI6IHN0cmluZztcclxuICAgIHByaXZhdGUgcGFja2FnZU5hbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgY29tbWFuZDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBwYXlsb2FkOiBhbnk7XHJcbiAgICBwcml2YXRlIGdvRGlzcGF0Y2hlcjogR29EaXNwYXRjaGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBhY2thZ2VOYW1lOiBzdHJpbmcsIGRiPzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nb0Rpc3BhdGNoZXIgPSBnbG9iYWxBbnkuR29EaXNwYXRjaGVyO1xyXG4gICAgICAgIHRoaXMuZGIgPSBkYiA/IGRiIDogcGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlTmFtZSA9IHBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhc3RlVGV4dCgpIHtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcInBhc3RlVGV4dFwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHt9O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDb2xsZWN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiYWRkQ29sbGVjdGlvblwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHtuYW1lOiB0aGlzLnBhY2thZ2VOYW1lfTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlQ2FsbGVkKGl0ZW0pIHtcclxuICAgICAgICBpdGVtLmNvdW50VXAoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnNlcnQoaXRlbSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG11bHRpcGxlSW5zZXJ0KGl0ZW1MaXN0KSB7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJtdWx0aXBsZUluc2VydFwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IGl0ZW1MaXN0O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnNlcnQoaXRlbTogVHlwaWVSb3dJdGVtLCBwZXJzaXN0ID0gdHJ1ZSkge1xyXG4gICAgICAgIGl0ZW0uc2V0REIodGhpcy5kYik7XHJcbiAgICAgICAgaXRlbS5zZXRQYWNrYWdlKHRoaXMucGFja2FnZU5hbWUpO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IHBlcnNpc3QgPyBcImluc2VydFBlcnNpc3RcIiA6IFwiaW5zZXJ0XCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gaXRlbS50b1BheWxvYWQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0S2V5KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnBheWxvYWQudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnBheWxvYWQuZGIgPSB0aGlzLmRiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJnZXRLZXlcIjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RXhlY0xpc3QoKSB7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLmRiID0gdGhpcy5kYjtcclxuICAgICAgICB0aGlzLnBheWxvYWQucGFja2FnZU5hbWUgPSB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiZ2V0RXhlY0xpc3RcIjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZnV6enlTZWFyY2godmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gudHlwZSA9IFwiZnV6enlcIjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5kYiA9IHRoaXMuZGI7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gucGFja2FnZU5hbWUgPSB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwic2VhcmNoXCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gdGhpcy5zZWFyY2g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJvd3MobGltaXQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmxpbWl0ID0gbGltaXQ7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gudHlwZSA9IFwiZ2V0Um93c1wiO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmRiID0gdGhpcy5kYjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5wYWNrYWdlTmFtZSA9IHRoaXMucGFja2FnZU5hbWU7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJzZWFyY2hcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSB0aGlzLnNlYXJjaDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGtnKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMucGFja2FnZU5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXREQihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmRiID0gbmFtZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3JkZXJCeShmaWVsZDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2guZGlyZWN0aW9uID0gXCJhc2NcIjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5vcmRlckJ5ID0gZmllbGQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzYygpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaC5kaXJlY3Rpb24gPSBcImFzY1wiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXNjKCkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmRpcmVjdGlvbiA9IFwiZGVzY1wiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnbygpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdvRGlzcGF0Y2hlci5zZW5kKG5ldyBQYWNrZXQodGhpcy5jb21tYW5kLCB0aGlzLnBheWxvYWQpKTtcclxuICAgIH1cclxufVxyXG4iLCJcclxuaW1wb3J0IEFic3RyYWN0VHlwaWVQYWNrYWdlIGZyb20gXCIuL0Fic3RyYWN0VHlwaWVQYWNrYWdlXCI7XHJcbmltcG9ydCBBcHBHbG9iYWwgZnJvbSBcIi4vQXBwR2xvYmFsXCI7XHJcbmltcG9ydCBHb0Rpc3BhdGNoZXIgZnJvbSBcIi4vR29EaXNwYXRjaGVyXCI7XHJcbmltcG9ydCBTZWFyY2hPYmplY3QgZnJvbSBcIi4vbW9kZWxzL1NlYXJjaE9iamVjdFwiO1xyXG5pbXBvcnQgVHlwaWVSb3dJdGVtIGZyb20gXCIuL21vZGVscy9UeXBpZVJvd0l0ZW1cIjtcclxuaW1wb3J0IFR5cGllIGZyb20gXCIuL1R5cGllXCI7XHJcblxyXG5leHBvcnQge1xyXG4gICAgQWJzdHJhY3RUeXBpZVBhY2thZ2UsXHJcbiAgICBBcHBHbG9iYWwsXHJcbiAgICBnZXRQYXRoLFxyXG4gICAgR29EaXNwYXRjaGVyLFxyXG4gICAgVHlwaWUsXHJcbiAgICBUeXBpZVJvd0l0ZW0sXHJcbiAgICBTZWFyY2hPYmplY3QsXHJcbn07XHJcblxyXG5pbXBvcnQgKiBhcyBpc0RldiBmcm9tIFwiZWxlY3Ryb24taXMtZGV2XCI7XHJcbmNvbnN0IGdldFBhdGggPSAoc3RhdGljUGF0aCkgPT4ge1xyXG4gICAgaWYgKCFpc0Rldikge1xyXG4gICAgICAgIHJldHVybiBcIi4uL3N0YXRpYy9cIiArIHN0YXRpY1BhdGg7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBzdGF0aWNQYXRoO1xyXG4gICAgfVxyXG59O1xyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFja2V0IHtcclxuICAgIHByaXZhdGUgY29tbWFuZCA9IFwiXCI7XHJcbiAgICBwcml2YXRlIHBheWxvYWQ6IG9iamVjdCA9IHt9O1xyXG4gICAgY29uc3RydWN0b3IoY29tbWFuZDogc3RyaW5nLCBwYXlsb2FkPzogb2JqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkID8gcGF5bG9hZCA6IHt9O1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaE9iamVjdCB7XHJcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBwa2dMaXN0OiBzdHJpbmdbXTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMucGtnTGlzdCA9IFtdO1xyXG4gICAgfVxyXG59XHJcbiIsIlxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWFyY2hQYXlsb2FkIHtcclxuICAgIHB1YmxpYyB0eXBlOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgbGltaXQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyB2YWx1ZTogc3RyaW5nO1xyXG4gICAgcHVibGljIG9yZGVyQnk6IHN0cmluZztcclxuICAgIHB1YmxpYyBkaXJlY3Rpb246IHN0cmluZztcclxuICAgIHB1YmxpYyBwYWNrYWdlTmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGRiOiBzdHJpbmc7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcImZ1enp5XCI7ICAvLyBjYW4gYmUgJ2Z1enp5JyB8ICcnIHxcclxuICAgICAgICB0aGlzLmxpbWl0ID0gMTA7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFwiXCI7ICAgICAgICAgLy8gdGhlIGFjdHVhbCBzZWFyY2ggdmFsdVxyXG4gICAgICAgIHRoaXMub3JkZXJCeSA9IFwic2NvcmVcIjsgIC8vIHRoZSBuYW1lIG9mIHRoZSBmaWVsZCB0byBiZSBvcmRlcmVkIGJ5XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBcImRlc2NcIjtcclxuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gXCJcIjtcclxuICAgICAgICB0aGlzLmRiID0gXCJcIjtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge0lBY3Rpb259IGZyb20gXCIuL0lBY3Rpb25cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGllUm93SXRlbSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGF0YSk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBUeXBpZVJvd0l0ZW0oKTtcclxuICAgICAgICBpdGVtLnNldERCKGRhdGEuZGIgPyBkYXRhLmRiIDogXCJnbG9iYWxcIik7XHJcbiAgICAgICAgaXRlbS5zZXRQYWNrYWdlKGRhdGEudCk7XHJcbiAgICAgICAgaXRlbS5zZXRBY3Rpb25zKGRhdGEuYSk7XHJcbiAgICAgICAgaXRlbS5zZXRUaXRsZShkYXRhLnRpdGxlKTtcclxuICAgICAgICBpdGVtLnNldFBhdGgoZGF0YS5wKTtcclxuICAgICAgICBpdGVtLnNldERlc2NyaXB0aW9uKGRhdGEuZCk7XHJcbiAgICAgICAgaXRlbS5zZXRJY29uKGRhdGEuaSk7XHJcbiAgICAgICAgaXRlbS5zZXRDb3VudChkYXRhLmMpO1xyXG4gICAgICAgIGl0ZW0uc2V0U2NvcmUoZGF0YS5zY29yZSk7XHJcbiAgICAgICAgaXRlbS5zZXRVbml4dGltZShkYXRhLnUpO1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaXNQYWNrYWdlKGl0ZW06IFR5cGllUm93SXRlbSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBpdGVtLmQgPT09IFwiUGFja2FnZVwiXHJcbiAgICAgICAgICAgIHx8IGl0ZW0uZCA9PT0gXCJTdWJQYWNrYWdlXCJcclxuICAgICAgICAgICAgfHwgaXRlbS5wID09PSBcIlBhY2thZ2VcIlxyXG4gICAgICAgICAgICB8fCBpdGVtLnAuc3RhcnRzV2l0aChcIlN1YlBhY2thZ2V8XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkYjogc3RyaW5nO1xyXG4gICAgcHVibGljIGQ6IHN0cmluZztcclxuICAgIHB1YmxpYyBpOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdDogc3RyaW5nO1xyXG4gICAgcHVibGljIHA6IHN0cmluZztcclxuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGM6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgYT86IElBY3Rpb25bXTtcclxuICAgIHB1YmxpYyBzY29yZT86IG51bWJlcjtcclxuICAgIHB1YmxpYyB1PzogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpdGxlPzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5kYiA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5kID0gXCJcIjtcclxuICAgICAgICB0aGlzLmkgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5wID0gXCJcIjtcclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGUgPyB0aXRsZSA6IFwiXCI7XHJcbiAgICAgICAgdGhpcy5jID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0VGl0bGUodmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRUaXRsZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRpdGxlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRBY3Rpb25zKGFjdGlvbkxpc3Q6IElBY3Rpb25bXSk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5hID0gYWN0aW9uTGlzdDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QWN0aW9ucygpOiBJQWN0aW9uW10gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBhdGgodmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5wID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhdGgoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXREQih2YWx1ZTogc3RyaW5nKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLmRiID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldERCKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuZCA9IHZhbHVlID8gdmFsdWUgOiBcIlwiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREZXNjcmlwdGlvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldEljb24odmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5pID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEljb24oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQYWNrYWdlKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMudCA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrYWdlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0Q291bnQodmFsdWU6IG51bWJlcik6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5jID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY291bnRVcCgpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuYyA9IHRoaXMuYyArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFVuaXh0aW1lKHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLnUgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VW5peHRpbWUoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRTY29yZSh2YWx1ZTogbnVtYmVyIHwgdW5kZWZpbmVkKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLnNjb3JlID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFNjb3JlKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NvcmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvUGF5bG9hZCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhOiB0aGlzLmdldEFjdGlvbnMoKSxcclxuICAgICAgICAgICAgYzogdGhpcy5nZXRDb3VudCgpLFxyXG4gICAgICAgICAgICBkOiB0aGlzLmdldERlc2NyaXB0aW9uKCksXHJcbiAgICAgICAgICAgIGRiOiB0aGlzLmdldERCKCksXHJcbiAgICAgICAgICAgIGk6IHRoaXMuZ2V0SWNvbigpLFxyXG4gICAgICAgICAgICBwOiB0aGlzLmdldFBhdGgoKSxcclxuICAgICAgICAgICAgdDogdGhpcy5nZXRQYWNrYWdlKCksXHJcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLmdldFRpdGxlKCksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==