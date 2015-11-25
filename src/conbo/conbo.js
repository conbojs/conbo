/*! 
 * Conbo.js: Lightweight MVC application framework for JavaScript
 * http://conbojs.mesmotronic.com/
 * 
 * Copyright (c) 2015 Mesmotronic Limited
 * Released under the MIT license
 * http://www.mesmotronic.com/legal/mit
 */

/**
 * CONBO.JS
 * 
 * Conbo.js is a lightweight MVC application framework for JavaScript featuring 
 * dependency injection, context and encapsulation, data binding, command 
 * pattern and an event model which enables callback scoping and consistent 
 * event handling
 * 
 * Dependencies
 *
 * Lite: None
 * Core and Complete: jQuery 1.7+
 * 
 * @author		Neil Rackett
 * @see			http://www.mesmotronic.com/
 */

var __namespaces = {};

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

conbo.VERSION = '2.2.2';
	
conbo.toString = function() 
{ 
	return 'Conbo '+this.VERSION; 
};

if (!!$)
{
	conbo.$ = $;
}
