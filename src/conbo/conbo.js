/*! 
 * Conbo.js: Lightweight MVC application framework for JavaScript
 * http://conbojs.mesmotronic.com/
 * 
 * Copyright (c) 2015 Mesmotronic Limited
 * Released under the MIT license
 * http://www.mesmotronic.com/legal/mit
 */

var __namespaces = {};

/**
 * Conbo.js is a lightweight MVC application framework for JavaScript featuring 
 * dependency injection, context and encapsulation, data binding, command 
 * pattern and an event model which enables callback scoping and consistent 
 * event handling
 * 
 * Dependencies
 *
 * Lite: None
 * Complete: jQuery 1.7+
 * 
 * @namespace 	conbo
 * @param		namespace	{String}	The selected namespace
 * @author		Neil Rackett
 * @see			http://www.mesmotronic.com/
 * 
 * @example
 * // Conbo can replace the standard minification pattern with modular namespace definitions
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
		func.apply(ns, params);
	}
	
	return ns;
};

/**
 * @augments	conbo
 * @returns 	{String}
 */
conbo.VERSION = '{{VERSION}}';
	
/**
 * @augments	conbo
 * @returns 	{String}
 */
conbo.toString = function() 
{ 
	return 'Conbo '+this.VERSION; 
};

if (!!$)
{
	/**
	 * Local jQuery instance used by Conbo internally (not available in lite build)
	 * @namespace	conbo.$
	 */
	conbo.$ = $;
}
