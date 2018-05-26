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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90eXBpZS1zZGsvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL3R5cGllLXNkay93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24taXMtZGV2L2luZGV4LmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy9nb25vZGUvbGliL2NvbW1hbmQuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvY29tbWFuZHBvb2wuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvZ29ub2RlLmpzIiwid2VicGFjazovL3R5cGllLXNkay8uL25vZGVfbW9kdWxlcy9nb25vZGUvbGliL21pc2MuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vbm9kZV9tb2R1bGVzL2dvbm9kZS9saWIvcXVldWUuanMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL0Fic3RyYWN0VHlwaWVQYWNrYWdlLnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9BcHBHbG9iYWwudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL0dvRGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvVHlwaWUudHMiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvUGFja2V0LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvU2VhcmNoT2JqZWN0LnRzIiwid2VicGFjazovL3R5cGllLXNkay8uL3NyYy9tb2RlbHMvU2VhcmNoUGF5bG9hZC50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvLi9zcmMvbW9kZWxzL1R5cGllUm93SXRlbS50cyIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJjaGlsZF9wcm9jZXNzXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly90eXBpZS1zZGsvZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vdHlwaWUtc2RrL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUN6RUE7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFO0FBQ0E7O0FBRUE7QUFDQTtB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ckMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPO1lBQ0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDcEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDeEIsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDaEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbkIsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7U0FDekIsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQW5LRCwrQkFtS0M7Ozs7Ozs7Ozs7OztBQ3RLRCwwQzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSwrQjs7Ozs7Ozs7Ozs7QUNBQSxpQzs7Ozs7Ozs7Ozs7QUNBQSxpQyIsImZpbGUiOiIuL2Rpc3QvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcInR5cGllLXNka1wiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJ0eXBpZS1zZGtcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1widHlwaWUtc2RrXCJdID0gZmFjdG9yeSgpO1xufSkoZ2xvYmFsLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIHdhc20gbW9kdWxlc1xuIFx0dmFyIGluc3RhbGxlZFdhc21Nb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBvYmplY3Qgd2l0aCBhbGwgY29tcGlsZWQgV2ViQXNzZW1ibHkuTW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy53ID0ge307XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgZ2V0RnJvbUVudiA9IHBhcnNlSW50KHByb2Nlc3MuZW52LkVMRUNUUk9OX0lTX0RFViwgMTApID09PSAxO1xuY29uc3QgaXNFbnZTZXQgPSAnRUxFQ1RST05fSVNfREVWJyBpbiBwcm9jZXNzLmVudjtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0VudlNldCA/IGdldEZyb21FbnYgOiAocHJvY2Vzcy5kZWZhdWx0QXBwIHx8IC9ub2RlX21vZHVsZXNbXFxcXC9dZWxlY3Ryb25bXFxcXC9dLy50ZXN0KHByb2Nlc3MuZXhlY1BhdGgpKTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gQ29tbWFuZHMgbXVzdCBiZSBleGVjdXRlZCB3aXRoaW4gYSBjb21tYW5kIHBvb2wgdG8gbGltaXQgZXhlY3V0aW9uIGNvdW50IGFuZCB0aW1lLlxuXG52YXIgbWlzYyA9IHJlcXVpcmUoJy4vbWlzYycpO1xuXG4vLyBDcmVhdGUgYSBjb21tYW5kIG9iamVjdCB3aXRoIGlkLCBjb21tYW5kLCBjYWxsYmFjayBhbmQgb3B0aW9uYWxseSBzaWduYWxcbmV4cG9ydHMuQ29tbWFuZCA9IENvbW1hbmQ7XG5mdW5jdGlvbiBDb21tYW5kKGlkLCBjbWQsIGNhbGxiYWNrLCBzaWduYWwpIHtcblx0Ly8gQ29udGFpbiBjb21tb24gZGF0YSB0byBiZSBzaGFyZWQgd2l0aCBnby1tb2R1bGUgaW4gLmNvbW1vblxuXHR0aGlzLmNvbW1vbiA9IHtcblx0XHRpZDogaWQsXG5cdFx0Y21kOiBjbWQsXG5cdFx0c2lnbmFsOiBzaWduYWwgPT09IHVuZGVmaW5lZCA/IC0xOiBzaWduYWwsIC8vIC0xIGlzIG5vIHNpZ25hbFxuXHR9XG5cdC8vIENvbnRhaW4gaW50ZXJuYWwgZGF0YSBub3QgdG8gYmUgc2VudCBvdmVyIHRoZSBpbnRlcmZhY2UgaW4gLmludGVybmFsXG5cdHRoaXMuaW50ZXJuYWwgPSB7XG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdGV4ZWN1dGlvblN0YXJ0ZWQ6IGZhbHNlLFxuXHRcdGV4ZWN1dGlvbkVuZGVkOiBmYWxzZSxcblx0fVx0XG59XG5cbi8vIENhbGwgdG8gc2V0IHRoZSBleGVjdXRpb24gb3B0aW9ucyBmb3IgdGhpcyBjb21tYW5kLlxuLy8gRGVmYXVsdCBvcHRpb25zIHdpbGwgYmUgYWRkZWQgZm9yIHRob3NlIG5vdCBwcm92aWRlZFxuQ29tbWFuZC5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKHBvb2wsIG9wdGlvbnMpIHtcblx0dGhpcy5pbnRlcm5hbC5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0bWlzYy5tZXJnZURlZmF1bHRPcHRpb25zKHRoaXMuaW50ZXJuYWwub3B0aW9ucywge1xuXHRcdGNvbW1hbmRUaW1lb3V0U2VjOiBwb29sLmdvLm9wdGlvbnMuZGVmYXVsdENvbW1hbmRUaW1lb3V0U2VjLFxuXHR9KTtcbn1cblxuLy8gRXhlY3V0ZSBjb21tYW5kIGJ5IHNlbmRpbmcgaXQgdG8gZ28tbW9kdWxlXG5Db21tYW5kLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24ocG9vbCwgb3B0aW9ucykge1xuXHRleGVjdXRpb25TdGFydGVkKHBvb2wsIHRoaXMpO1xuXG5cdC8vIFNlbmQgY29tbW9uIGRhdGEgdG8gZ28tbW9kdWxlXG5cdHBvb2wuZ28ucHJvYy5zdGRpbi53cml0ZShKU09OLnN0cmluZ2lmeSh0aGlzLmNvbW1vbikgKyAnXFxuJyk7IC8vIFdyaXRlIFxcbiB0byBmbHVzaCB3cml0ZSBidWZmZXJcdFxuXG59XG5cbi8vIEhhbmRsZSBjb21tYW5kIHJlc3BvbnNlIGFuZCBpbnZva2UgY2FsbGJhY2tcbkNvbW1hbmQucHJvdG90eXBlLnJlc3BvbnNlID0gZnVuY3Rpb24ocG9vbCwgcmVzcG9uc2VEYXRhKSB7XG5cdGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgdGhpcywgcmVzcG9uc2VEYXRhLCB7b2s6IHRydWV9KTtcdFx0XG59XG5cbi8vIENhbGwgaWYgY29tbWFuZCByZWFjaGVzIHRpbWVvdXQsIGVuZHMgZXhlY3V0aW9uIHdpdGggdGltZW91dCBhcyByZXN1bHRcbkNvbW1hbmQucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihwb29sKSB7XG5cdGV4ZWN1dGlvblN0b3BwZWQocG9vbCwgdGhpcywgbnVsbCwge3RpbWVvdXQ6IHRydWV9KTtcbn1cblxuLy8gQ2FsbCBpZiBjb21tYW5kIGlzIHRvIGJlIHRlcm1pbmF0ZWQsIGVuZHMgZXhlY3V0aW9uIHdpdGggdGVybWluYXRlZCBhcyByZXN1bHRcbkNvbW1hbmQucHJvdG90eXBlLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uKHBvb2wpIHtcblx0ZXhlY3V0aW9uU3RvcHBlZChwb29sLCB0aGlzLCBudWxsLCB7dGVybWluYXRlZDogdHJ1ZX0pO1xufVxuXG4vLyBDYWxsIGVhY2ggdGltZSB0aGUgY29tbWFuZCBpcyB0byBiZSBleGVjdXRlZCB0byB1cGRhdGUgc3RhdHVzXG4vLyBIYW5kbGVzIHRoZSBzdGF0ZSBvZiB0aGUgY29tbWFuZCBhcyB3ZWxsIGFzIHRoZSBjb250YWluaW5nIHBvb2wuXG5mdW5jdGlvbiBleGVjdXRpb25TdGFydGVkKHBvb2wsIGNtZCkge1xuXHRjbWQuaW50ZXJuYWwuZXhlY3V0aW9uU3RhcnRlZCA9IHRydWU7XHRcblxuXHRwb29sLnJ1bm5pbmdDb21tYW5kcysrO1xuXHRwb29sLmhhc0NvbW1hbmRzUnVubmluZyA9IHRydWU7XG5cblx0Ly8gQWRkIGV4ZWN1dGluZyBjb21tYW5kIHRvIG1hcFxuXHRwb29sLmNvbW1hbmRNYXBbY21kLmNvbW1vbi5pZF0gPSBjbWQ7XG5cblx0Ly8gT25seSB0aW1lb3V0IG5vbi1zaWduYWwgY29tbWFuZHNcblx0aWYoY21kLmNvbW1vbi5zaWduYWwgPT09IC0xKSB7XG5cdFx0ZW5nYWdlVGltZW91dChwb29sLCBjbWQpO1xuXHR9IFxufVxuXG4vLyBDYWxsIGVhY2ggdGltZSB0aGUgY29tbWFuZCBoYXMgYmVlbiByZWNlaXZlZC90aW1lZCBvdXQvYWJvcnRlZCAoc3RvcHBlZCBleGVjdXRpb24pIHRvIHVwZGF0ZSBwb29sIHN0YXR1c1xuLy8gSGFuZGxlcyB0aGUgc3RhdGUgb2YgdGhlIGNvbW1hbmQgYXMgd2VsbCBhcyB0aGUgY29udGFpbmluZyBwb29sLlxuZnVuY3Rpb24gZXhlY3V0aW9uU3RvcHBlZChwb29sLCBjbWQsIHJlc3BvbnNlRGF0YSwgcmVzdWx0KSB7XG5cdGlmKCFyZXN1bHQudGltZW91dCkge1xuXHRcdGNsZWFyVGltZW91dChjbWQuaW50ZXJuYWwudGltZW91dCk7IC8vIFN0b3AgdGltZW91dCB0aW1lclxuXHR9XHRcblx0Y21kLmludGVybmFsLmV4ZWN1dGlvbkVuZGVkID0gdHJ1ZTtcblxuXHRwb29sLnJ1bm5pbmdDb21tYW5kcy0tO1xuXHRpZihwb29sLnJ1bm5pbmdDb21tYW5kcyA8PSAwKSB7XG5cdFx0cG9vbC5ydW5uaW5nQ29tbWFuZHMgPSAwOyAvLyBUbyBiZSBzYWZlXG5cdFx0cG9vbC5oYXNDb21tYW5kc1J1bm5pbmcgPSBmYWxzZTtcblx0XHRwb29sLmVudGVyZWRJZGxlKCk7IC8vIFBvb2wgaXMgbm93IGlkbGVcblx0fVxuXG5cdC8vIFNpbmNlIGNvbW1hbmQgaXMgbm93IGRvbmUgd2UgZGVsZXRlIGl0IGZyb20gdGhlIGNvbW1hbmRNYXBcdFxuXHRkZWxldGUgcG9vbC5jb21tYW5kTWFwW2NtZC5jb21tb24uaWRdO1xuXHRwb29sLndvcmtRdWV1ZSgpOyAvLyBXaWxsIGJlIGFkZGVkIHRvIGV2ZW50IGxvb3BcblxuXHQvLyBJbnZva2UgY2FsbGJhY2sgbGFzdFxuXHRpZihjbWQuaW50ZXJuYWwuY2FsbGJhY2sgIT09IHVuZGVmaW5lZCAmJiBjbWQuaW50ZXJuYWwuY2FsbGJhY2sgIT09IG51bGwpIHtcblx0XHR2YXIgcmVzcG9uc2VSZXN1bHQgPSB7XG5cdFx0XHRvazogcmVzdWx0Lm9rID09PSB0cnVlLFxuXHRcdFx0dGltZW91dDogcmVzdWx0LnRpbWVvdXQgPT09IHRydWUsXG5cdFx0XHR0ZXJtaW5hdGVkOiByZXN1bHQudGVybWluYXRlZCA9PT0gdHJ1ZSxcblx0XHR9XG5cdFx0Y21kLmludGVybmFsLmNhbGxiYWNrKHJlc3BvbnNlUmVzdWx0LCByZXNwb25zZURhdGEpO1xuXHR9XG59XG5cbi8vIEFjdGl2YXRlIHRpbWVvdXQgdGltZXIgdG8gYWJvcnQgY29tbWFuZHMgcnVubmluZyBmb3IgdG9vIGxvbmdcbi8vIENhbGxzIGV4ZWN1dGlvblN0b3BwZWQgdXBvbiB0aW1lb3V0LlxuZnVuY3Rpb24gZW5nYWdlVGltZW91dChwb29sLCBjbWQpIHtcblx0Y21kLmludGVybmFsLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1x0XHRcblx0XHQvLyBDb21tYW5kIHRpbWVkIG91dCwgYWJvcnQgZXhlY3V0aW9uXG5cdFx0Y21kLnRpbWVvdXQocG9vbCk7XG5cdH0sIGNtZC5pbnRlcm5hbC5vcHRpb25zLmNvbW1hbmRUaW1lb3V0U2VjICogMTAwMCk7XG59XG5cbi8vIENvbW1vbiBzaWduYWxzXG5leHBvcnRzLlNpZ25hbHMgPSB7XG5cdFRlcm1pbmF0aW9uOiBuZXcgQ29tbWFuZCgwLCBudWxsLCBudWxsLCAxKSxcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgSm9obiBHcmFuc3Ryw7ZtXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmNvbnN0IGNvbW1hbmRJZExpbWl0ID0gMWU5O1xuXG52YXIgbWlzYyA9IHJlcXVpcmUoJy4vbWlzYycpLFxuXHRRdWV1ZSA9IHJlcXVpcmUoJy4vcXVldWUnKS5RdWV1ZSxcdFxuXHRDb21tYW5kID0gcmVxdWlyZSgnLi9jb21tYW5kJykuQ29tbWFuZDtcblxuZXhwb3J0cy5Db21tYW5kUG9vbCA9IENvbW1hbmRQb29sO1xuZnVuY3Rpb24gQ29tbWFuZFBvb2woZ28pIHtcblx0dGhpcy5nbyA9IGdvO1xuXHR0aGlzLmNvbW1hbmRNYXAgPSB7fSxcblx0dGhpcy5uZXh0Q29tbWFuZElkID0gMDtcblx0dGhpcy5ydW5uaW5nQ29tbWFuZHMgPSAwO1xuXHR0aGlzLmhhc0NvbW1hbmRzUnVubmluZyA9IGZhbHNlO1xuXG5cdHRoaXMuaWRsZUNtZFdhaXRpbmcgPSBudWxsOyAvLyBQcm92aWRlIHRoZSBhYmlsaXR5IHRvIGV4ZWN1dGUgYSBjb21tYW5kIHVwb24gbmV4dCBpZGxlXG5cdFxuXHR0aGlzLmNvbW1hbmRRdWV1ZSA9IG5ldyBRdWV1ZSgpO1xufVxuXG4vLyBQbGFuIHRoZSBleGVjdXRpb24gb2YgYSBjb21tYW5kIGFuZCBzZXQgZXhlY3V0aW9uIG9wdGlvbnMuXG4vLyBOb25lIHByaW9yaXRpemVkIGNvbW1hbmRzIG1heSBiZSBxdWV1ZWQgaW5zdGVhZCBvZiBkaXJlY3RseSBleGVjdXRlZCBpZiBleGNlZWRpbmcgY29tbWFuZCBsaW1pdC5cbkNvbW1hbmRQb29sLnByb3RvdHlwZS5wbGFuRXhlY3V0aW9uID0gZnVuY3Rpb24oY21kLCBwcmlvcml0aXplZCwgb3B0aW9ucykge1xuXHRjbWQuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcblx0Ly8gSWYgY29tbWFuZCBub3QgcHJpb3JpdGl6ZWQgbWFrZSBzdXJlIGl0IGRvZXMgbm90IGV4Y2VlZCBjb21tYW5kIGxpbWl0XG5cdC8vY29uc29sZS5sb2codGhpcy5nby5vcHRpb25zLm1heENvbW1hbmRzUnVubmluZylcdFxuXHRleGVjdXRlQ29tbWFuZCh0aGlzLCBjbWQsIHByaW9yaXRpemVkKTtcbn1cblxuLy8gSGFuZGxlIEpTT04gcmVzcG9uc2UgYW5kIHByb2Nlc3MgY29tbWFuZCBjYWxsYmFjayBhbmQgZW5kIG9mIGV4ZWN1dGlvbiBcbi8vIEFsc28gbWFuYWdlIHRoZSBxdWV1ZSBpZiByZXF1aXJlZC4gXG5Db21tYW5kUG9vbC5wcm90b3R5cGUuaGFuZGxlUmVzcG9uc2UgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuXHR2YXIgcmVzcENtZCA9IHRoaXMuY29tbWFuZE1hcFtyZXNwb25zZS5pZF1cblx0aWYocmVzcENtZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmVzcENtZC5yZXNwb25zZSh0aGlzLCByZXNwb25zZS5kYXRhKTtcdFxuXHR9IGVsc2Uge1xuXHRcdC8vIENvbW1hbmQgbWF5IGhhdmUgdGltZWQgb3V0IG9yIG90aGVyd2lzZSBhYm9ydGVkIHNvIHdlIHRocm93IHRoZSByZXNwb25zZSBhd2F5XG5cdH1cdFxufVxuXG4vLyBDcmVhdGUgYSBjb21tYW5kIHdpdGggc3BlY2lmaWVkIGRhdGEgYW5kIGNhbGxiYWNrIHdpdGggbmV3IElEXG5Db21tYW5kUG9vbC5wcm90b3R5cGUuY3JlYXRlQ29tbWFuZCA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG5cdGNtZCA9IG5ldyBDb21tYW5kKHRoaXMubmV4dENvbW1hbmRJZCwgZGF0YSwgY2FsbGJhY2spO1xuXHRpbmNyZW1lbnRDb21tYW5kSWQodGhpcyk7XG5cdHJldHVybiBjbWQ7XG59XG5cbi8vIENoZWNrIGlmIGNvbW1hbmRzIGFyZSBxdWV1ZWQsIGFuZCBpZiBzbyBleGVjdXRlIHRoZW0gb24gbmV4dCBldmVudCBsb29wXG5Db21tYW5kUG9vbC5wcm90b3R5cGUud29ya1F1ZXVlID0gZnVuY3Rpb24oKSB7XG5cdGlmKCF0aGlzLmNvbW1hbmRRdWV1ZS5pc0VtcHR5KCkpIHsgLy8gQ2hlY2sgaWYgcXVldWUgaXMgZW1wdHkgZmlyc3Rcblx0XHR2YXIgcG9vbCA9IHRoaXM7XG5cdFx0Ly8gRGVxdWV1ZSBjb21tYW5kIGhlcmUgbm90IG9uIG5leHRUaWNrKCkgdG8gYXZvaWQgbXVsdGlwbGUgZGVxdWV1ZXMgZm9yIHNhbWUgaXRlbVxuXHRcdHZhciBuZXh0Q21kID0gcG9vbC5jb21tYW5kUXVldWUuZGVxdWV1ZSgpO1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7IC8vIEV4ZWN1dGUgbmV4dCBjb21tYW5kcyBvbiBuZXh0IHRpY2tcblx0XHRcdGV4ZWN1dGVDb21tYW5kKHBvb2wsIG5leHRDbWQsIGZhbHNlKTtcblx0XHR9KTtcblx0fVxufVxuXG4vLyBQbGFuIGEgc2luZ2xlIGNvbW1hbmQgdG8gYmUgcnVuIHRoZSBuZXh0IHRpbWUgdGhlIGNvbW1hbmQgcG9vbCBpcyBpZGxlXG4vLyAobm8gcnVubmluZyBjb21tYW5kcykuIENhbGxpbmcgdGhpcyBzZXZlcmFsIHRpbWVzIHdpdGhvdXQgaGF2aW5nIGFuIGlkbGUgcGVyaW9kXG4vLyB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXNseSBwbGFubmVkIG9uIGlkbGUgY29tbWFuZHNcbkNvbW1hbmRQb29sLnByb3RvdHlwZS5wbGFuT25JZGxlID0gZnVuY3Rpb24oY21kLCBwcmlvcml0aXplZCwgb3B0aW9ucykge1xuXHR0aGlzLmlkbGVDbWRXYWl0aW5nID0ge1xuXHRcdGNtZDogY21kLFxuXHRcdHByaW9yaXRpemVkOiBwcmlvcml0aXplZCxcblx0XHRvcHRpb3M6IG9wdGlvbnMsXG5cdH07XG5cdC8vIElmIHRoZXJlJ3Mgbm8gY29tbWFuZHMgcnVubmluZywgZXhlY3V0ZSBpdCByaWdodCBhd2F5XG5cdGlmKCF0aGlzLmhhc0NvbW1hbmRzUnVubmluZykge1xuXHRcdGV4ZWN1dGVXYWl0aW5nQ29tbWFuZCh0aGlzKTtcblx0fVxufVxuXG4vLyBDYWxsIHdoZW4gcG9vbCBoYXMgZW50ZXJlZCBpZGxlLCBpLmUuIGhhcyBubyBjb21tYW5kcyBydW5uaW5nIGFzIG9mIG5vd1xuQ29tbWFuZFBvb2wucHJvdG90eXBlLmVudGVyZWRJZGxlID0gZnVuY3Rpb24oKSB7XG5cdC8vIENoZWNrIGlmIHRoZXJlJ3MgYSBjb21tYW5kIHdhaXRpbmcgZm9yIGlkbGVcblx0aWYodGhpcy5pZGxlQ21kV2FpdGluZyAhPSBudWxsKSB7XG5cdFx0Ly8gRXhlY3V0ZSB3YWl0aW5nIGNvbW1hbmQgb24gbmV4dCB0aWNrXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHRleGVjdXRlV2FpdGluZ0NvbW1hbmQoc2VsZik7XG5cdFx0fSk7XG5cdH1cbn1cblxuLy8gQ2F1c2VzIGFsbCBydW5uaW5nIGNvbW1hbmRzIHRvIHRpbWVvdXRcbkNvbW1hbmRQb29sLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5jb21tYW5kUXVldWUuY2xlYXIoKTsgLy8gQ2xlYXIgY29tbWFuZCBxdWV1ZVxuXHR0aGlzLmlkbGVDbWRXYWl0aW5nID0gbnVsbDsgLy8gVGhyb3cgYXdheSBhbnkgd2FpdGluZyBjb21tYW5kXG5cblx0Zm9yKHZhciBjbWRJZCBpbiB0aGlzLmNvbW1hbmRNYXApIHtcblx0XHR2YXIgY21kID0gdGhpcy5jb21tYW5kTWFwW2NtZElkXTtcblx0XHRpZihjbWQuaW50ZXJuYWwuZXhlY3V0aW9uU3RhcnRlZCAmJiAhY21kLmludGVybmFsLmV4ZWN1dGlvbkVuZGVkKSB7XG5cdFx0XHRjbWQudGVybWluYXRlKHRoaXMpO1xuXHRcdH1cblx0fVxufVxuXG4vLyBFeGVjdXRlIGEgY29tbWFuZCBpZiBkb2VzIG5vdCBleGNlZWQgY29tbWFuZCBjb3VudCBsaW1pdCBhbmQgY29tbWFuZCBxdWV1ZSBpcyBlbXB0eVxuLy8gb3RoZXJ3aXNlIHF1ZXVlIGNvbW1hbmQgZm9yIGxhdGVyIGV4ZWN1dGlvbi5cbmZ1bmN0aW9uIGV4ZWN1dGVDb21tYW5kKHBvb2wsIGNtZCwgcHJpb3JpdGl6ZWQpIHtcblx0aWYoIXByaW9yaXRpemVkICYmIChwb29sLnJ1bm5pbmdDb21tYW5kcyA+PSBwb29sLmdvLm9wdGlvbnMubWF4Q29tbWFuZHNSdW5uaW5nKSkge1xuXHRcdC8vIEV4Y2VlZHMgbGltaXQsIHF1ZXVlIGNvbW1hbmQgaW5zdGVhZCBvZiBydW5uaW5nXG5cdFx0cG9vbC5jb21tYW5kUXVldWUuZW5xdWV1ZShjbWQpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIEV4ZWN1dGUgY29tbWFuZFx0XG5cdFx0Y21kLmV4ZWN1dGUocG9vbCk7XHRcblx0fVxufVxuXG4vLyBSZXNldCBuZXh0Q29tbWFuZElkIGlmIGdyb3dpbmcgcGFzdCBsaW1pdFxuLy8gTGltaXQgc2hvdWxkIGJlIHNldCBoaWdoIGVub3VnaCBzbyB0aGF0IHRoZSBvbGQgY29tbWFuZCBmb3IgSUQgMFxuLy8gbW9zdCBsaWtlbHkgaGFzIHJlc3BvbmRlZCBvciB0aW1lZCBvdXQgYW5kIHdpbGwgbm90IGNvbmZsaWN0IHdpdGggbmV3IG9uZXMuXG5mdW5jdGlvbiBpbmNyZW1lbnRDb21tYW5kSWQocG9vbCkge1xuXHRpZihwb29sLm5leHRDb21tYW5kSWQrKyA+PSBjb21tYW5kSWRMaW1pdCkge1xuXHRcdHBvb2wubmV4dENvbW1hbmRJZCA9IDA7XG5cdH1cbn1cblxuLy8gRXhlY3V0ZSBhIGNvbW1hbmQgcGxhbm5lZCB0byBydW4gb24gbmV4dCBpZGxlXG5mdW5jdGlvbiBleGVjdXRlV2FpdGluZ0NvbW1hbmQocG9vbCkge1xuXHR2YXIgdG9FeGVjdXRlID0gcG9vbC5pZGxlQ21kV2FpdGluZztcblx0cG9vbC5pZGxlQ21kV2FpdGluZyA9IG51bGw7XG5cdHBvb2wucGxhbkV4ZWN1dGlvbih0b0V4ZWN1dGUuY21kLFxuXHRcdHRvRXhlY3V0ZS5wcmlvcml0aXplZCxcblx0XHR0b0V4ZWN1dGUub3B0aW9uc1xuXHQpO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduLFxuXHR1dGlsID0gcmVxdWlyZSgndXRpbCcpLFxuXHRmcyA9IHJlcXVpcmUoJ2ZzJyksXHRcblx0bWlzYyA9IHJlcXVpcmUoJy4vbWlzYycpLFxuXHRFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIsXG5cdENvbW1hbmRQb29sID0gcmVxdWlyZSgnLi9jb21tYW5kcG9vbCcpLkNvbW1hbmRQb29sXHRcblx0U2lnbmFscyA9IHJlcXVpcmUoJy4vY29tbWFuZCcpLlNpZ25hbHM7XG5cbi8vIENyZWF0ZSBhIG5ldyBHby1vYmplY3QgZm9yIHRoZSBzcGVjaWZpZWQgLmdvLWZpbGUuXG4vLyBXaWxsIGFsc28gaW50aWFsaXplIEdvLW9iamVjdCBpZiBzZWNvbmQgcGFyYW1ldGVyIGlzIHRydWUuXG4vL1xuLy8gVGhyb3dzIGVycm9yIGlmIG5vIHBhdGggcHJvdmlkZWQgdG8gLmdvLWZpbGUuXG51dGlsLmluaGVyaXRzKEdvLCBFdmVudEVtaXR0ZXIpO1xuZXhwb3J0cy5HbyA9IEdvO1xuZnVuY3Rpb24gR28ob3B0aW9ucywgY2FsbGJhY2spIHtcblx0aWYob3B0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMgPT09IG51bGwpIHtcblx0XHRtaXNjLnJhaXNlRXJyb3IoJ05vIG9wdGlvbnMgcHJvdmlkZWQuJylcblx0fVxuXHRpZihvcHRpb25zLnBhdGggPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMucGF0aCA9PSBudWxsKSB7XG5cdFx0bWlzYy5yYWlzZUVycm9yKCdObyBwYXRoIHByb3ZpZGVkIHRvIC5nby1maWxlLicpO1xuXHR9XG5cblx0bWlzYy5tZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcblx0XHRtYXhDb21tYW5kc1J1bm5pbmc6IDEwLFxuXHRcdGRlZmF1bHRDb21tYW5kVGltZW91dFNlYzogNSxcblx0XHRjd2Q6IHByb2Nlc3MuY3dkKCksXG5cdH0pO1xuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG5cdHRoaXMuZ29GaWxlID0gb3B0aW9ucy5wYXRoO1xuXHR0aGlzLnByb2MgPSBudWxsO1xuXHR0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7IC8vIHRydWUgd2hlbiBHbyBoYXMgYmVlbiBpbml0aWFsaXplZCwgYmFjayB0byBmYWxzZSB3aGVuIEdvIGNsb3Nlc1xuXHR0aGlzLmNsb3NlUGVuZGluZyA9IGZhbHNlOyAvLyB0cnVlIHdoZW4gY2xvc2UoKSBoYXMgYmVlbiBjYWxsZWQgYW5kIG5vIG1vcmUgY29tbWFuZHMgc2hvdWxkIGJlIHBsYW5uZWRcblx0dGhpcy50ZXJtaW5hdGVQZW5kaW5nID0gZmFsc2U7IC8vIHRydWUgd2hlbiB0ZXJtaW5hdGUoKSBoYXMgYmVlbiBjYWxsZWRcblx0dGhpcy5jb21tYW5kUG9vbCA9IG5ldyBDb21tYW5kUG9vbCh0aGlzKVxuXG5cdGlmKG9wdGlvbnMuaW5pdEF0T25jZSkge1xuXHRcdHRoaXMuaW5pdChjYWxsYmFjayk7XG5cdH1cbn1cblxuLy8gSW5pdGlhbGl6ZSBieSBsYXVuY2hpbmcgZ28gcHJvY2VzcyBhbmQgcHJlcGFyZSBmb3IgY29tbWFuZHMuXG4vLyBEbyBhcyBlYXJseSBhcyBwb3NzaWJsZSB0byBhdm9pZCBkZWxheSB3aGVuIGV4ZWN1dGluZyBmaXJzdCBjb21tYW5kLlxuLy9cbi8vIGNhbGxiYWNrIGhhcyBwYXJhbWV0ZXJzIChlcnIpXG5Hby5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHRcdFxuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdGZzLmV4aXN0cyh0aGlzLmdvRmlsZSwgZnVuY3Rpb24oZXhpc3RzKSB7XG5cdFx0aWYoIWV4aXN0cykge1x0XG5cdFx0XHRtaXNjLmNhbGxiYWNrSWZBdmFpbGFibGUoY2FsbGJhY2ssIG1pc2MuZ2V0RXJyb3IoJy5nby1maWxlIG5vdCBmb3VuZCBmb3IgZ2l2ZW4gcGF0aC4nKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gc2ltcGxlIGV4dGVuc2lvbiBjaGVjayB0byBkZXRlY3QgaWYgaXRzIGEgdW4gY29tcGlsZXMgLmdvIGZpbGVcblx0XHRpZiAoc2VsZi5nb0ZpbGUuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICcuZ28nKSB7XG5cdFx0XHQvLyBTcGF3biBnbyBwcm9jZXNzIHdpdGhpbiBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5XG5cdFx0XHRzZWxmLnByb2MgPSBzcGF3bignZ28nLCBbJ3J1bicsIHNlbGYuZ29GaWxlXSwgeyBjd2Q6IHNlbGYub3B0aW9ucy5jd2QsIGVudjogcHJvY2Vzcy5lbnYgfSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFNwYXduIGdvIGNvbXBpbGVkIGZpbGVcblx0XHRcdHNlbGYucHJvYyA9IHNwYXduKCBzZWxmLmdvRmlsZSwgW10sIHsgY3dkOiBzZWxmLm9wdGlvbnMuY3dkLCBlbnY6IHByb2Nlc3MuZW52IH0pO1xuXHRcdH1cblxuXG5cdFx0Ly8gU2V0dXAgaGFuZGxlcnNcblx0XHRzZWxmLnByb2Muc3Rkb3V0Lm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRoYW5kbGVTdGRvdXQoc2VsZiwgZGF0YSk7XG5cdFx0fSk7XG5cdFx0c2VsZi5wcm9jLnN0ZGVyci5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0aGFuZGxlRXJyKHNlbGYsIGRhdGEsIGZhbHNlKTtcblx0XHR9KTtcblx0XHRzZWxmLnByb2Mub24oJ2Nsb3NlJywgZnVuY3Rpb24oKXtcblx0XHRcdGhhbmRsZUNsb3NlKHNlbGYpO1xuXHRcdH0pO1x0XHRcblxuXHRcdC8vIEluaXQgY29tcGxldGVcblx0XHRzZWxmLmluaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRtaXNjLmNhbGxiYWNrSWZBdmFpbGFibGUoY2FsbGJhY2ssIG51bGwpO1xuXHR9KTtcbn1cblxuLy8gR3JhY2VmdWxseSBjbG9zZSBHbyBieSBzZW5kaW5nIHRlcm1pbmF0aW9uIHNpZ25hbCBhZnRlciBhbGwgZXhlY3V0aW5nIGNvbW1hbmRzXG4vLyBoYXMgZW5kZWQgdGhlaXIgZXhlY3V0aW9uLlxuLy8gUmV0dXJucyB0cnVlIGlmIGNsb3NlIGhhcyBiZWVuIHN0YXJ0ZWQsIG9yIGZhbHNlIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBpZiBpdFxuLy8gYWxyZWFkeSBoYXMgYSBjbG9zZSBwZW5kaW5nLlxuR28ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGlmKHRoaXMuaW5pdGlhbGl6ZWQgJiYgIXRoaXMuY2xvc2VQZW5kaW5nICYmICF0aGlzLnRlcm1pbmF0ZVBlbmRpbmcpIHtcblx0XHR0aGlzLmNsb3NlUGVuZGluZyA9IHRydWU7XG5cdFx0Ly8gU2VuZCBwcmlvcml0aXplZCB0ZXJtaW5hdGlvbiBzaWduYWxcblx0XHR0aGlzLmNvbW1hbmRQb29sLnBsYW5PbklkbGUoU2lnbmFscy5UZXJtaW5hdGlvbiwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuLy8gSGFyZCB0ZXJtaW5hdGUgYnkgc2VuZGluZyB0ZXJtaW5hdGlvbiBvbiBhbGwgY29tbWFuZHMgYW5kIHRlcm1pbmF0aW9uIHNpZ25hbCB0byBHb1xuLy8gUmV0dXJucyB0cnVlIGlmIHRlcm1pbmF0aW9uIGhhcyBiZWVuIHN0YXJ0ZWQsIG9yIGZhbHNlIGlmIEdvIGlzIG5vdCBpbml0aWFsaXplZCBvciBpZiBpdFxuLy8gYWxyZWFkeSBoYXMgYSB0ZXJtaW5hdGlvbiBwZW5kaW5nLlxuR28ucHJvdG90eXBlLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGVybWluYXRlKHRoaXMsIHRydWUpO1xufVxuXG4vLyBDcmVhdGUgYW5kIGV4ZWN1dGUgb3IgcXVldWUgYSBjb21tYW5kIG9mIEpTT04gZGF0YVxuLy8gV2lsbCBub3QgcXVldWUgY29tbWFuZCBpZiBHbyBpcyBub3QgaW5pdGlhbGl6ZWQgb3IgaGFzIGJlZW4gY2xvc2VkIChvciBjbG9zZSBwZW5kaW5nKVxuLy8gVGFrZXMgcGFyYW1ldGVyczpcbi8vIFx0XHRkYXRhIChyZXF1aXJlZCkgLSBhY3R1YWwgY29tbWFuZCBKU09OXG4vL1x0XHRjYWxsYmFjayAocmVxdWlyZWQpIC0gdGhlIGNhbGxiYWNrIHRvIGNhbGwgd2l0aCBwb3NzaWJsZSByZXN1bHQgd2hlbiBleGVjdXRpb24gZW5kc1xuLy9cdFx0b3B0aW9ucyAob3B0aW9uYWwpIC0gb3ZlcnJpZGVzIGRlZmF1bHQgZXhlY3V0aW9uIG9wdGlvbnNcbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgY29tbWFuZCB3YXMgcGxhbm5lZCBmb3IgZXhlY3V0aW9uLCBvdGhlcndpc2UgZmFsc2UuXG5Hby5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSB7XHRcblx0aWYodGhpcy5pbml0aWFsaXplZCAmJiAhdGhpcy5jbG9zZVBlbmRpbmcgJiYgIXRoaXMudGVybWluYXRlUGVuZGluZykge1xuXHRcdC8vIEltcG9ydGFudCB0byBub3QgbGVhdmUgZ28gaW4gYW4gaW5maW5pdGUgbG9vcCBlYXRpZyBjcHVcblx0XHR0cnkgeyAvLyBDb250YWluIG91dGVyIGV4Y2VwdGlvbnMgYW5kIGNsb3NlIGdvIGJlZm9yZSByZXRocm93aW5nIGV4Y2VwdGlvbi5cblx0XHRcdHRoaXMuY29tbWFuZFBvb2wucGxhbkV4ZWN1dGlvbih0aGlzLmNvbW1hbmRQb29sLmNyZWF0ZUNvbW1hbmQoZGF0YSwgY2FsbGJhY2spLCBmYWxzZSwgb3B0aW9ucyk7XHRcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRoYW5kbGVFcnIodGhpcywgZSwgZmFsc2UpO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTsgLy8gUmV0dXJuIHRydWUgc2luY2UgdGhlIGNvbW1hbmQgaGFzIGJlZW4gcGxhbm5lZCBmb3IgZXhlY3V0aW9uXG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlOyAvLyBUaGUgY29tbWFuZCB3YXNuJ3QgcGxhbm5lZCBmb3IgZXhlY3V0aW9uLCByZXR1cm4gZmFsc2Vcblx0fVxufVxuXG4vLyByZXNldCB0aGUgYnVmZmVyRGF0YSB3aXRoIGFuIGVtcHR5IHN0cmluZ1xudmFyIGJ1ZmZlckRhdGEgPSBcIlwiO1xuXG4vLyBSZWNlaXZlIGRhdGEgZnJvbSBnby1tb2R1bGVcbmZ1bmN0aW9uIGhhbmRsZVN0ZG91dChnbywgZGF0YSkge1xuXG5cdC8vIGFwcGVuZCBkYXRhIHRvIHRoZSBidWZmZXIgZm9yIGV2ZXJ5IHN0ZG91dFxuICAgIGJ1ZmZlckRhdGEgKz0gZGF0YS50b1N0cmluZygpO1xuXG4gICAgLy8gaWYgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBtZXNzYWdlIGluIHRoZSBzdGRvdXQgcGFyc2UgaXRcblx0Ly8gYW5kIHJlc2V0IHRoZSBidWZmZXIgZm9yIHRoZSBuZXh0IHN0ZG91dFxuICAgIGlmIChidWZmZXJEYXRhLmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICAgIC8vIFJlc3BvbnNlIG1heSBiZSBzZXZlcmFsIGNvbW1hbmQgcmVzcG9uc2VzIHNlcGFyYXRlZCBieSBuZXcgbGluZXNcbiAgICAgICAgYnVmZmVyRGF0YS50b1N0cmluZygpLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgICAgLy8gRGlzY2FyZCBlbXB0eSBsaW5lc1xuICAgICAgICAgICAgaWYocmVzcC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgZWFjaCBjb21tYW5kIHJlc3BvbnNlIHdpdGggYSBldmVudC1sb29wIGluIGJldHdlZW4gdG8gYXZvaWQgYmxvY2tpbmdcbiAgICAgICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7cGFyc2VSZXNwb25zZShnbywgcmVzcCl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJ1ZmZlckRhdGEgPSBcIlwiO1xuICAgIH1cbn1cblxuLy8gUGFyc2UgYSBfc2luZ2xlXyBjb21tYW5kIHJlc3BvbnNlIGFzIEpTT04gYW5kIGhhbmRsZSBpdFxuLy8gSWYgcGFyc2luZyBmYWlscyBhIGludGVybmFsIGVycm9yIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCB3aXRoIHRoZSByZXNwb25zZSBkYXRhXG5mdW5jdGlvbiBwYXJzZVJlc3BvbnNlKGdvLCByZXNwKSB7XG5cdHZhciBwYXJzZWQ7XG5cdHRyeSB7XG5cdFx0cGFyc2VkID0gSlNPTi5wYXJzZShyZXNwKTtcblx0fSBjYXRjaCAoZSkge1x0XHRcblx0XHRoYW5kbGVFcnIoZ28sIHJlc3AsIHRydWUpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIEltcG9ydGFudCB0byBub3QgbGVhdmUgZ28gaW4gYW4gaW5maW5pdGUgbG9vcCBlYXRpZyBjcHVcblx0dHJ5IHsgLy8gQ29udGFpbiBvdXRlciBleGNlcHRpb25zIGFuZCBjbG9zZSBnbyBiZWZvcmUgcmV0aHJvd2luZyBleGNlcHRpb24uXG5cdFx0Z28uY29tbWFuZFBvb2wuaGFuZGxlUmVzcG9uc2UocGFyc2VkKSAvLyBIYW5kbGUgcmVzcG9uc2Ugb3V0c2lkZSB0aHJvdyB0byBhdm9pZCBjYXRjaGluZyB0aG9zZSBleGNlcHRpb25zXHRcblx0fSBjYXRjaCAoZSkge1xuXHRcdGhhbmRsZUVycihnbywgZSwgZmFsc2UpO1xuXHR9XHRcbn1cblxuLy8gRW1pdCBlcnJvciBldmVudCBvbiBnbyBpbnN0YW5jZSwgcGFzcyB0aHJvdWdoIHJhdyBlcnJvciBkYXRhXG4vLyBFcnJvcnMgbWF5IGVpdGhlciBiZSBpbnRlcm5hbCBwYXJzZXIgZXJyb3JzIG9yIGV4dGVybmFsIGVycm9ycyByZWNlaXZlZCBmcm9tIHN0ZGVyclxuZnVuY3Rpb24gaGFuZGxlRXJyKGdvLCBkYXRhLCBwYXJzZXIpIHtcdFxuXHRpZighcGFyc2VyKSB7IC8vIElmIGV4dGVybmFsIGVycm9yLCB0ZXJtaW5hdGUgYWxsIGNvbW1hbmRzXG5cdFx0dGVybWluYXRlKGdvLCBmYWxzZSk7XG5cdH1cblxuXHRpZihnby5saXN0ZW5lcnMoJ2Vycm9yJykubGVuZ3RoID4gMCkgeyAvLyBPbmx5IGVtaXQgZXZlbnQgaWYgdGhlcmUgYXJlIGxpc3RlbmVyc1xuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBFbWl0IGFueSBldmVudCBvbiBuZXh0IHRpY2tcblx0XHRcdGdvLmVtaXQoJ2Vycm9yJywge3BhcnNlcjogcGFyc2VyLCBkYXRhOiBkYXRhfSk7XG5cdFx0fSk7XG5cdH1cdFxufVxuXG4vLyBHbyBwYW5pYyBhbmQgcHJvY2VzcyBlbmRzIGNhdXNlcyBjYWxscyB0byB0aGlzXG4vLyBFbWl0IGNsb3NlIGV2ZW50IG9uIGdvIGluc3RhbmNlXG5mdW5jdGlvbiBoYW5kbGVDbG9zZShnbykge1xuXHQvLyBJZiBwcm9jZXNzIGNsb3NlcyB3ZSBzZXQgaW5pdGlhbGl6ZWQgdG8gZmFsc2UgdG8gYXZvaWQgaW52YWxpZCBjbG9zZSgpIG9yIGV4ZWN1dGUoKVx0XG5cdGdvLmluaXRpYWxpemVkID0gZmFsc2U7XG5cdGlmKGdvLmxpc3RlbmVycygnY2xvc2UnKS5sZW5ndGggPiAwKSB7IC8vIE9ubHkgZW1pdCBldmVudCBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzXG5cdFx0Z28uZW1pdCgnY2xvc2UnKTtcblx0fVx0XHRcbn1cblxuLy8gVGVybWluYXRlIGJ5IHNlbmRpbmcgdGVybWluYXRpb24gb24gYWxsIGNvbW1hbmRzLlxuLy8gSWYgY2FsbGVkIHdpdGggdHJ1ZSBpdCB3aWxsIGFsc28gZGlyZWN0bHkgdHJ5IHRvIHNlbmQgYSB0ZXJtaW5hdGlvbiBzaWduYWwgdG8gZ29cbmZ1bmN0aW9uIHRlcm1pbmF0ZShnbywgd2l0aFNpZ25hbCkge1xuXHRpZihnby5pbml0aWFsaXplZCAmJiAhZ28udGVybWluYXRlUGVuZGluZykge1xuXHRcdGdvLnRlcm1pbmF0ZVBlbmRpbmcgPSB0cnVlO1xuXG5cdFx0Ly8gRG8gdGhlIGFjdHVhbCB0ZXJtaW5hdGlvbiBhc3luY2hyb25vdXNseVxuXHRcdC8vIENhbGxiYWNrcyB3aWxsIGJlIGVhY2ggdGVybWluYXRlZCBjb21tYW5kIG9yIG5vdGhpbmdcblx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7XG5cdFx0XHQvLyBUZWxsIGNvbW1hbmQgcG9vbCB0byBraWxsIGFsbCBjb21tYW5kc1xuXHRcdFx0Z28uY29tbWFuZFBvb2wudGVybWluYXRlKCk7XHRcdFx0XG5cblx0XHRcdC8vIFNlbmQgc2lnbmFsIGFmdGVyIGNvbW1hbmQgcG9vbCB0ZXJtaW5hdGlvbiwgb3RoZXJ3aXNlIGl0IHdvdWxkXG5cdFx0XHQvLyBiZSByZW1vdmVkIGJ5IHRlcm1pbmF0ZSgpXG5cdFx0XHRpZih3aXRoU2lnbmFsKSB7XHRcdFx0XHRcdFxuXHRcdFx0XHRnby5jb21tYW5kUG9vbC5wbGFuRXhlY3V0aW9uKFNpZ25hbHMuVGVybWluYXRpb24sIHRydWUpO1x0XHRcdFx0XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cdFxufSIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBKb2huIEdyYW5zdHLDtm1cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gQ29udGFpbnMgZ2VuZXJhbCBoZWxwZXJzXG5cbi8vIEludm9rZSBjYWxsYmFjayBpZiBub3QgdW5kZWZpbmVkIHdpdGggcHJvdmlkZWQgcGFyYW1ldGVyXG5leHBvcnRzLmNhbGxiYWNrSWZBdmFpbGFibGUgPSBmdW5jdGlvbihjYWxsYmFjaywgcGFyYW0pIHtcblx0aWYodHlwZW9mIGNhbGxiYWNrICE9IHVuZGVmaW5lZCkge1xuXHRcdGNhbGxiYWNrKHBhcmFtKTtcblx0fVxufVxuXG5leHBvcnRzLnJhaXNlRXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuXHR0aHJvdyBnZXRFcnJvcihlcnJvcik7XG59XG5cbmV4cG9ydHMuZ2V0RXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuXHRyZXR1cm4gbmV3IEVycm9yKCdnb25vZGU6ICcgKyBlcnJvcik7XG59XG5cbi8vIE1ha2Ugc3VyZSBvcHRpb25zIG5vdCBwcm92aWRlZCBhcmUgc2V0IHRvIGRlZmF1bHQgdmFsdWVzIFxuZXhwb3J0cy5tZXJnZURlZmF1bHRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucywgZGVmYXVsdHMpIHtcblx0Zm9yIChvcHQgaW4gZGVmYXVsdHMpIHtcblx0XHRpZihvcHRpb25zW29wdF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0b3B0aW9uc1tvcHRdID0gZGVmYXVsdHNbb3B0XTtcblx0XHR9IFxuXHR9XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEpvaG4gR3JhbnN0csO2bVxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5leHBvcnRzLlF1ZXVlID0gUXVldWU7XG5mdW5jdGlvbiBRdWV1ZSgpIHtcblx0dGhpcy5hcnIgPSBbXTtcbn1cblxuUXVldWUucHJvdG90eXBlLmVucXVldWUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdHRoaXMuYXJyLnB1c2goZWxlbWVudCk7XG59XG5cblF1ZXVlLnByb3RvdHlwZS5kZXF1ZXVlID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmFyci5zaGlmdCgpO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmFyci5sZW5ndGg7XG59XG5cblF1ZXVlLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLmdldExlbmd0aCgpID09PSAwO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5hcnIubGVuZ3RoID0gMDtcbn0iLCJpbXBvcnQgKiBhcyBQYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG5pbXBvcnQgeyBnZXRQYXRoLCBTZWFyY2hPYmplY3QsIFR5cGllLCBUeXBpZVJvd0l0ZW0gfSBmcm9tIFwiLi9pbmRleFwiO1xyXG5cclxuY29uc3QgZGVmYXVsdEljb24gPSBcInBrZy1pY29uLnBuZ1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RUeXBpZVBhY2thZ2Uge1xyXG4gICAgcHJvdGVjdGVkIHBhY2thZ2VEYXRhOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgcGFja2FnZU5hbWU6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBpY29uOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgdHlwaWU6IFR5cGllO1xyXG4gICAgcHJvdGVjdGVkIHBrZ0NvbmZpZzogYW55O1xyXG4gICAgcHJvdGVjdGVkIHdpbjogYW55O1xyXG4gICAgcHJvdGVjdGVkIGRiOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgcGFja2FnZXM6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih3aW4sIGNvbmZpZywgcGtnTmFtZSkge1xyXG4gICAgICAgIHRoaXMud2luID0gd2luO1xyXG4gICAgICAgIHRoaXMucGFja2FnZURhdGEgPSB7bmFtZTogcGtnTmFtZSwgcGF0aDogX19kaXJuYW1lfTtcclxuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gcGtnTmFtZTtcclxuICAgICAgICB0aGlzLmRiID0gcGtnTmFtZTtcclxuICAgICAgICB0aGlzLnBrZ0NvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICB0aGlzLmljb24gPSB0aGlzLmdldFBhY2thZ2VQYXRoKCkgKyBkZWZhdWx0SWNvbjtcclxuICAgICAgICB0aGlzLnR5cGllID0gbmV3IFR5cGllKHRoaXMucGFja2FnZU5hbWUpO1xyXG4gICAgICAgIHRoaXMucGFja2FnZXMgPSB7fTtcclxuICAgICAgICB0aGlzLmxvYWRDb25maWcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGFja2FnZU5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYWNrYWdlTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGFja2FnZVBhdGgoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gZ2V0UGF0aChcInBhY2thZ2VzL1wiICsgdGhpcy5wYWNrYWdlTmFtZSArIFwiL1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RGVmYXVsdEl0ZW0odmFsdWUsIGRlc2NyaXB0aW9uID0gXCJcIiwgcGF0aCA9IFwiXCIsIGljb24gPSBcIlwiKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICBjb25zdCBpdGVtID0gbmV3IFR5cGllUm93SXRlbSgpO1xyXG4gICAgICAgIGl0ZW0uc2V0VGl0bGUodmFsdWUpO1xyXG4gICAgICAgIGl0ZW0uc2V0UGF0aChwYXRoID8gcGF0aCA6IHZhbHVlKTtcclxuICAgICAgICBpdGVtLnNldEljb24oaWNvbiA/IGljb24gOiB0aGlzLmljb24pO1xyXG4gICAgICAgIGl0ZW0uc2V0RGVzY3JpcHRpb24oZGVzY3JpcHRpb24gPyBkZXNjcmlwdGlvbiA6IFwiXCIpO1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnNlcnQodmFsdWUsIGRlc2NyaXB0aW9uID0gXCJcIiwgcGF0aCA9IFwiXCIsIGljb24gPSBcIlwiKSB7XHJcbiAgICAgICAgdGhpcy5pbnNlcnRJdGVtKHRoaXMuZ2V0RGVmYXVsdEl0ZW0odmFsdWUsIGRlc2NyaXB0aW9uLCBwYXRoLCBpY29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluc2VydEl0ZW0oaXRlbTogVHlwaWVSb3dJdGVtKSB7XHJcbiAgICAgICAgdGhpcy50eXBpZS5pbnNlcnQoaXRlbSkuZ28oKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IGNvbnNvbGUubG9nKGRhdGEpKVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlYXJjaChvYmo6IFNlYXJjaE9iamVjdCwgY2FsbGJhY2s6IChkYXRhKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy50eXBpZS5mdXp6eVNlYXJjaChvYmoudmFsdWUpLm9yZGVyQnkoXCJzY29yZVwiKS5kZXNjKCkuZ28oKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IGNhbGxiYWNrKGRhdGEpKVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhY3RpdmF0ZShwa2dMaXN0OiBzdHJpbmdbXSwgaXRlbTogVHlwaWVSb3dJdGVtLCBjYWxsYmFjazogKGRhdGEpID0+IHZvaWQpIHtcclxuICAgICAgICBjb25zb2xlLmluZm8oJ05vIG8gICAgICB2ZXJyaWRlIFwiYWN0aXZhdGVcIiBtZXRob2QgZm91bmQgaW4gJyArIHRoaXMucGFja2FnZU5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbnRlclBrZyhwa2dMaXN0OiBzdHJpbmdbXSwgaXRlbT86IFR5cGllUm93SXRlbSwgY2FsbGJhY2s/OiAoZGF0YSkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuZ2V0Rmlyc3RSZWNvcmRzKDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIocGtnTGlzdDogc3RyaW5nW10sIGNhbGxiYWNrOiAoZGF0YSkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuZ2V0Rmlyc3RSZWNvcmRzKDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlKHBrZ0xpc3Q6IHN0cmluZ1tdLCBpdGVtOiBUeXBpZVJvd0l0ZW0sIGNhbGxiYWNrOiAoZGF0YSkgPT4gdm9pZCkge1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbygnTm8gb3ZlcnJpZGUgXCJyZW1vdmVcIiBtZXRob2QgZm91bmQgaW4gJyArIHRoaXMucGFja2FnZU5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRJY29uKGljb24pIHtcclxuICAgICAgICByZXR1cm4gUGF0aC5qb2luKHRoaXMuZ2V0UGFja2FnZVBhdGgoKSwgaWNvbik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEZpcnN0UmVjb3JkcyhudW1PZlJlY29yZHM6IG51bWJlciA9IDEwKSB7XHJcbiAgICAgICAgdGhpcy50eXBpZS5nZXRSb3dzKG51bU9mUmVjb3Jkcykub3JkZXJCeShcImNvdW50XCIpLmRlc2MoKS5nbygpXHJcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB0aGlzLndpbi5zZW5kKFwicmVzdWx0TGlzdFwiLCByZXMpKVxyXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKFwiZXJyb3IgZ2V0dGluZyBmaXJzdCByZWNvcmRzXCIsIGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZENvbmZpZygpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIk5vIG92ZXJyaWRlICdsb2FkQ29uZmlnJyBtZXRob2QgZm91bmQgaW4gXCIgKyB0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgICAgICBpZiAodGhpcy5wa2dDb25maWcuc2hvcnRjdXQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWdpc3RlcmluZyBzaG9ydGN1dCBcIiArIHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0ICsgXCIgdG8gXCIgKyB0aGlzLmdldFBhY2thZ2VOYW1lKCkpO1xyXG4gICAgICAgICAgICB0aGlzLndpbi5yZWdpc3RlcktleSh0aGlzLnBrZ0NvbmZpZy5zaG9ydGN1dCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53aW4uc2VuZChcImNoYW5nZVBhY2thZ2VcIiwgW3RoaXMuZ2V0UGFja2FnZU5hbWUoKV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJkZXN0cm95aW5nIHRoZSBwYWNrYWdlIVwiKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInVucmVnaXN0ZXJcIiwgdGhpcy5wa2dDb25maWcpO1xyXG4gICAgICAgIGlmICh0aGlzLnBrZ0NvbmZpZy5zaG9ydGN1dCkge1xyXG4gICAgICAgICAgICB0aGlzLndpbi51bnJlZ2lzdGVyS2V5KHRoaXMucGtnQ29uZmlnLnNob3J0Y3V0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcEdsb2JhbCB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBzZXR0aW5nczogYW55O1xyXG4gICAgcHVibGljIHN0YXRpYyBzdGFydFRpbWU6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFRpbWVTaW5jZUluaXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBBcHBHbG9iYWwuc3RhcnRUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0U2V0dGluZ3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIEFwcEdsb2JhbC5zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldChuYW1lOiBzdHJpbmcsIG9iajogYW55KTogdm9pZCB7XHJcbiAgICAgICAgZ2xvYmFsW25hbWVdID0gb2JqO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0KG5hbWU6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbFtuYW1lXTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge0dvfSBmcm9tIFwiZ29ub2RlXCI7XHJcbmltcG9ydCBQYWNrZXQgZnJvbSBcIi4vbW9kZWxzL1BhY2tldFwiO1xyXG4vLyBpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmNvbnN0IGFwcEdsb2JhbDogYW55ID0gZ2xvYmFsO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29EaXNwYXRjaGVyIHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdvOiBhbnk7XHJcbiAgICBwdWJsaWMgc3RhdGljIGxpc3RlbmluZzogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgc3RhdGljIGV4ZWN1dGFibGVQYXRoOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwaWVFeGVjdXRhYmxlOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlN0YXJ0aW5nIFR5cGllIFNlcnZpY2UgZm9yIHRoZSBmaXJzdCB0aW1lXCIsIHR5cGllRXhlY3V0YWJsZSk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmV4ZWN1dGFibGVQYXRoID0gdHlwaWVFeGVjdXRhYmxlO1xyXG4gICAgICAgIHRoaXMuc3RhcnRQcm9jZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlbmQocGFja2V0OiBQYWNrZXQpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwic2VuZCBwYWNrZXRcIiwgcGFja2V0KTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uZXhlY3V0ZShwYWNrZXQsIChyZXN1bHQ6IGFueSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJnb3QgYmFja1wiLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLmNsb3NlKCk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmxpc3RlbmluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhcnRQcm9jZXNzKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU3RhcnRpbmcgVHlwaWUgU2VydmljZVwiLCBHb0Rpc3BhdGNoZXIuZXhlY3V0YWJsZVBhdGgpO1xyXG4gICAgICAgIEdvRGlzcGF0Y2hlci5saXN0ZW5pbmcgPSBmYWxzZTtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28gPSBuZXcgR28oe1xyXG4gICAgICAgICAgICBkZWZhdWx0Q29tbWFuZFRpbWVvdXRTZWM6IDYwLFxyXG4gICAgICAgICAgICBtYXhDb21tYW5kc1J1bm5pbmc6IDEwLFxyXG4gICAgICAgICAgICBwYXRoOiBHb0Rpc3BhdGNoZXIuZXhlY3V0YWJsZVBhdGgsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLmluaXQodGhpcy5yZWdpc3Rlcik7XHJcbiAgICAgICAgR29EaXNwYXRjaGVyLmdvLm9uKFwiY2xvc2VcIiwgKCkgPT4gdGhpcy5vbkNsb3NlKCkpO1xyXG4gICAgICAgIEdvRGlzcGF0Y2hlci5nby5vbihcImVycm9yXCIsIGVyciA9PiBjb25zb2xlLmVycm9yKFwiZ28gZGlzcGF0Y2hlciBoYWQgZXJyb3JcIiwgZXJyKSk7XHJcbiAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiBHb0Rpc3BhdGNoZXIuZ28udGVybWluYXRlKCksIDEwMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ2xvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJnbyBkaXNwYXRjaGVyIHdhcyBjbG9zZWRcIik7XHJcbiAgICAgICAgaWYgKEdvRGlzcGF0Y2hlci5saXN0ZW5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFByb2Nlc3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWdpc3RlcigpOiB2b2lkIHtcclxuICAgICAgICBHb0Rpc3BhdGNoZXIuZ28uZXhlY3V0ZShcclxuICAgICAgICAgICAge2NvbW1hbmQ6IFwic3RhcnRcIn0sIChyZXN1bHQ6IGFueSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5vaykgeyAgLy8gQ2hlY2sgaWYgcmVzcG9uc2UgaXMgb2tcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBvdXIgY2FzZSB3ZSBqdXN0IGVjaG8gdGhlIGNvbW1hbmQsIHNvIHdlIGNhbiBnZXQgb3VyIHRleHQgYmFja1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVHlwaWUgcmVzcG9uZGVkOiBcIiwgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcEdsb2JhbC5jb3JlTG9nUGF0aCA9IHJlc3BvbnNlLmxvZztcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdvRGlzcGF0Y2hlci5saXN0ZW5pbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IEdvRGlzcGF0Y2hlciBmcm9tIFwiLi9Hb0Rpc3BhdGNoZXJcIjtcclxuaW1wb3J0IFBhY2tldCBmcm9tIFwiLi9tb2RlbHMvUGFja2V0XCI7XHJcbmltcG9ydCBTZWFyY2hQYXlsb2FkIGZyb20gXCIuL21vZGVscy9TZWFyY2hQYXlsb2FkXCI7XHJcbmltcG9ydCBUeXBpZVJvd0l0ZW0gZnJvbSBcIi4vbW9kZWxzL1R5cGllUm93SXRlbVwiO1xyXG5cclxuLy8gdGhpcyBpcyBhIGxpdHRsZSBoYWNrIHRvIHVzZSB0aGUgZ2xvYmFsIHZhcmlhYmxlIGluIFR5cGVTY3JpcHRcclxuLy8gaXQgaXMgdXNlZCB0byBnZXQgdGhlIGdvIGRpc3BhdGNoZXIgZnJvbSB0aGUgbWFpbiBwcm9jZXNzIHdlIG5lZWQgaXQgYXMgYSBzaW5nbGV0b25cclxuY29uc3QgZ2xvYmFsQW55OiBhbnkgPSBnbG9iYWw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBpZSB7XHJcbiAgICBwcml2YXRlIHNlYXJjaDogU2VhcmNoUGF5bG9hZCA9IG5ldyBTZWFyY2hQYXlsb2FkKCk7XHJcbiAgICBwcml2YXRlIGRiOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHBhY2thZ2VOYW1lOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGNvbW1hbmQ6IHN0cmluZztcclxuICAgIHByaXZhdGUgcGF5bG9hZDogYW55O1xyXG4gICAgcHJpdmF0ZSBnb0Rpc3BhdGNoZXI6IEdvRGlzcGF0Y2hlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYWNrYWdlTmFtZTogc3RyaW5nLCBkYj86IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ29EaXNwYXRjaGVyID0gZ2xvYmFsQW55LkdvRGlzcGF0Y2hlcjtcclxuICAgICAgICB0aGlzLmRiID0gZGIgPyBkYiA6IHBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMucGFja2FnZU5hbWUgPSBwYWNrYWdlTmFtZTtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXN0ZVRleHQoKSB7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kID0gXCJwYXN0ZVRleHRcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSB7fTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkQ29sbGVjdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcImFkZENvbGxlY3Rpb25cIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSB7bmFtZTogdGhpcy5wYWNrYWdlTmFtZX07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUNhbGxlZChpdGVtKSB7XHJcbiAgICAgICAgaXRlbS5jb3VudFVwKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zZXJ0KGl0ZW0sIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtdWx0aXBsZUluc2VydChpdGVtTGlzdCkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwibXVsdGlwbGVJbnNlcnRcIjtcclxuICAgICAgICB0aGlzLnBheWxvYWQgPSBpdGVtTGlzdDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5zZXJ0KGl0ZW06IFR5cGllUm93SXRlbSwgcGVyc2lzdCA9IHRydWUpIHtcclxuICAgICAgICBpdGVtLnNldERCKHRoaXMuZGIpO1xyXG4gICAgICAgIGl0ZW0uc2V0UGFja2FnZSh0aGlzLnBhY2thZ2VOYW1lKTtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBwZXJzaXN0ID8gXCJpbnNlcnRQZXJzaXN0XCIgOiBcImluc2VydFwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IGl0ZW0udG9QYXlsb2FkKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEtleSh2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLmRiID0gdGhpcy5kYjtcclxuICAgICAgICB0aGlzLnBheWxvYWQucGFja2FnZU5hbWUgPSB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwiZ2V0S2V5XCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEV4ZWNMaXN0KCkge1xyXG4gICAgICAgIHRoaXMucGF5bG9hZC5kYiA9IHRoaXMuZGI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkLnBhY2thZ2VOYW1lID0gdGhpcy5wYWNrYWdlTmFtZTtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcImdldEV4ZWNMaXN0XCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZ1enp5U2VhcmNoKHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLnR5cGUgPSBcImZ1enp5XCI7XHJcbiAgICAgICAgdGhpcy5zZWFyY2guZGIgPSB0aGlzLmRiO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLnBhY2thZ2VOYW1lID0gdGhpcy5wYWNrYWdlTmFtZTtcclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBcInNlYXJjaFwiO1xyXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IHRoaXMuc2VhcmNoO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRSb3dzKGxpbWl0OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaC5saW1pdCA9IGxpbWl0O1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLnR5cGUgPSBcImdldFJvd3NcIjtcclxuICAgICAgICB0aGlzLnNlYXJjaC5kYiA9IHRoaXMuZGI7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gucGFja2FnZU5hbWUgPSB0aGlzLnBhY2thZ2VOYW1lO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IFwic2VhcmNoXCI7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gdGhpcy5zZWFyY2g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBrZyhuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnBhY2thZ2VOYW1lID0gbmFtZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0REIobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5kYiA9IG5hbWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9yZGVyQnkoZmllbGQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoLmRpcmVjdGlvbiA9IFwiYXNjXCI7XHJcbiAgICAgICAgdGhpcy5zZWFyY2gub3JkZXJCeSA9IGZpZWxkO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc2MoKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2guZGlyZWN0aW9uID0gXCJhc2NcIjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzYygpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaC5kaXJlY3Rpb24gPSBcImRlc2NcIjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ28oKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nb0Rpc3BhdGNoZXIuc2VuZChuZXcgUGFja2V0KHRoaXMuY29tbWFuZCwgdGhpcy5wYXlsb2FkKSk7XHJcbiAgICB9XHJcbn1cclxuIiwiXHJcbmltcG9ydCBBYnN0cmFjdFR5cGllUGFja2FnZSBmcm9tIFwiLi9BYnN0cmFjdFR5cGllUGFja2FnZVwiO1xyXG5pbXBvcnQgQXBwR2xvYmFsIGZyb20gXCIuL0FwcEdsb2JhbFwiO1xyXG5pbXBvcnQgR29EaXNwYXRjaGVyIGZyb20gXCIuL0dvRGlzcGF0Y2hlclwiO1xyXG5pbXBvcnQgU2VhcmNoT2JqZWN0IGZyb20gXCIuL21vZGVscy9TZWFyY2hPYmplY3RcIjtcclxuaW1wb3J0IFR5cGllUm93SXRlbSBmcm9tIFwiLi9tb2RlbHMvVHlwaWVSb3dJdGVtXCI7XHJcbmltcG9ydCBUeXBpZSBmcm9tIFwiLi9UeXBpZVwiO1xyXG5cclxuZXhwb3J0IHtcclxuICAgIEFic3RyYWN0VHlwaWVQYWNrYWdlLFxyXG4gICAgQXBwR2xvYmFsLFxyXG4gICAgZ2V0UGF0aCxcclxuICAgIEdvRGlzcGF0Y2hlcixcclxuICAgIFR5cGllLFxyXG4gICAgVHlwaWVSb3dJdGVtLFxyXG4gICAgU2VhcmNoT2JqZWN0LFxyXG59O1xyXG5cclxuaW1wb3J0ICogYXMgaXNEZXYgZnJvbSBcImVsZWN0cm9uLWlzLWRldlwiO1xyXG5jb25zdCBnZXRQYXRoID0gKHN0YXRpY1BhdGgpID0+IHtcclxuICAgIGlmICghaXNEZXYpIHtcclxuICAgICAgICByZXR1cm4gXCIuLi9zdGF0aWMvXCIgKyBzdGF0aWNQYXRoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc3RhdGljUGF0aDtcclxuICAgIH1cclxufTtcclxuIiwiXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhY2tldCB7XHJcbiAgICBwcml2YXRlIGNvbW1hbmQgPSBcIlwiO1xyXG4gICAgcHJpdmF0ZSBwYXlsb2FkOiBvYmplY3QgPSB7fTtcclxuICAgIGNvbnN0cnVjdG9yKGNvbW1hbmQ6IHN0cmluZywgcGF5bG9hZD86IG9iamVjdCkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XHJcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZCA/IHBheWxvYWQgOiB7fTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTZWFyY2hPYmplY3Qge1xyXG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgcGtnTGlzdDogc3RyaW5nW107XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gXCJcIjtcclxuICAgICAgICB0aGlzLnBrZ0xpc3QgPSBbXTtcclxuICAgIH1cclxufVxyXG4iLCJcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoUGF5bG9hZCB7XHJcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGxpbWl0OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBvcmRlckJ5OiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgZGlyZWN0aW9uOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgcGFja2FnZU5hbWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBkYjogc3RyaW5nO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJmdXp6eVwiOyAgLy8gY2FuIGJlICdmdXp6eScgfCAnJyB8XHJcbiAgICAgICAgdGhpcy5saW1pdCA9IDEwO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiOyAgICAgICAgIC8vIHRoZSBhY3R1YWwgc2VhcmNoIHZhbHVcclxuICAgICAgICB0aGlzLm9yZGVyQnkgPSBcInNjb3JlXCI7ICAvLyB0aGUgbmFtZSBvZiB0aGUgZmllbGQgdG8gYmUgb3JkZXJlZCBieVxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gXCJkZXNjXCI7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5kYiA9IFwiXCI7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtJQWN0aW9ufSBmcm9tIFwiLi9JQWN0aW9uXCI7XHJcbmltcG9ydCB7SUxhYmVsfSBmcm9tIFwiLi9JTGFiZWxcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGllUm93SXRlbSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGF0YSk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBUeXBpZVJvd0l0ZW0oKTtcclxuICAgICAgICBpdGVtLnNldERCKGRhdGEuZGIgPyBkYXRhLmRiIDogXCJnbG9iYWxcIik7XHJcbiAgICAgICAgaXRlbS5zZXRQYWNrYWdlKGRhdGEudCk7XHJcbiAgICAgICAgaXRlbS5zZXRBY3Rpb25zKGRhdGEuYSk7XHJcbiAgICAgICAgaXRlbS5zZXRUaXRsZShkYXRhLnRpdGxlKTtcclxuICAgICAgICBpdGVtLnNldFBhdGgoZGF0YS5wKTtcclxuICAgICAgICBpdGVtLnNldERlc2NyaXB0aW9uKGRhdGEuZCk7XHJcbiAgICAgICAgaXRlbS5zZXRJY29uKGRhdGEuaSk7XHJcbiAgICAgICAgaXRlbS5zZXRDb3VudChkYXRhLmMpO1xyXG4gICAgICAgIGl0ZW0uc2V0U2NvcmUoZGF0YS5zY29yZSk7XHJcbiAgICAgICAgaXRlbS5zZXRVbml4dGltZShkYXRhLnUpO1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaXNQYWNrYWdlKGl0ZW06IFR5cGllUm93SXRlbSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBpdGVtLmQgPT09IFwiUGFja2FnZVwiXHJcbiAgICAgICAgICAgIHx8IGl0ZW0uZCA9PT0gXCJTdWJQYWNrYWdlXCJcclxuICAgICAgICAgICAgfHwgaXRlbS5wID09PSBcIlBhY2thZ2VcIlxyXG4gICAgICAgICAgICB8fCBpdGVtLnAuc3RhcnRzV2l0aChcIlN1YlBhY2thZ2V8XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkYjogc3RyaW5nO1xyXG4gICAgcHVibGljIGQ6IHN0cmluZztcclxuICAgIHB1YmxpYyBpOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdDogc3RyaW5nO1xyXG4gICAgcHVibGljIHA6IHN0cmluZztcclxuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGM6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgYT86IElBY3Rpb25bXTtcclxuICAgIHB1YmxpYyBsPzogSUxhYmVsW107XHJcbiAgICBwdWJsaWMgc2NvcmU/OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdT86IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZT86IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZGIgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuZCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5pID0gXCJcIjtcclxuICAgICAgICB0aGlzLnQgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMucCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlID8gdGl0bGUgOiBcIlwiO1xyXG4gICAgICAgIHRoaXMuYyA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFRpdGxlKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMudGl0bGUgPSB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VGl0bGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aXRsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0QWN0aW9ucyhhY3Rpb25MaXN0OiBJQWN0aW9uW10pOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuYSA9IGFjdGlvbkxpc3Q7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEFjdGlvbnMoKTogSUFjdGlvbltdIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRMYWJlbHMobGFiZWxMaXN0OiBJTGFiZWxbXSk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5sID0gbGFiZWxMaXN0O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRMYWJlbHMoKTogSUxhYmVsW10gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBhdGgodmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5wID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhdGgoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXREQih2YWx1ZTogc3RyaW5nKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLmRiID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldERCKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuZCA9IHZhbHVlID8gdmFsdWUgOiBcIlwiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREZXNjcmlwdGlvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldEljb24odmFsdWU6IHN0cmluZyk6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5pID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEljb24oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQYWNrYWdlKHZhbHVlOiBzdHJpbmcpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMudCA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYWNrYWdlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0Q291bnQodmFsdWU6IG51bWJlcik6IFR5cGllUm93SXRlbSB7XHJcbiAgICAgICAgdGhpcy5jID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY291bnRVcCgpOiBUeXBpZVJvd0l0ZW0ge1xyXG4gICAgICAgIHRoaXMuYyA9IHRoaXMuYyArIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFVuaXh0aW1lKHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLnUgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VW5peHRpbWUoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRTY29yZSh2YWx1ZTogbnVtYmVyIHwgdW5kZWZpbmVkKTogVHlwaWVSb3dJdGVtIHtcclxuICAgICAgICB0aGlzLnNjb3JlID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFNjb3JlKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NvcmU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvUGF5bG9hZCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhOiB0aGlzLmdldEFjdGlvbnMoKSxcclxuICAgICAgICAgICAgYzogdGhpcy5nZXRDb3VudCgpLFxyXG4gICAgICAgICAgICBkOiB0aGlzLmdldERlc2NyaXB0aW9uKCksXHJcbiAgICAgICAgICAgIGRiOiB0aGlzLmdldERCKCksXHJcbiAgICAgICAgICAgIGk6IHRoaXMuZ2V0SWNvbigpLFxyXG4gICAgICAgICAgICBsOiB0aGlzLmdldExhYmVscygpLFxyXG4gICAgICAgICAgICBwOiB0aGlzLmdldFBhdGgoKSxcclxuICAgICAgICAgICAgdDogdGhpcy5nZXRQYWNrYWdlKCksXHJcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLmdldFRpdGxlKCksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==