/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function setupHeaderBackground() {
	    var el = document.getElementById('header-with-changing-background');

	    if (el) {
	        var hour = moment().hour();
	        var newClass = (function (hour) {
	            if (hour >= 4 && hour < 12) {
	                return 'morning';
	            } else if (hour >= 12 && hour < 20) {
	                return 'evening';
	            } else {
	                return 'night';
	            }
	        })(hour);
	        el.className = el.className + ' ' + newClass;
	        el.setAttribute('data-midnight', 'header-' + newClass);
	    }

	    // set up midnight
	    $('.nav--main').midnight();
	}

	window.addEventListener('load', setupHeaderBackground, false);

/***/ }
/******/ ]);