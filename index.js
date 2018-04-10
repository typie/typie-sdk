(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("haste-sdk", [], factory);
	else if(typeof exports === 'object')
		exports["haste-sdk"] = factory();
	else
		root["haste-sdk"] = factory();
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
eval("\nconst getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;\nconst isEnvSet = 'ELECTRON_IS_DEV' in process.env;\n\nmodule.exports = isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\\\/]electron[\\\\/]/.test(process.execPath));\n\n\n//# sourceURL=webpack://haste-sdk/./node_modules/electron-is-dev/index.js?");

/***/ }),

/***/ "./node_modules/gonode/lib/command.js":
/*!********************************************!*\
  !*** ./node_modules/gonode/lib/command.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Copyright (c) 2013 John Granström\r\n//\r\n// Permission is hereby granted, free of charge, to any person obtaining a\r\n// copy of this software and associated documentation files (the\r\n// \"Software\"), to deal in the Software without restriction, including\r\n// without limitation the rights to use, copy, modify, merge, publish,\r\n// distribute, sublicense, and/or sell copies of the Software, and to permit\r\n// persons to whom the Software is furnished to do so, subject to the\r\n// following conditions:\r\n//\r\n// The above copyright notice and this permission notice shall be included\r\n// in all copies or substantial portions of the Software.\r\n//\r\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\r\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\r\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\r\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\r\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\r\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\r\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\r\n\r\n// Commands must be executed within a command pool to limit execution count and time.\r\n\r\nvar misc = __webpack_require__(/*! ./misc */ \"./node_modules/gonode/lib/misc.js\");\r\n\r\n// Create a command object with id, command, callback and optionally signal\r\nexports.Command = Command;\r\nfunction Command(id, cmd, callback, signal) {\r\n\t// Contain common data to be shared with go-module in .common\r\n\tthis.common = {\r\n\t\tid: id,\r\n\t\tcmd: cmd,\r\n\t\tsignal: signal === undefined ? -1: signal, // -1 is no signal\r\n\t}\r\n\t// Contain internal data not to be sent over the interface in .internal\r\n\tthis.internal = {\r\n\t\tcallback: callback,\r\n\t\texecutionStarted: false,\r\n\t\texecutionEnded: false,\r\n\t}\t\r\n}\r\n\r\n// Call to set the execution options for this command.\r\n// Default options will be added for those not provided\r\nCommand.prototype.setOptions = function(pool, options) {\r\n\tthis.internal.options = options || {};\r\n\tmisc.mergeDefaultOptions(this.internal.options, {\r\n\t\tcommandTimeoutSec: pool.go.options.defaultCommandTimeoutSec,\r\n\t});\r\n}\r\n\r\n// Execute command by sending it to go-module\r\nCommand.prototype.execute = function(pool, options) {\r\n\texecutionStarted(pool, this);\r\n\r\n\t// Send common data to go-module\r\n\tpool.go.proc.stdin.write(JSON.stringify(this.common) + '\\n'); // Write \\n to flush write buffer\t\r\n\r\n}\r\n\r\n// Handle command response and invoke callback\r\nCommand.prototype.response = function(pool, responseData) {\r\n\texecutionStopped(pool, this, responseData, {ok: true});\t\t\r\n}\r\n\r\n// Call if command reaches timeout, ends execution with timeout as result\r\nCommand.prototype.timeout = function(pool) {\r\n\texecutionStopped(pool, this, null, {timeout: true});\r\n}\r\n\r\n// Call if command is to be terminated, ends execution with terminated as result\r\nCommand.prototype.terminate = function(pool) {\r\n\texecutionStopped(pool, this, null, {terminated: true});\r\n}\r\n\r\n// Call each time the command is to be executed to update status\r\n// Handles the state of the command as well as the containing pool.\r\nfunction executionStarted(pool, cmd) {\r\n\tcmd.internal.executionStarted = true;\t\r\n\r\n\tpool.runningCommands++;\r\n\tpool.hasCommandsRunning = true;\r\n\r\n\t// Add executing command to map\r\n\tpool.commandMap[cmd.common.id] = cmd;\r\n\r\n\t// Only timeout non-signal commands\r\n\tif(cmd.common.signal === -1) {\r\n\t\tengageTimeout(pool, cmd);\r\n\t} \r\n}\r\n\r\n// Call each time the command has been received/timed out/aborted (stopped execution) to update pool status\r\n// Handles the state of the command as well as the containing pool.\r\nfunction executionStopped(pool, cmd, responseData, result) {\r\n\tif(!result.timeout) {\r\n\t\tclearTimeout(cmd.internal.timeout); // Stop timeout timer\r\n\t}\t\r\n\tcmd.internal.executionEnded = true;\r\n\r\n\tpool.runningCommands--;\r\n\tif(pool.runningCommands <= 0) {\r\n\t\tpool.runningCommands = 0; // To be safe\r\n\t\tpool.hasCommandsRunning = false;\r\n\t\tpool.enteredIdle(); // Pool is now idle\r\n\t}\r\n\r\n\t// Since command is now done we delete it from the commandMap\t\r\n\tdelete pool.commandMap[cmd.common.id];\r\n\tpool.workQueue(); // Will be added to event loop\r\n\r\n\t// Invoke callback last\r\n\tif(cmd.internal.callback !== undefined && cmd.internal.callback !== null) {\r\n\t\tvar responseResult = {\r\n\t\t\tok: result.ok === true,\r\n\t\t\ttimeout: result.timeout === true,\r\n\t\t\tterminated: result.terminated === true,\r\n\t\t}\r\n\t\tcmd.internal.callback(responseResult, responseData);\r\n\t}\r\n}\r\n\r\n// Activate timeout timer to abort commands running for too long\r\n// Calls executionStopped upon timeout.\r\nfunction engageTimeout(pool, cmd) {\r\n\tcmd.internal.timeout = setTimeout(function() {\t\t\r\n\t\t// Command timed out, abort execution\r\n\t\tcmd.timeout(pool);\r\n\t}, cmd.internal.options.commandTimeoutSec * 1000);\r\n}\r\n\r\n// Common signals\r\nexports.Signals = {\r\n\tTermination: new Command(0, null, null, 1),\r\n}\n\n//# sourceURL=webpack://haste-sdk/./node_modules/gonode/lib/command.js?");

/***/ }),

/***/ "./node_modules/gonode/lib/commandpool.js":
/*!************************************************!*\
  !*** ./node_modules/gonode/lib/commandpool.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Copyright (c) 2013 John Granström\r\n//\r\n// Permission is hereby granted, free of charge, to any person obtaining a\r\n// copy of this software and associated documentation files (the\r\n// \"Software\"), to deal in the Software without restriction, including\r\n// without limitation the rights to use, copy, modify, merge, publish,\r\n// distribute, sublicense, and/or sell copies of the Software, and to permit\r\n// persons to whom the Software is furnished to do so, subject to the\r\n// following conditions:\r\n//\r\n// The above copyright notice and this permission notice shall be included\r\n// in all copies or substantial portions of the Software.\r\n//\r\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\r\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\r\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\r\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\r\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\r\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\r\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\r\n\r\nconst commandIdLimit = 1e9;\r\n\r\nvar misc = __webpack_require__(/*! ./misc */ \"./node_modules/gonode/lib/misc.js\"),\r\n\tQueue = __webpack_require__(/*! ./queue */ \"./node_modules/gonode/lib/queue.js\").Queue,\t\r\n\tCommand = __webpack_require__(/*! ./command */ \"./node_modules/gonode/lib/command.js\").Command;\r\n\r\nexports.CommandPool = CommandPool;\r\nfunction CommandPool(go) {\r\n\tthis.go = go;\r\n\tthis.commandMap = {},\r\n\tthis.nextCommandId = 0;\r\n\tthis.runningCommands = 0;\r\n\tthis.hasCommandsRunning = false;\r\n\r\n\tthis.idleCmdWaiting = null; // Provide the ability to execute a command upon next idle\r\n\t\r\n\tthis.commandQueue = new Queue();\r\n}\r\n\r\n// Plan the execution of a command and set execution options.\r\n// None prioritized commands may be queued instead of directly executed if exceeding command limit.\r\nCommandPool.prototype.planExecution = function(cmd, prioritized, options) {\r\n\tcmd.setOptions(this, options);\r\n\t// If command not prioritized make sure it does not exceed command limit\r\n\t//console.log(this.go.options.maxCommandsRunning)\t\r\n\texecuteCommand(this, cmd, prioritized);\r\n}\r\n\r\n// Handle JSON response and process command callback and end of execution \r\n// Also manage the queue if required. \r\nCommandPool.prototype.handleResponse = function(response) {\r\n\tvar respCmd = this.commandMap[response.id]\r\n\tif(respCmd !== undefined) {\r\n\t\trespCmd.response(this, response.data);\t\r\n\t} else {\r\n\t\t// Command may have timed out or otherwise aborted so we throw the response away\r\n\t}\t\r\n}\r\n\r\n// Create a command with specified data and callback with new ID\r\nCommandPool.prototype.createCommand = function(data, callback) {\r\n\tcmd = new Command(this.nextCommandId, data, callback);\r\n\tincrementCommandId(this);\r\n\treturn cmd;\r\n}\r\n\r\n// Check if commands are queued, and if so execute them on next event loop\r\nCommandPool.prototype.workQueue = function() {\r\n\tif(!this.commandQueue.isEmpty()) { // Check if queue is empty first\r\n\t\tvar pool = this;\r\n\t\t// Dequeue command here not on nextTick() to avoid multiple dequeues for same item\r\n\t\tvar nextCmd = pool.commandQueue.dequeue();\r\n\t\tprocess.nextTick(function() { // Execute next commands on next tick\r\n\t\t\texecuteCommand(pool, nextCmd, false);\r\n\t\t});\r\n\t}\r\n}\r\n\r\n// Plan a single command to be run the next time the command pool is idle\r\n// (no running commands). Calling this several times without having an idle period\r\n// will overwrite any previously planned on idle commands\r\nCommandPool.prototype.planOnIdle = function(cmd, prioritized, options) {\r\n\tthis.idleCmdWaiting = {\r\n\t\tcmd: cmd,\r\n\t\tprioritized: prioritized,\r\n\t\toptios: options,\r\n\t};\r\n\t// If there's no commands running, execute it right away\r\n\tif(!this.hasCommandsRunning) {\r\n\t\texecuteWaitingCommand(this);\r\n\t}\r\n}\r\n\r\n// Call when pool has entered idle, i.e. has no commands running as of now\r\nCommandPool.prototype.enteredIdle = function() {\r\n\t// Check if there's a command waiting for idle\r\n\tif(this.idleCmdWaiting != null) {\r\n\t\t// Execute waiting command on next tick\r\n\t\tvar self = this;\r\n\t\tprocess.nextTick(function() {\r\n\t\t\texecuteWaitingCommand(self);\r\n\t\t});\r\n\t}\r\n}\r\n\r\n// Causes all running commands to timeout\r\nCommandPool.prototype.terminate = function() {\r\n\tthis.commandQueue.clear(); // Clear command queue\r\n\tthis.idleCmdWaiting = null; // Throw away any waiting command\r\n\r\n\tfor(var cmdId in this.commandMap) {\r\n\t\tvar cmd = this.commandMap[cmdId];\r\n\t\tif(cmd.internal.executionStarted && !cmd.internal.executionEnded) {\r\n\t\t\tcmd.terminate(this);\r\n\t\t}\r\n\t}\r\n}\r\n\r\n// Execute a command if does not exceed command count limit and command queue is empty\r\n// otherwise queue command for later execution.\r\nfunction executeCommand(pool, cmd, prioritized) {\r\n\tif(!prioritized && (pool.runningCommands >= pool.go.options.maxCommandsRunning)) {\r\n\t\t// Exceeds limit, queue command instead of running\r\n\t\tpool.commandQueue.enqueue(cmd);\r\n\t} else {\r\n\t\t// Execute command\t\r\n\t\tcmd.execute(pool);\t\r\n\t}\r\n}\r\n\r\n// Reset nextCommandId if growing past limit\r\n// Limit should be set high enough so that the old command for ID 0\r\n// most likely has responded or timed out and will not conflict with new ones.\r\nfunction incrementCommandId(pool) {\r\n\tif(pool.nextCommandId++ >= commandIdLimit) {\r\n\t\tpool.nextCommandId = 0;\r\n\t}\r\n}\r\n\r\n// Execute a command planned to run on next idle\r\nfunction executeWaitingCommand(pool) {\r\n\tvar toExecute = pool.idleCmdWaiting;\r\n\tpool.idleCmdWaiting = null;\r\n\tpool.planExecution(toExecute.cmd,\r\n\t\ttoExecute.prioritized,\r\n\t\ttoExecute.options\r\n\t);\r\n}\n\n//# sourceURL=webpack://haste-sdk/./node_modules/gonode/lib/commandpool.js?");

/***/ }),

/***/ "./node_modules/gonode/lib/gonode.js":
/*!*******************************************!*\
  !*** ./node_modules/gonode/lib/gonode.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Copyright (c) 2013 John Granström\r\n//\r\n// Permission is hereby granted, free of charge, to any person obtaining a\r\n// copy of this software and associated documentation files (the\r\n// \"Software\"), to deal in the Software without restriction, including\r\n// without limitation the rights to use, copy, modify, merge, publish,\r\n// distribute, sublicense, and/or sell copies of the Software, and to permit\r\n// persons to whom the Software is furnished to do so, subject to the\r\n// following conditions:\r\n//\r\n// The above copyright notice and this permission notice shall be included\r\n// in all copies or substantial portions of the Software.\r\n//\r\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\r\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\r\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\r\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\r\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\r\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\r\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\r\n\r\nvar spawn = __webpack_require__(/*! child_process */ \"child_process\").spawn,\r\n\tutil = __webpack_require__(/*! util */ \"util\"),\r\n\tfs = __webpack_require__(/*! fs */ \"fs\"),\t\r\n\tmisc = __webpack_require__(/*! ./misc */ \"./node_modules/gonode/lib/misc.js\"),\r\n\tEventEmitter = __webpack_require__(/*! events */ \"events\").EventEmitter,\r\n\tCommandPool = __webpack_require__(/*! ./commandpool */ \"./node_modules/gonode/lib/commandpool.js\").CommandPool\t\r\n\tSignals = __webpack_require__(/*! ./command */ \"./node_modules/gonode/lib/command.js\").Signals;\r\n\r\n// Create a new Go-object for the specified .go-file.\r\n// Will also intialize Go-object if second parameter is true.\r\n//\r\n// Throws error if no path provided to .go-file.\r\nutil.inherits(Go, EventEmitter);\r\nexports.Go = Go;\r\nfunction Go(options, callback) {\r\n\tif(options === undefined || options === null) {\r\n\t\tmisc.raiseError('No options provided.')\r\n\t}\r\n\tif(options.path == undefined || options.path == null) {\r\n\t\tmisc.raiseError('No path provided to .go-file.');\r\n\t}\r\n\r\n\tmisc.mergeDefaultOptions(options, {\r\n\t\tmaxCommandsRunning: 10,\r\n\t\tdefaultCommandTimeoutSec: 5,\r\n\t\tcwd: process.cwd(),\r\n\t});\r\n\tthis.options = options;\r\n\r\n\tthis.goFile = options.path;\r\n\tthis.proc = null;\r\n\tthis.initialized = false; // true when Go has been initialized, back to false when Go closes\r\n\tthis.closePending = false; // true when close() has been called and no more commands should be planned\r\n\tthis.terminatePending = false; // true when terminate() has been called\r\n\tthis.commandPool = new CommandPool(this)\r\n\r\n\tif(options.initAtOnce) {\r\n\t\tthis.init(callback);\r\n\t}\r\n}\r\n\r\n// Initialize by launching go process and prepare for commands.\r\n// Do as early as possible to avoid delay when executing first command.\r\n//\r\n// callback has parameters (err)\r\nGo.prototype.init = function(callback) {\t\t\r\n\tvar self = this;\r\n\tfs.exists(this.goFile, function(exists) {\r\n\t\tif(!exists) {\t\r\n\t\t\tmisc.callbackIfAvailable(callback, misc.getError('.go-file not found for given path.'));\r\n\t\t\treturn;\r\n\t\t}\r\n\r\n\t\t// simple extension check to detect if its a un compiles .go file\r\n\t\tif (self.goFile.slice(-3).toLowerCase() === '.go') {\r\n\t\t\t// Spawn go process within current working directory\r\n\t\t\tself.proc = spawn('go', ['run', self.goFile], { cwd: self.options.cwd, env: process.env });\r\n\t\t} else {\r\n\t\t\t// Spawn go compiled file\r\n\t\t\tself.proc = spawn( self.goFile, [], { cwd: self.options.cwd, env: process.env });\r\n\t\t}\r\n\r\n\r\n\t\t// Setup handlers\r\n\t\tself.proc.stdout.on('data', function(data){\r\n\t\t\thandleStdout(self, data);\r\n\t\t});\r\n\t\tself.proc.stderr.on('data', function(data){\r\n\t\t\thandleErr(self, data, false);\r\n\t\t});\r\n\t\tself.proc.on('close', function(){\r\n\t\t\thandleClose(self);\r\n\t\t});\t\t\r\n\r\n\t\t// Init complete\r\n\t\tself.initialized = true;\r\n\t\tmisc.callbackIfAvailable(callback, null);\r\n\t});\r\n}\r\n\r\n// Gracefully close Go by sending termination signal after all executing commands\r\n// has ended their execution.\r\n// Returns true if close has been started, or false if Go is not initialized or if it\r\n// already has a close pending.\r\nGo.prototype.close = function() {\r\n\tif(this.initialized && !this.closePending && !this.terminatePending) {\r\n\t\tthis.closePending = true;\r\n\t\t// Send prioritized termination signal\r\n\t\tthis.commandPool.planOnIdle(Signals.Termination, true);\r\n\r\n\t\treturn true;\r\n\t} else {\r\n\t\treturn false;\r\n\t}\r\n}\r\n\r\n// Hard terminate by sending termination on all commands and termination signal to Go\r\n// Returns true if termination has been started, or false if Go is not initialized or if it\r\n// already has a termination pending.\r\nGo.prototype.terminate = function() {\r\n\treturn terminate(this, true);\r\n}\r\n\r\n// Create and execute or queue a command of JSON data\r\n// Will not queue command if Go is not initialized or has been closed (or close pending)\r\n// Takes parameters:\r\n// \t\tdata (required) - actual command JSON\r\n//\t\tcallback (required) - the callback to call with possible result when execution ends\r\n//\t\toptions (optional) - overrides default execution options\r\n// Returns true if the command was planned for execution, otherwise false.\r\nGo.prototype.execute = function(data, callback, options) {\t\r\n\tif(this.initialized && !this.closePending && !this.terminatePending) {\r\n\t\t// Important to not leave go in an infinite loop eatig cpu\r\n\t\ttry { // Contain outer exceptions and close go before rethrowing exception.\r\n\t\t\tthis.commandPool.planExecution(this.commandPool.createCommand(data, callback), false, options);\t\r\n\t\t} catch (e) {\r\n\t\t\thandleErr(this, e, false);\r\n\t\t}\r\n\t\treturn true; // Return true since the command has been planned for execution\r\n\t} else {\r\n\t\treturn false; // The command wasn't planned for execution, return false\r\n\t}\r\n}\r\n\r\n// reset the bufferData with an empty string\r\nvar bufferData = \"\";\r\n\r\n// Receive data from go-module\r\nfunction handleStdout(go, data) {\r\n\r\n\t// append data to the buffer for every stdout\r\n    bufferData += data.toString();\r\n\r\n    // if reached the end of the message in the stdout parse it\r\n\t// and reset the buffer for the next stdout\r\n    if (bufferData.endsWith(\"\\n\")) {\r\n        // Response may be several command responses separated by new lines\r\n        bufferData.toString().split(\"\\n\").forEach(function(resp) {\r\n            // Discard empty lines\r\n            if(resp.length > 0) {\r\n                // Parse each command response with a event-loop in between to avoid blocking\r\n                process.nextTick(function(){parseResponse(go, resp)});\r\n            }\r\n        });\r\n        bufferData = \"\";\r\n    }\r\n}\r\n\r\n// Parse a _single_ command response as JSON and handle it\r\n// If parsing fails a internal error event will be emitted with the response data\r\nfunction parseResponse(go, resp) {\r\n\tvar parsed;\r\n\ttry {\r\n\t\tparsed = JSON.parse(resp);\r\n\t} catch (e) {\t\t\r\n\t\thandleErr(go, resp, true);\r\n\t\treturn;\r\n\t}\r\n\r\n\t// Important to not leave go in an infinite loop eatig cpu\r\n\ttry { // Contain outer exceptions and close go before rethrowing exception.\r\n\t\tgo.commandPool.handleResponse(parsed) // Handle response outside throw to avoid catching those exceptions\t\r\n\t} catch (e) {\r\n\t\thandleErr(go, e, false);\r\n\t}\t\r\n}\r\n\r\n// Emit error event on go instance, pass through raw error data\r\n// Errors may either be internal parser errors or external errors received from stderr\r\nfunction handleErr(go, data, parser) {\t\r\n\tif(!parser) { // If external error, terminate all commands\r\n\t\tterminate(go, false);\r\n\t}\r\n\r\n\tif(go.listeners('error').length > 0) { // Only emit event if there are listeners\r\n\t\tprocess.nextTick(function() {\r\n\t\t\t// Emit any event on next tick\r\n\t\t\tgo.emit('error', {parser: parser, data: data});\r\n\t\t});\r\n\t}\t\r\n}\r\n\r\n// Go panic and process ends causes calls to this\r\n// Emit close event on go instance\r\nfunction handleClose(go) {\r\n\t// If process closes we set initialized to false to avoid invalid close() or execute()\t\r\n\tgo.initialized = false;\r\n\tif(go.listeners('close').length > 0) { // Only emit event if there are listeners\r\n\t\tgo.emit('close');\r\n\t}\t\t\r\n}\r\n\r\n// Terminate by sending termination on all commands.\r\n// If called with true it will also directly try to send a termination signal to go\r\nfunction terminate(go, withSignal) {\r\n\tif(go.initialized && !go.terminatePending) {\r\n\t\tgo.terminatePending = true;\r\n\r\n\t\t// Do the actual termination asynchronously\r\n\t\t// Callbacks will be each terminated command or nothing\r\n\t\tprocess.nextTick(function(){\r\n\t\t\t// Tell command pool to kill all commands\r\n\t\t\tgo.commandPool.terminate();\t\t\t\r\n\r\n\t\t\t// Send signal after command pool termination, otherwise it would\r\n\t\t\t// be removed by terminate()\r\n\t\t\tif(withSignal) {\t\t\t\t\t\r\n\t\t\t\tgo.commandPool.planExecution(Signals.Termination, true);\t\t\t\t\r\n\t\t\t}\r\n\t\t});\r\n\r\n\t\treturn true;\r\n\t} else {\r\n\t\treturn false;\r\n\t}\t\r\n}\n\n//# sourceURL=webpack://haste-sdk/./node_modules/gonode/lib/gonode.js?");

/***/ }),

/***/ "./node_modules/gonode/lib/misc.js":
/*!*****************************************!*\
  !*** ./node_modules/gonode/lib/misc.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Copyright (c) 2013 John Granström\r\n//\r\n// Permission is hereby granted, free of charge, to any person obtaining a\r\n// copy of this software and associated documentation files (the\r\n// \"Software\"), to deal in the Software without restriction, including\r\n// without limitation the rights to use, copy, modify, merge, publish,\r\n// distribute, sublicense, and/or sell copies of the Software, and to permit\r\n// persons to whom the Software is furnished to do so, subject to the\r\n// following conditions:\r\n//\r\n// The above copyright notice and this permission notice shall be included\r\n// in all copies or substantial portions of the Software.\r\n//\r\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\r\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\r\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\r\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\r\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\r\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\r\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\r\n\r\n// Contains general helpers\r\n\r\n// Invoke callback if not undefined with provided parameter\r\nexports.callbackIfAvailable = function(callback, param) {\r\n\tif(typeof callback != undefined) {\r\n\t\tcallback(param);\r\n\t}\r\n}\r\n\r\nexports.raiseError = function(error) {\r\n\tthrow getError(error);\r\n}\r\n\r\nexports.getError = function(error) {\r\n\treturn new Error('gonode: ' + error);\r\n}\r\n\r\n// Make sure options not provided are set to default values \r\nexports.mergeDefaultOptions = function(options, defaults) {\r\n\tfor (opt in defaults) {\r\n\t\tif(options[opt] === undefined) {\r\n\t\t\toptions[opt] = defaults[opt];\r\n\t\t} \r\n\t}\r\n}\n\n//# sourceURL=webpack://haste-sdk/./node_modules/gonode/lib/misc.js?");

/***/ }),

/***/ "./node_modules/gonode/lib/queue.js":
/*!******************************************!*\
  !*** ./node_modules/gonode/lib/queue.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Copyright (c) 2013 John Granström\r\n//\r\n// Permission is hereby granted, free of charge, to any person obtaining a\r\n// copy of this software and associated documentation files (the\r\n// \"Software\"), to deal in the Software without restriction, including\r\n// without limitation the rights to use, copy, modify, merge, publish,\r\n// distribute, sublicense, and/or sell copies of the Software, and to permit\r\n// persons to whom the Software is furnished to do so, subject to the\r\n// following conditions:\r\n//\r\n// The above copyright notice and this permission notice shall be included\r\n// in all copies or substantial portions of the Software.\r\n//\r\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\r\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\r\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\r\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\r\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\r\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\r\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\r\n\r\nexports.Queue = Queue;\r\nfunction Queue() {\r\n\tthis.arr = [];\r\n}\r\n\r\nQueue.prototype.enqueue = function(element) {\r\n\tthis.arr.push(element);\r\n}\r\n\r\nQueue.prototype.dequeue = function() {\r\n\treturn this.arr.shift();\r\n}\r\n\r\nQueue.prototype.getLength = function() {\r\n\treturn this.arr.length;\r\n}\r\n\r\nQueue.prototype.isEmpty = function() {\r\n\treturn this.getLength() === 0;\r\n}\r\n\r\nQueue.prototype.clear = function() {\r\n\tthis.arr.length = 0;\r\n}\n\n//# sourceURL=webpack://haste-sdk/./node_modules/gonode/lib/queue.js?");

/***/ }),

/***/ "./src/AbstractHastePackage.ts":
/*!*************************************!*\
  !*** ./src/AbstractHastePackage.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(__dirname) {\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst index_1 = __webpack_require__(/*! ./index */ \"./src/index.ts\");\nconst Path = __webpack_require__(/*! path */ \"path\");\nconst defaultIcon = 'pkg-icon.png';\nclass AbstractHastePackage {\n    constructor(win, config, pkgPath) {\n        this.win = win;\n        this.packageData = { name: this.constructor.name, path: __dirname };\n        this.packageName = this.constructor.name;\n        this.pkgConfig = config;\n        this.packagePath = pkgPath;\n        this.icon = index_1.getPath(pkgPath + defaultIcon);\n        /**\n         * @type {Haste}\n         */\n        this.haste = null;\n        this.loadConfig();\n    }\n    getPackageName() {\n        return this.packageName;\n    }\n    getDefaultItem(value, description = \"\", path = \"\", icon = \"\") {\n        let item = new index_1.HasteRowItem();\n        item.setTitle(value);\n        item.setPath(path ? path : value);\n        item.setIcon(icon ? icon : this.icon);\n        item.setDescription(description ? description : \"\");\n        return item;\n    }\n    insert(value, description = \"\", path = \"\", icon = \"\") {\n        this.insertItem(this.getDefaultItem(value, description, path, icon));\n    }\n    insertItem(item) {\n        this.haste.insert(item).go()\n            .then(data => console.log(data))\n            .catch(err => console.error(err));\n    }\n    search(searchObj, callback) {\n        this.haste.fuzzySearch(searchObj.value).orderBy('score').desc().go()\n            .then(data => callback(data))\n            .catch(err => console.log(err));\n    }\n    activate(rowItem, callback) { console.error('No override \"action\" method found in ' + this.packageName); }\n    //remove(rowItem: HasteRowItem, callback: Function) {console.error('No override \"remove\" method found in ' + this.packageName)}\n    activateUponEntry() {\n        console.log(\"No override 'activateUponEntry' method found in \" + this.packageName);\n    }\n    getIcon(icon) {\n        return Path.join(this.packagePath, icon);\n    }\n    loadConfig() {\n        //console.log(\"No override 'loadConfig' method found in \" + this.packageName);\n        if (this.pkgConfig.shortcut) {\n            console.log('registering shortcut ' + this.pkgConfig.shortcut + ' to ' + this.getPackageName());\n            this.win.registerKey(this.pkgConfig.shortcut, () => {\n                this.win.send('changePackage', [this.getPackageName()]);\n                this.activateUponEntry();\n            });\n        }\n    }\n    destroy() {\n        console.log('destroying the package!');\n        console.log('unregister', this.pkgConfig);\n        if (this.pkgConfig.shortcut) {\n            this.win.unregisterKey(this.pkgConfig.shortcut);\n        }\n    }\n}\nexports.default = AbstractHastePackage;\n\n/* WEBPACK VAR INJECTION */}.call(this, \"/\"))\n\n//# sourceURL=webpack://haste-sdk/./src/AbstractHastePackage.ts?");

/***/ }),

/***/ "./src/GoDispatcher.ts":
/*!*****************************!*\
  !*** ./src/GoDispatcher.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst gonode_1 = __webpack_require__(/*! gonode */ \"./node_modules/gonode/lib/gonode.js\");\nclass GoDispatcher {\n    static startListen() {\n        console.log('Starting Haste Service');\n        //GoDispatcher.go = new Go({path: \"C:\\\\projects\\\\Go\\\\src\\\\haste\\\\main.go\"});\n        GoDispatcher.go = new gonode_1.Go({\n            path: \"C:\\\\projects\\\\Go\\\\src\\\\haste\\\\haste.exe\",\n            //path: path.normalize(\"/Users/rotemgrimberg/go/src/haste-go/haste-go\"),\n            defaultCommandTimeoutSec: 60,\n            maxCommandsRunning: 10,\n        });\n        //GoDispatcher.go = new Go({path: \"static/bin/haste/haste-go\"});\n        //GoDispatcher.go = new Go({path: path.normalize(\"/Users/rotemgrimberg/go/src/haste-go/haste-go\")});\n        GoDispatcher.go.init(this.register); // We must always initialize gonode before executing any commands\n    }\n    static send(packet) {\n        //let sendTime = Date.now();\n        //console.log('packet', packet);\n        return new Promise((resolve, reject) => {\n            GoDispatcher.go.execute(packet, (result, response) => {\n                //console.log('got back', response);\n                if (result.ok) {\n                    //console.log('golang time: ', Date.now() - sendTime);\n                    if (response.data) {\n                        response.data = JSON.parse(response.data);\n                    }\n                    return resolve(response);\n                }\n                return reject(response);\n            });\n        });\n    }\n    static close() {\n        GoDispatcher.go.close();\n        GoDispatcher.listening = false;\n    }\n    static register() {\n        GoDispatcher.go.execute({ command: 'start' }, (result, response) => {\n            if (result.ok) { // Check if response is ok\n                // In our case we just echo the command, so we can get our text back\n                console.log('Haste responded: ', response);\n                if (response.err == 0) {\n                    GoDispatcher.listening = true;\n                }\n            }\n        });\n    }\n}\nGoDispatcher.listening = false;\nexports.default = GoDispatcher;\n\n\n//# sourceURL=webpack://haste-sdk/./src/GoDispatcher.ts?");

/***/ }),

/***/ "./src/Haste.ts":
/*!**********************!*\
  !*** ./src/Haste.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst GoDispatcher_1 = __webpack_require__(/*! ./GoDispatcher */ \"./src/GoDispatcher.ts\");\nconst Packet_1 = __webpack_require__(/*! ./models/Packet */ \"./src/models/Packet.ts\");\nconst SearchPayload_1 = __webpack_require__(/*! ./models/SearchPayload */ \"./src/models/SearchPayload.ts\");\nclass Haste {\n    constructor(packageName, db) {\n        this._search = new SearchPayload_1.default;\n        this.db = db ? db : packageName;\n        this.packageName = packageName;\n        this.command = '';\n        this.payload = {};\n    }\n    pasteText() {\n        this.command = 'pasteText';\n        this.payload = {};\n        return this;\n    }\n    addCollection() {\n        this.command = 'addCollection';\n        this.payload = { name: this.packageName };\n        return this;\n    }\n    updateCalled(item) {\n        item.countUp();\n        return this.insert(item, true);\n    }\n    multipleInsert(itemList) {\n        this.command = 'multipleInsert';\n        this.payload = itemList;\n        return this;\n    }\n    insert(item, persist = true) {\n        item.setDB(this.db);\n        item.setPackage(this.packageName);\n        this.command = persist ? 'insertPersist' : 'insert';\n        this.payload = item.toPayload();\n        return this;\n    }\n    getKey(value) {\n        this.payload.value = value;\n        this.payload.db = this.db;\n        this.payload.packageName = this.packageName;\n        this.command = 'getKey';\n        return this;\n    }\n    getExecList() {\n        this.payload.db = this.db;\n        this.payload.packageName = this.packageName;\n        this.command = 'getExecList';\n        return this;\n    }\n    fuzzySearch(value) {\n        this._search.value = value;\n        this._search.type = 'fuzzy';\n        this._search.db = this.db;\n        this._search.packageName = this.packageName;\n        this.command = 'search';\n        this.payload = this._search;\n        return this;\n    }\n    getRows(limit) {\n        this._search.limit = limit;\n        this._search.type = 'getRows';\n        this._search.db = this.db;\n        this._search.packageName = this.packageName;\n        this.command = 'search';\n        this.payload = this._search;\n        return this;\n    }\n    setPkg(name) {\n        this.packageName = name;\n        return this;\n    }\n    setDB(name) {\n        this.db = name;\n        return this;\n    }\n    orderBy(field) {\n        this._search.direction = 'asc';\n        this._search.orderBy = field;\n        return this;\n    }\n    asc() {\n        this._search.direction = 'asc';\n        return this;\n    }\n    desc() {\n        this._search.direction = 'desc';\n        return this;\n    }\n    go() {\n        let packet = new Packet_1.default(this.command, this.payload);\n        return GoDispatcher_1.default.send(packet);\n    }\n    mouse() {\n        return {\n            up() {\n                GoDispatcher_1.default.send(new Packet_1.default(\"mouseMovement\", { direction: \"up\" })).then().catch();\n            },\n            down() {\n                GoDispatcher_1.default.send(new Packet_1.default(\"mouseMovement\", { direction: \"down\" })).then().catch();\n            },\n            left() {\n                GoDispatcher_1.default.send(new Packet_1.default(\"mouseMovement\", { direction: \"left\" })).then().catch();\n            },\n            right() {\n                GoDispatcher_1.default.send(new Packet_1.default(\"mouseMovement\", { direction: \"right\" })).then().catch();\n            }\n        };\n    }\n}\nexports.default = Haste;\n\n\n//# sourceURL=webpack://haste-sdk/./src/Haste.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst AbstractHastePackage_1 = __webpack_require__(/*! ./AbstractHastePackage */ \"./src/AbstractHastePackage.ts\");\nexports.AbstractHastePackage = AbstractHastePackage_1.default;\nconst HasteRowItem_1 = __webpack_require__(/*! ./models/HasteRowItem */ \"./src/models/HasteRowItem.ts\");\nexports.HasteRowItem = HasteRowItem_1.default;\nconst SearchObject_1 = __webpack_require__(/*! ./models/SearchObject */ \"./src/models/SearchObject.ts\");\nexports.SearchObject = SearchObject_1.default;\nconst GoDispatcher_1 = __webpack_require__(/*! ./GoDispatcher */ \"./src/GoDispatcher.ts\");\nexports.GoDispatcher = GoDispatcher_1.default;\nconst Haste_1 = __webpack_require__(/*! ./Haste */ \"./src/Haste.ts\");\nexports.Haste = Haste_1.default;\nconst isDev = __webpack_require__(/*! electron-is-dev */ \"./node_modules/electron-is-dev/index.js\");\nlet getPath = function (staticPath) {\n    if (!isDev) {\n        return '../static/' + staticPath;\n    }\n    else {\n        return staticPath;\n    }\n};\nexports.getPath = getPath;\n\n\n//# sourceURL=webpack://haste-sdk/./src/index.ts?");

/***/ }),

/***/ "./src/models/HasteRowItem.ts":
/*!************************************!*\
  !*** ./src/models/HasteRowItem.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass HasteRowItem {\n    constructor(title) {\n        this.db = \"\";\n        this.d = \"\";\n        this.i = \"\";\n        this.t = \"\";\n        this.p = \"\";\n        this.title = title ? title : \"\";\n        this.c = 0;\n    }\n    setTitle(value) {\n        this.title = value;\n    }\n    getTitle() {\n        return this.title;\n    }\n    setPath(value) {\n        this.p = value;\n    }\n    getPath() {\n        return this.p;\n    }\n    setDB(value) {\n        this.db = value;\n    }\n    getDB() {\n        return this.db;\n    }\n    setDescription(value) {\n        this.d = value ? value : \"\";\n    }\n    getDescription() {\n        return this.d;\n    }\n    setIcon(value) {\n        this.i = value;\n    }\n    getIcon() {\n        return this.i;\n    }\n    setPackage(value) {\n        this.t = value;\n    }\n    getPackage() {\n        return this.t;\n    }\n    setCount(value) {\n        this.c = value;\n    }\n    getCount() {\n        return this.c;\n    }\n    countUp() {\n        this.c = this.c + 1;\n    }\n    setUnixtime(value) {\n        this.u = value;\n    }\n    getUnixtime() {\n        return this.u;\n    }\n    setScore(value) {\n        this.score = value;\n    }\n    getScore() {\n        return this.score;\n    }\n    static create(data) {\n        let item = new HasteRowItem();\n        item.setDB(data.db);\n        item.setPackage(data.t);\n        item.setTitle(data.title);\n        item.setPath(data.p);\n        item.setDescription(data.d);\n        item.setIcon(data.i);\n        item.setCount(data.c);\n        item.setScore(data.score);\n        item.setUnixtime(data.u);\n        return item;\n    }\n    toPayload() {\n        return {\n            db: this.getDB(),\n            t: this.getPackage(),\n            title: this.getTitle(),\n            p: this.getPath(),\n            d: this.getDescription(),\n            i: this.getIcon(),\n            c: this.getCount(),\n        };\n    }\n}\nexports.default = HasteRowItem;\n\n\n//# sourceURL=webpack://haste-sdk/./src/models/HasteRowItem.ts?");

/***/ }),

/***/ "./src/models/Packet.ts":
/*!******************************!*\
  !*** ./src/models/Packet.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass Packet {\n    constructor(command, payload) {\n        this.command = '';\n        this.payload = {};\n        this.command = command;\n        this.payload = payload ? payload : {};\n    }\n}\nexports.default = Packet;\n\n\n//# sourceURL=webpack://haste-sdk/./src/models/Packet.ts?");

/***/ }),

/***/ "./src/models/SearchObject.ts":
/*!************************************!*\
  !*** ./src/models/SearchObject.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass SearchObject {\n    constructor() {\n        this.value = '';\n        this.pkgList = [];\n    }\n}\nexports.default = SearchObject;\n\n\n//# sourceURL=webpack://haste-sdk/./src/models/SearchObject.ts?");

/***/ }),

/***/ "./src/models/SearchPayload.ts":
/*!*************************************!*\
  !*** ./src/models/SearchPayload.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass SearchPayload {\n    constructor() {\n        this.type = 'fuzzy'; // can be 'fuzzy' | '' |\n        this.limit = 10;\n        this.value = ''; // the actual search valu\n        this.orderBy = 'score'; // the name of the field to be ordered by\n        this.direction = 'desc';\n        this.packageName = '';\n        this.db = '';\n    }\n}\nexports.default = SearchPayload;\n\n\n//# sourceURL=webpack://haste-sdk/./src/models/SearchPayload.ts?");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"child_process\");\n\n//# sourceURL=webpack://haste-sdk/external_%22child_process%22?");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"events\");\n\n//# sourceURL=webpack://haste-sdk/external_%22events%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack://haste-sdk/external_%22fs%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack://haste-sdk/external_%22path%22?");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"util\");\n\n//# sourceURL=webpack://haste-sdk/external_%22util%22?");

/***/ })

/******/ });
});