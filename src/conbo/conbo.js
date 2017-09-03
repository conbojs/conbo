/*! 
 * ConboJS: Lightweight MVC application framework for JavaScript
 * http://conbojs.mesmotronic.com/
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
 * ConboJS is a lightweight MVC application framework for JavaScript featuring 
 * dependency injection, context and encapsulation, data binding, command 
 * pattern and an event model which enables callback scoping and consistent 
 * event handling
 * 
 * @variation	1
 * @module		conbo
 * @author		Neil Rackett
 * @see			http://conbo.mesmotronic.com/
 */

/**
 * All ConboJS classes, methods and properties live within the conbo namespace
 * 
 * @variation	2
 * @namespace 	conbo
 */

/**
 * Create or access a reference to a ConboJS namespace
 * 
 * @variation	3
 * @function	conbo
 * @param		{string}	namespace - The selected namespace
 * @param		{...*}		[globals] - Globals to minify followed by function to execute, with each of the globals as parameters
 * @returns		{conbo.Namespace}
 * 			
 * @example
 * // Conbo can replace the standard minification pattern with modular namespace definitions
 * // If an Object is returned, its contents will be added to the namespace
 * conbo('com.namespace.example', window, document, conbo, function(window, document, conbo, undefined)
 * {
 * 	var example = this;
 * 	
 * 	// Your code here
 * });  
 */
var conbo = function(namespace)
{
	if (!namespace || !conbo.isString(namespace))
	{
		conbo.warn('First parameter must be the namespace string, received', namespace);
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
 * Internal reference to self, enables full functionality to be used via 
 * ES2015+ import statements
 * 
 * @augments	conbo
 * @returns		{conbo}
 * 
 * @example 
 * import {conbo} from 'conbo';
 */
conbo.conbo = conbo;

/**
 * @augments	conbo
 * @returns 	{string}
 */
conbo.VERSION = '{{VERSION}}';
	
/**
 * @augments	conbo
 * @returns 	{string}
 */
conbo.toString = function() 
{ 
	return 'ConboJS v'+this.VERSION; 
};
