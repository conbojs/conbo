/*! 
 * ConboJS: Lightweight MVx application framework for JavaScript
 * http://conbo.mesmotronic.com/
 * 
 * Copyright (c) 2017 Mesmotronic Limited
 * Released under the MIT license
 * http://www.mesmotronic.com/legal/mit
 */

/**
 * @private
 */
var __namespaces = {};

/**
 * ConboJS is a lightweight MVx application framework for JavaScript featuring 
 * dependency injection, context and encapsulation, data binding, command 
 * pattern and an event model which enables callback scoping and consistent 
 * event handling
 * 
 * All ConboJS classes, methods and properties live within the conbo namespace
 * 
 * @namespace 	conbo
 */

/**
 * Create or access a ConboJS namespace
 * 
 * @variation	2
 * @function	conbo
 * @param		{string}	namespace - The selected namespace
 * @param		{...*}		[globals] - Globals to minify followed by function to execute, with each of the globals as parameters
 * @returns		{conbo.Namespace}
 * 			
 * @example
 * // Conbo can replace the standard minification pattern with modular namespace definitions
 * // If an Object is returned, its contents will be added to the namespace
 * conbo('com.example.namespace', window, document, conbo, function(window, document, conbo, undefined)
 * {
 *  // The executed function is scoped to the namespace
 * 	var ns = this;
 * 	
 * 	// ... Your code here ...
 * 
 * 	// Optionally, return an Object containing values to be added to the namespace
 *  return { MyApp, MyView };
 * });  
 * 
 * @example
 * // Retrieve a namespace and import classes defined elsewhere
 * var ns = conbo('com.example.namespace');
 * ns.import({ MyApp, MyView });
 */
var conbo = function(namespace)
{
	if (!namespace || !conbo.isString(namespace))
	{
		namespace = 'default';
		return;
	}

	if (!__namespaces[namespace])
	{
		__namespaces[namespace] = new conbo.Namespace();
	}
	
	var ns = __namespaces[namespace],
		params = conbo.rest(arguments),
		func = params.pop()
		;
	
	if (conbo.isFunction(func))
	{
		var obj = func.apply(ns, params);
		
		if (conbo.isObject(obj) && !conbo.isArray(obj))
		{
			ns.import(obj);
		}
	}
	
	return ns;
};

/**
 * Internal reference to self for use with ES2015 import statements
 * 
 * @memberof	conbo
 * @type		{conbo}
 * 
 * @example 
 * import { conbo } from 'conbo';
 */
conbo.conbo = conbo;

/**
 * The current ConboJS version number in the format major.minor.build
 * @memberof	conbo
 * @type	 	{string}
 */
conbo.VERSION = '{{VERSION}}';
	
/**
 * A string containing the framework name and version number, e.g. "ConboJS v1.2.3"
 * @memberof	conbo
 * @returns 	{string}
 */
conbo.toString = function() 
{ 
	return 'ConboJS '+this.VERSION; 
};
