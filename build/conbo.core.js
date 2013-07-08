/* HEADER: START */

(function(window, undefined)
{
	function create()
	{
	
/* HEADER: END */

/*! 
 * Conbo.js: Lightweight MVC application framework for JavaScript
 * http://conbojs.mesmotronic.com/
 * 
 * Copyright (c) 2013 Mesmotronic Limited
 * Released under the MIT license
 * http://www.mesmotronic.com/legal/mit
 */

/**
 * CONBO.JS
 * 
 * Conbo.js is a lightweight MVC application framework for JavaScript featuring 
 * dependency injection, context and encapsulation, command pattern and event 
 * model which enables callback scoping and consistent event handling
 * 
 * Dependencies: jQuery 1.7+, Underscore.js 1.4.3+
 * 
 * @author		Neil Rackett
 * @see			http://www.mesmotronic.com/
 */

var conbo = {},
	useRequire = (typeof require === 'function'),
	_ = conbo._ = useRequire ? require('underscore') : window._,
	$;

// JQuery is optional for server-side applications, so don't panic if it's not available
try {
	$ = conbo.$ = useRequire ? require('jquery') : (window.jQuery || window.Zepto || window.ender);
} catch (e) {}

/*
 * Info
 */

conbo.VERSION = '1.0.11';
conbo.toString = function() { return '[Conbo '+this.VERSION+']'; };

/**
 * Class
 * Extendable base class from which all others extend
 */
conbo.Class = function(options) 
{
	if (_.isObject(options) && !!options.context) this._inject(options);
	this.initialize.apply(this, arguments);
};

conbo.Class.prototype =
{
	initialize: function() {},
	
	/**
	 * Calls the specified function after the current call stack has cleared
	 */
	callLater: function(callback)
	{
		_.defer(this.bind.apply(this, [callback].concat(_.rest(arguments))));
		return this;
	},
	
	/**
	 * Calls the specified method on the _super object, scoped to this
	 * @param 	methodName		String
	 * @param	...				Zero or more additional parameters
	 */
	callSuper: function(methodName)
	{
		if (!this._super[methodName]) return undefined;
		return this._super[methodName].apply(this, _.rest(arguments));
	},
	
	/**
	 * Creates an AS3-style accessor when using an ECMAScript 5 compliant browser
	 * (Latest Chrome, Firefox, Safari and IE9+)
	 */
	defineProperty: function(name, getter, setter, initialValue)
	{
		if (!('defineProperty' in Object)) throw 'Object.defineProperty is not supported by the current browser';
		
		getter = getter || function() { return this['_'+name]; };
		setter = setter || function(value) { this['_'+name] = value; };
		
		Object.defineProperty(this, name, {enumerable:true, configurable:true, get:getter, set:setter});
		if (initialValue !== undefined) this[name] = initialValue;
		return this;
	},
	
	/**
	 * Creates a jQuery style, chainable property accessor
	 * @example		obj.x(123).y(456).visible(true);
	 */
	defineAccessor: function(name, getter, setter, initialValue)
	{
		getter = getter || function() { return this['_'+name]; };
		setter = setter || function(value) { this['_'+name] = value; return this; };
		
		this[name] = function()
		{
			return (arguments.length ? setter : getter).apply(this, arguments);
		};
		
		if (initialValue !== undefined) this[name](initialValue);
		return this;
	},
	
	/**
	 * Scope one or more methods to this class instance
	 * @param 	method
	 * @returns
	 */
	bind: function(method)
	{
		return _.bind.apply(_, [method, this].concat(_.rest(arguments)));
	},
	
	/**
	 * Scope all methods of this class instance to this class instance
	 * @returns this
	 */
	bindAll: function()
	{
		_.bindAll.apply(_, [this].concat(_.toArray(arguments)))
		return this;
	},
	
	/**
	 * Injector
	 * Add context to this class instance and inject specified dependencies
	 * (properties of undefined value which match registered singetons)
	 * @private
	 */
	_inject: function(options)
	{
		this.options = _.defaults(options || {}, this.options);
		
		this.context = this.context ||
			(this.options.context
			? this.options.context
			: new conbo.Context(options));
		
		this.context.injectSingletons(this);
		
		return this;
	}
	
};

conbo.Class.extend = function(protoProps, staticProps)
{
	var child, parent=this;
	
	/**
	 * The constructor function for the new subclass is either defined by you
	 * (the "constructor" property in your `extend` definition), or defaulted
	 * by us to simply call the parent's constructor.
	 */
	child = protoProps && _.has(protoProps, 'constructor')
		? protoProps.constructor
		: function(){ return parent.apply(this, arguments); };
	
	_.extend(child, parent, staticProps);
	
	/**
	 * Set the prototype chain to inherit from parent, without calling
	 * parent's constructor
	 */
	var Surrogate = function(){ this.constructor = child; };
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate;
	
	if (protoProps) _.extend(child.prototype, protoProps);
	child.prototype._super = parent.prototype;
	
	return child;
};

/*
 * Polyfills for common HTML5/JS methods
 * 
 * Only include the minimum possible number here: we don't want to end 
 * up bloated with stuff most people will never use
 */

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(value, fromIndex) 
		{ return _.indexOf(this, obj, fromIndex); };
}

if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(callback, thisArg)
		{ _.each(this, callback, thisArg) };
}

if (!String.prototype.trim) {
	String.prototype.trim = function () 
		{ return this.replace(/^\s+|\s+$/g,''); };
}

/*
if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (function()
	{
		return window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function(callback) { setTimeout(callback, 1000/60); };
	})();
}
*//**
 * Event class
 * 
 * Base class for all events triggered in Conbo.js
 * 
 * @author		Neil Rackett
 */
conbo.Event = conbo.Class.extend
({
	//cancelBubble: false,
	//defaultPrevented: false,
	//immediatePropagationStopped: false,
	
	currentTarget: undefined,
	target: undefined,
	type: undefined,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(type)
	{
		if (_.isString(type)) this.type = type;
		else _.defaults(this, type);
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize: Override this!
	 * @param type
	 */
	initialize: function(type) {},
	
	/**
	 * Create an identical clone of this event
	 * @returns 	Event
	 */
	clone: function()
	{
		return _.clone(this);
	},
	
	/**
	 * Prevent whatever the default framework action for this event is
	 */
	preventDefault: function() 
	{
		this.defaultPrevented = true;
	},
	
	/**
	 * Not currently used
	 */
	stopPropagation: function() 
	{
		this.cancelBubble = true;
	},
	
	/**
	 * Keep the rest of the handlers from being executed
	 */
	stopImmediatePropagation: function() 
	{
		this.immediatePropagationStopped = true;
		this.stopPropagation();
	},
	
	toString: function()
	{
		return '[conbo.Event]';
	}
},
{
	ALL: 'all',
	
	/**
	 * Get all event types separated by spaces
	 */
	all: function(asArray)
	{
		var types = [];
		
		for (var a in this)
		{
			if (!_.isString(this[a]) || this[a] == this.ALL) continue;
			types.push(this[a]);
		}
		
		if (asArray) return types;
		return types.join(' ');
	}
});
/**
 * conbo.Event
 * 
 * Default event class for events fired by Conbo.js
 * 
 * For consistency, callback parameters of Backbone.js derived classes 
 * are event object properties in Conbo.js
 * 
 * @author		Neil Rackett
 */
conbo.ConboEvent = conbo.Event.extend
({
	toString: function()
	{
		return '[conbo.ConboEvent]';
	}
},
{
	ERROR:		"error", 	// (Properties: model, xhr, options) — when a model's save call fails on the server.
	INVALID:	"invalid", 	// (Properties: model, error, options) — when a model's validation fails on the client.
	CHANGE:		"change", 	// (Properties: model, options) — when a Bindable instance's attributes have changed.
							// "change:[attribute]" (Properties: model, value, options — when a specific attribute has been updated.
	ADD:		"add", 		// (Properties: model, collection, options) — when a model is added to a collection.
	REMOVE:		"remove", 	// (Properties: model, collection, options) — when a model is removed from a collection.
	DESTROY:	"destroy", 	// (Properties: model, collection, options) — when a model is destroyed.
	RESET:		"reset", 	// (Properties: collection, options) — when the collection's entire contents have been replaced.
	SORT:		"sort", 	// (Properties: collection, options) — when the collection has been re-sorted.
	
	REQUEST:	"request", 	// (Properties: model, xhr, options) — when a model (or collection) has started a request to the server.
	SYNC:		"sync", 	// (Properties: model, response, options) — when a model (or collection) has been successfully synced with the server.
	
	ROUTE:		"route", 	// (Properties: router, route, params) — Fired by history (or router) when any route has been matched.
							// "route:[name]" // (Properties: params) — Fired by the router when a specific route is matched.
	
	ALL:		"all", 		// special event fires for any triggered event
});
/**
 * Event Dispatcher
 * 
 * Event model designed to bring events into line with DOM events and those 
 * found in HTML DOM, jQuery and ActionScript 2 & 3, offering a more 
 * predictable, object based approach to event dispatching and handling
 * 
 * Should be used as the base class for any class that won't be used for 
 * data binding
 * 
 * @author	Neil Rackett
 * @see		conbo.Bindable
 */
conbo.EventDispatcher = conbo.Class.extend
({
	/**
	 * Dispatch the event to listeners
	 * @param event		conbo.Event class instance or event type (e.g. 'change')
	 */
	trigger: function(event)
	{
		if (!event) throw 'Event undefined';
		
		if (_.isString(event)) event = new conbo.Event(event);
		if (!(event instanceof conbo.Event)) event = _.defaults(new conbo.Event, event);
		
		if (!this._queue || (!(event.type in this._queue) && !this._queue.all)) return this;
		
		if (!event.target) event.target = this;
		event.currentTarget = this;
		
		var queue = _.union(this._queue[event.type] || [], this._queue.all || []);
		if (!queue || !queue.length) return this;
		
		for (var i=0, length=queue.length; i<length; ++i)
		{
			var value = queue[i];
			var returnValue = value.handler.call(value.scope || this, event);
			if (value.once) this._off(event.type, value.handler, value.scope);
			if (returnValue === false || event.immediatePropagationStopped) break;
		}
		
		return this;
	},
	
	/**
	 * Add a listener for a particular event type
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 */
	on: function(type, handler, scope, priority)
	{
		if (!type) throw 'Event type undefined';
		if (!handler) throw 'Event handler undefined';

		if (_.isString(type)) type = type.split(' ');
		if (_.isArray(type)) _.each(type, function(value, index, list) { this._on(value, handler, scope, priority, false); }, this);
		else _.each(type, function(value, key, list) { this._on(key, value, scope, priority, false); }, this); 
		
		return this;
	},
	
	/**
	 * Add a listener for a particular event type that fires once, then removes itself
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 */
	one: function(type, handler, scope, priority)
	{
		if (!type) throw 'Event type undefined';
		if (!handler) throw 'Event handler undefined';

		if (_.isString(type)) type = type.split(' ');
		if (_.isArray(type)) _.each(type, function(value, index, list) { this._on(value, handler, scope, priority, true); }, this);
		else _.each(type, function(value, key, list) { this._on(key, value, scope, priority, true); }, this); 
		
		return this;
	},
	
	/**
	 * Remove a listener for a particular event type
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 * @param scope	The scope
	 */
	off: function(type, handler, scope)
	{
		if (!arguments.length)
		{
			this._queue = {};
			return this;
		}
		
		if (!type) throw 'Event type undefined';
		if (arguments.length == 2 && !handler) return this;
		
		var a = arguments;
		
		if (_.isString(type)) type = type.split(' ');
		if (_.isArray(type)) _.each(type, function(value, index, list) { this._off.apply(this, a); }, this);
		else _.each(type, function(value, key, list) { this._off.apply(this, a); }, this);
		
		return this;
	},
	
	toString: function()
	{
		return '[conbo.EventDispatcher]';
	},
	
	// Aliases
	addEventListener: function() { this.on.apply(this, arguments); },
	removeEventListener: function() { this.off.apply(this, arguments); },
	
	/**
	 * @private
	 */
	_on: function(type, handler, scope, priority, once)
	{
		if (type == '*') type = 'all';
		if (!this._queue) this._queue = {};
		this._off(type, handler, scope);
		
		if (!(type in this._queue)) this._queue[type] = [];
		this._queue[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
		this._queue[type].sort(function(a,b){return b.priority-a.priority});
	},
	
	/**
	 * @private
	 */
	_off: function(type, handler, scope)
	{
		if (!this._queue) return this;
		if (!(type in this._queue)) return this;
		var queue = this._queue[type];
		
		if (arguments.length == 1)
		{
			delete this._queue[type];
			return this;
		}
		
		var i;
		
		for (i=0; i<queue.length; i++)
		{
			if ((queue[i].handler == handler || !queue[i].handler)
				&& (queue[i].scope == scope || !queue[i].scope))
			{
				queue.splice(i--, 1);
			}
		}
		
		return this;
	}
});
/**
 * Bindable
 * 
 * Base class for anything that you want to be able to use as a data provider for HTML,
 * e.g. as part of a View, or otherwise be able to track property changes on
 * 
 * By default, classes extending Bindable will trigger 'change:[property name]' and 
 * 'change' events when a property (including jQuery-style accessors) is changed
 * via the set(...) method
 * 
 * @author		Neil Rackett
 */
conbo.Bindable = conbo.EventDispatcher.extend
({
	/**
	 * Get the value of a property
	 * @param	attribute
	 * @example	instance.get('n');
	 * @returns
	 */
	get: function(attribute)
	{
		var a = this._attributes();
		
		if (!(attribute in a)) return undefined;
		if (_.isFunction(a[attribute])) return this[attribute]();
		return a[attribute];
	},
	
	/**
	 * Set the value of one or more property and dispatch a change:[propertyName] event
	 * 
	 * Event handlers, in line with conbo.Model change:[propertyName] handlers, 
	 * should be in the format handler(source, value) {...}
	 * 
	 * @param 	attributes
	 * @param 	value
	 * @param 	options
	 * @example	instance.set('n', 123);
	 * @example	instance.set({n:123, s:'abc'});
	 * @returns	this
	 */
	set: function(attributes, value, options)
	{
		var a = this._attributes();
		
		if (_.isObject(attributes))
		{
			_.each(attributes, function(value, key) { this.set(key, value, options); }, this);
			return this;
		}
		
		var changed = false;
		
		options || (options = {silent:false});
		
		if (options.unset)
		{
			changed = _.has(a, attributes);
			delete a[attributes];
		}
		else if (_.isFunction(a[attributes]) && a[attributes]() != value)
		{
			a[attributes](value);
			changed = true;
		}
		else if (a[attributes] != value)
		{
			a[attributes] = value;
			changed = true;
		}
		
		if (changed && !options.silent)
		{
			var event = {type:'change:'+attributes, attribute:attributes, value:value, options:options};
			
			try
			{
				this.trigger(new conbo.ConboEvent(event));
				this.trigger(new conbo.ConboEvent(_.extend(event, {type:conbo.ConboEvent.CHANGE})));
			}
			catch (e) {}
		}
		
		return this;
	},
	
	/**
	 * Delete a property and dispatch a change:[propertyName] event
	 * @param 	value
	 * @returns	this
	 */
	unset: function(value, options)
	{
		options = _.defaults({unset:true}, options);
		return this.set(value, undefined, options);
	},
	
	toString: function()
	{
		return '[conbo.Bindable]';
	},
	
	/**
	 * The object containing the properties you can get/set,
	 * which defaults to this
	 * 
	 * @returns	Object
	 */
	_attributes: function()
	{
		return this;
	}
});
/**
 * conbo.Context
 * 
 * This is your application's event bus and dependency injector, and is
 * usually where all your models and web service classes are registered,
 * using mapSingleton(...), and Command classes are mapped to events 
 * 
 * @author		Neil Rackett
 */
conbo.Context = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this._commands = {};
		this._singletons = {};
		
		this.options = options || {};
		this.view = this.options.view;
		
		this.on(conbo.Event.ALL, this._allHandler);
		this.initialize.apply(this, arguments);
		
		return this;
	},
	
	/**
	 * Initialize: Override this
	 * @param options
	 */
	initialize: function(options) {},
	
	/**
	 * Map specified Command class the given event
	 */
	mapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw 'eventType cannot be undefined';
		if (!commandClass) throw 'commandClass cannot be undefined';
		
		if (this._mapMulti(eventType, commandClass, this.mapCommand)) return;
		
		if (this._commands[eventType] && this._commands[eventType].indexOf(commandClass) != -1)
		{
			return;
		}
		
		this._commands[eventType] = this._commands[eventType] || [];
		this._commands[eventType].push(commandClass);
		
		return this;
	},
	
	/**
	 * Unmap specified Command class from given event
	 */
	unmapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw 'eventType cannot be undefined';
		if (this._mapMulti(eventType, commandClass, this.unmapCommand)) return;
		
		if (commandClass === undefined)
		{
			delete this._commands[eventType];
			return;
		}
		
		if (!this._commands[eventType]) return;
		var index = this._commands[eventType].indexOf(commandClass);
		if (index == -1) return;
		this._commands[eventType].splice(index, 1);
		
		return this;
	},
	
	/**
	 * Map class instance to a property name
	 * 
	 * To inject a property into a class, register the property name
	 * with the Context and set the value of the property in your
	 * class to 'use inject' 
	 * 
	 * @example		context.mapSingleton('myProperty', MyModel);
	 * @example		myProperty: 'use inject'
	 */
	mapSingleton: function(propertyName, singletonClass)
	{
		if (!propertyName) throw 'propertyName cannot be undefined';
		if (!singletonClass) throw 'singletonClass cannot be undefined';
		
		if (this._mapMulti(propertyName, singletonClass, this.mapSingleton)) return;
		
		this._singletons[propertyName] =
			_.isFunction(singletonClass)
			// TODO Improved dynamic class instantiation
			? new singletonClass(arguments[2], arguments[3], arguments[4])
			: singletonClass;
			
		return this;
	},
	
	/**
	 * Unmap class instance from a property name
	 */
	unmapSingleton: function(propertyName)
	{
		if (!propertyName) throw 'propertyName cannot be undefined';
		if (this._mapMulti(propertyName, null, this.unmapSingleton)) return;
		
		if (!this._singletons[propertyName]) return;
		delete this._singletons[propertyName];
		
		return this;
	},
	
	/**
	 * Add this context to the specified Object
	 */
	addTo: function(obj)
	{
		return _.extend(obj || {}, {context:this});
	},
	
	/**
	 * Inject singleton instances into specified object
	 */
	injectSingletons: function(obj)
	{
		for (var a in obj)
		{
			if (obj[a] !== undefined) continue;
			obj[a] = this._singletons[a];
		}
		
		return this;
	},
	
	toString: function()
	{
		return '[conbo.Context]';
	},
	
	/**
	 * @private
	 */
	_allHandler: function(event)
	{
		var commands = _.union(this._commands.all || [], this._commands[event.type] || []);
		if (!commands.length) return;
		
		_.each(commands, function(commandClass, index, list)
		{
			this._executeCommand(commandClass, event);
		}, 
		this);
	},
	
	/**
	 * @private
	 */
	_executeCommand: function(commandClass, event)
	{
		var command, options;
		
		options = {event:event};
		
		command = new commandClass(this.addTo(options));
		command.execute();
		command = null;
		
		return this;
	},
	
	/**
	 * @private
	 */
	_mapMulti: function(n, c, f)
	{
		if (_.isArray(n) || n.indexOf(' ') == -1) return false;
		var names = _.isArray(n) ? n : n.split(' ');
		_.each(names, function(e) { f(e,c); }, this);
		return true;
	}
	
});
/**
 * conbo.Map
 * 
 * A simple, lightweight, bindable Object class for when a Model is overkill,
 * e.g. when you don't need to sync your data with a web service
 * 
 * @author		Neil Rackett
 */
conbo.Map = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		if (_.isObject(options) && !!options.context) this._inject(options);
		this.initialize.apply(this, arguments);
		_.defaults(this._attributes(), this.defaults);
	},
	
	/**
	 * Returns an object ready to be converted to JSON
	 * TODO Ensure we return only user's props and accessors (converted to props)
	 * @returns
	 */
	toJSON: function()
	{
		return _.clone(this._attributes());
	},
	
	toString: function()
	{
		return '[conbo.Map]';
	}
});
/**
 * Binding utility class
 * 
 * Used to bind properties of Bindable class instances to DOM elements, 
 * other Bindable class instances or setter functions
 * 
 * @author Neil Rackett
 */
conbo.BindingUtils = conbo.Class.extend({},
{
	/**
	 * Bind a property of a Bindable class instance  (e.g. Map or Model) 
	 * to a DOM element's value/content 
	 * 
	 * @param source			Class instance which extends from conbo.Bindable (e.g. Map or Model)
	 * @param property			Property name to bind
	 * @param element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param parseFunction		Optional method used to parse values before outputting as HTML
	 */
	bindElement: function(source, propertyName, element, parseFunction)
	{
		parseFunction = parseFunction || function(value)
			{ return typeof(value) == 'undefined' ? '' : String(value); };
		
		$(element).each(function(index, el)
		{
			var $el = $(el);
			var tagName = $el[0].tagName;
			
			switch (tagName)
			{
				case 'INPUT':
				case 'SELECT':
				case 'TEXTAREA':
				{	
					var type = ($el.attr('type') || tagName).toLowerCase();
					
					switch (type)
					{
						case 'checkbox':
						{
							$el.prop('checked', Boolean(source.get(propertyName)));
							
							source.on('change:'+propertyName, function(event)
							{
								$el.prop('checked', Boolean(event.value));
							});
							
							$el.on('input change', function(event)
							{	
								source.set(propertyName, $el.is(':checked'));
							});
							
							return;
						}
						
						case 'radio':
						{
							if ($el.val() == source.get(propertyName)) $el.prop('checked', true);
							
							source.on('change:'+propertyName, function(event)
							{
								if ($el.val() != event.value) return; 
								$el.prop('checked', true);
							});
							
							break;
						}
						
						default:
						{
							$el.val(source.get(propertyName));
						
							source.on('change:'+propertyName, function(event)
							{
								if ($el.val() == event.value) return;
								$el.val(event.value);
							});
							
							break;
						}
					}
					
					$el.on('input change', function(event)
					{	
						source.set(propertyName, $el.val() || $el.html());
					});
					
					break;
				}
				
				default:
				{
					$el.html(parseFunction(source.get(propertyName)));
					
					source.on('change:'+propertyName, function(event) 
					{
						var html = parseFunction(event.value);
						$el.html(html);
					});
					
					break;
				}
			}
			
		});
		
		return this;
	},
	
	/**
	 * Bind the property of one Bindable class instance (e.g. Map or Model) to another
	 * 
	 * @param source					Class instance which extends from conbo.Bindable
	 * @param sourcePropertyName		String
	 * @param destination				Class instance which extends from conbo.Bindable
	 * @param destinationPropertyName	String (default: sourcePropertyName)
	 * @param twoWay					Boolean (default: false)
	 */
	bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
	{
		destinationPropertyName = destinationPropertyName || sourcePropertyName;
		
		source.on('change:'+sourcePropertyName, function(event)
		{
			conbo.EventDispatcher.prototype.set.call(destination, destinationPropertyName, event.value);
		});
		
		if (twoWay) this.bindProperty(destination, destinationPropertyName, source, sourcePropertyName);
		
		return this;
	},
	
	/**
	 * Call a setter function when the specified property of a Bindable 
	 * class instance (e.g. Map or Model) is changed
	 * 
	 * @param source			Class instance which extends from conbo.Bindable
	 * @param propertyName
	 * @param setterFunction
	 */
	bindSetter: function(source, propertyName, setterFunction)
	{
		source.on('change:'+propertyName, function(event)
		{
			setterFunction(event.value);
		});
		
		return this;
	}
});
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

//List of view options to be merged as properties.
var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * Some methods derived from the Backbone.js class of the same name
 */
conbo.View = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this.cid = _.uniqueId('view');
		
		this._addStyle();
		this._configure(options || {});
		this._ensureElement();
		this._inject(options);
		
		this.initialize.apply(this, arguments);
		this.delegateEvents();
	},
	
	/**
	 * The default `tagName` of a View's element is `"div"`.
	 */
	tagName: 'div',
	
	/**
	 * jQuery delegate for element lookup, scoped to DOM elements within the
	 * current view. This should be prefered to global lookups where possible.
	 */
	$: function(selector)
	{
		return this.$el.find(selector);
	},
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
	
	/**
	 * **render** is the core function that your view should override, in order
	 * to populate its element (`this.el`), with the appropriate HTML. The
	 * convention is for **render** to always return `this`.
	 */
	render: function() 
	{
		return this;
	},
	
	/**
	 * Remove this view by taking the element out of the DOM, and removing any
	 * applicable events listeners.
	 */
	remove: function() 
	{
		this.$el.remove();
		
		this.unbindView()
			.off();
		
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property), including event
	 * re-delegation.
	 */
	setElement: function(element, delegate)
	{
		if (this.$el)
		{
			this.undelegateEvents()
			.unbindView();
		}
		this.$el = element instanceof conbo.$ ? element : conbo.$(element);
		this.el = this.$el[0];
		if (delegate !== false) this.delegateEvents();
		
		if (!(this instanceof conbo.Application))
		{
			this.bindView();
		}
		
		return this;
	},
	
	/**
	 * Append this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	appendView: function(view)
	{
		if (arguments.length > 1)
		{
			_.each(arguments, function(view, index, list) {
				this.appendView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw 'Parameter must be instance of conbo.View class';
		
		this.$el.append(view.el);
		return this;
	},
	
	/**
	 * Prepend this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	prependView: function(view)
	{
		if (arguments.length > 1)
		{
			_.each(arguments, function(view, index, list) {
				this.prependView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw 'Parameter must be instance of conbo.View class';
		
		this.$el.prepend(view.el);
		return this;
	},
	
	/**
	 * Enables or disabled mouse/touch interaction with this view
	 * @param 	value	Boolean
	 * @returns
	 */
	mouseEnabled: function(value)
	{
		return this._setClass.apply(this, _.union(['conbo-disabled'], _.toArray(arguments)));
	},
	
	/**
	 * Hides view, but takes up the same space as before
	 * @param 		value	Boolean
	 * @returns		
	 */
	visible: function(value)
	{
		return this._setClass.apply(this, _.union(['conbo-invisible'], _.toArray(arguments)));
	},
	
	/**
	 * Hide view and display as if the element is not there
	 * @param value
	 * @returns
	 */
	includeInLayout: function(value)
	{
		return this._setClass.apply(this, _.union(['conbo-excludeFromLayout'], _.toArray(arguments)));
	},
	
	/**
	 * Automatically bind elements to class properties
	 * @returns	this
	 */
	bindView: function()
	{
		this.$('[data-property]').each(this.bind(function(index, el)
		{
			var d = this.$(el).data()
			p = d.property,
			s = d.source;
			f = typeof this[d.parse] == 'function' ? this[d.parse] : undefined;
			
			if (!!s && !(s in this)) throw new Error('Unable to bind element to undefined source: '+s);
			
			var m = !!s ? this[s] : this;
			
			conbo.BindingUtils.bindElement(m, p, el, f);
		}));
		
		return this;
	},
	
	/**
	 * Unbind elements from class properties
	 * TODO Implement unbindView()
	 * @returns	this
	 */
	unbindView: function() 
	{
		return this;
	},
	
	/**
	 * Loads a CSS and apply it
	 * @param	url		The URL of the CSS
	 */
	loadCSS: function(url)
	{
		if (!('document' in window)) return;
		
	    var link;
	    
	    link = document.createElement('link');
	    link.type = 'text/css';
	    link.rel = 'stylesheet';
	    link.href = url;
	    
	    document.getElementsByTagName('head')[0].appendChild(link);
	    
	    return this;
	},
	
	/**
	 * Set callbacks, where `this.events` is a hash of
	 * 
	 * *{"event selector": "callback"}*
	 *
	 *     {
	 *       'mousedown .title':  'edit',
	 *       'click .button':     'save'
	 *       'click .open':       function(e) { ... }
	 *     }
	 *
	 * pairs. Callbacks will be bound to the view, with `this` set properly.
	 * Uses event delegation for efficiency.
	 * Omitting the selector binds the event to `this.el`.
	 * This only works for delegate-able events: not `focus`, `blur`, and
	 * not `change`, `submit`, and `reset` in Internet Explorer.
	 * 
	 * @param	events
	 * @returns this
	 */
	delegateEvents: function(events) 
	{
		if (!(events || (events = _.result(this, 'events')))) return;
		
		this.undelegateEvents();
		
		for (var key in events)
		{
			var method = events[key];
			if (!_.isFunction(method)) method = this[events[key]];
			if (!method) throw new Error('Method "' + events[key] + '" does not exist');
			var match = key.match(delegateEventSplitter);
			var eventName = match[1], selector = match[2];
			method = _.bind(method, this);
			eventName += '.delegateEvents' + this.cid;
			
			if (selector === '') {
				this.$el.on(eventName, method);
			} else {
				this.$el.on(eventName, selector, method);
			}
		}
		return this;
	},
	
	/**
	 * Clears all callbacks previously bound to the view with `delegateEvents`.
	 * You usually don't need to use this, but may wish to if you have multiple
	 * conbo views attached to the same DOM element.
	 */
	undelegateEvents: function() {
		this.$el.off('.delegateEvents' + this.cid);
		return this;
	},
	
	toString: function()
	{
		return '[conbo.View]';
	},
	
	/**
	 * TODO Put this elsewhere, but still enable user to inject conbo.$ manually
	 * @private
	 */
	_addStyle: function()
	{
		if (!!conbo.style) return this;
		
		var style = conbo.$(
			'<style type="text/css">'+
				'.conbo-invisible { visibility:hidden !important; }'+
				'.conbo-excludeFromLayout { display:none !important; }'+
				'.conbo-disabled { pointer-events:none !important; }'+
			'</style>');
		
		conbo.$('head').append(style);
		conbo.style = style;
		
		return this;
	},
	
	/**
	 * Performs the initial configuration of a View with a set of options.
	 * Keys with special meaning *(model, collection, id, className)*, are
	 * attached directly to the view.
	 * 
	 * @private
	 */
	_configure: function(options) 
	{
		if (this.options) options = _.extend({}, _.result(this, 'options'), options);
		_.extend(this, _.pick(options, viewOptions));
		this.options = options;
	},
	
	/**
	 * Ensure that the View has a DOM element to render into.
	 * If `this.el` is a string, pass it through `$()`, take the first
	 * matching element, and re-assign it to `el`. Otherwise, create
	 * an element from the `id`, `className` and `tagName` properties.
	 * 
	 * @private
	 */
	_ensureElement: function() 
	{
		if (!this.el) {
			var attrs = _.extend({}, _.result(this, 'attributes'));
			if (this.id) attrs.id = _.result(this, 'id');
			if (this.className) attrs['class'] = _.result(this, 'className');
			var $el = conbo.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
			this.setElement($el, false);
		} else {
			this.setElement(_.result(this, 'el'), false);
			if (this.className) this.$el.addClass(this.className);
		}
	},
	
	/**
	 * @private
	 */
	_setClass: function(className, value)
	{
		var a = _.rest(arguments);
		
		if (!a.length) return !this.$el.hasClass(className);
		
		var isElement = _.isString(value) || _.isElement(value) || value instanceof conbo.$;
		var $el = isElement ? this.$(value) : this.$el;
		
		if (a.length == 1 && isElement) return !$el.hasClass(className);
		if (a.length == 2 && isElement) value = a[1];
		
		$el.removeClass(className);
		if (!value) $el.addClass(className);
		
		return this;
	}
});
/**
 * Actor
 * 
 * Suggested base class for web services to be included as singletons 
 * in your Context, using mapSingleton(...)
 * 
 * @author		Neil Rackett
 */
conbo.Actor = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this._inject(options);
		this.initialize.apply(this, arguments);
	}
});
/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @author		Neil Rackett
 */
conbo.Application = conbo.View.extend
({
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	contextClass: conbo.Context,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = options || {};
		options.view = options.view || this;
		
		this.context = options.context || new this.contextClass(options);
		
		conbo.View.prototype.constructor.apply(this, arguments);
	},
	
	toString: function()
	{
		return '[conbo.Application]';
	},
});
/**
 * conbo.Command
 * 
 * Base class for commands to be registered in your Context 
 * using mapCommand(...)
 * 
 * @author		Neil Rackett
 */
conbo.Command = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this._inject(options);
		this.event = this.options.event || {};
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialiser included for consistency, but should probably never be used
	 */
	initialize: function() {},
	
	/**
	 * Execute: should be overridden
	 * 
	 * When a Command is called in response to an event registered with the
	 * Context, the class is instantiated, this method is called then the 
	 * class instance is destroyed
	 */
	execute: function() {},
	
	toString: function()
	{
		return '[conbo.Command]';
	}
	
});
/**
 * Server Application 
 * 
 * Base class for applications that don't require DOM, e.g. Node.js
 * 
 * @author		Neil Rackett
 */
conbo.ServerApplication = conbo.Bindable.extend
({
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	contextClass: conbo.Context,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = options || {};
		options.view = options.view || this;
		
		this.context = options.context || new this.contextClass(options);
		this._inject(options);
		this.options = options;
		this.initialize.apply(this, arguments);
	},
	
	initialize: function() {},
	
	toString: function()
	{
		return '[conbo.ServerApplication]';
	},
});

/* FOOTER: START */

		return conbo;
	}
	
	// Node.js?
	if (typeof module !== 'undefined' && module.exports)
	{
    	module.exports = create();
    }
    // AMD?
    else if (typeof define === 'function' && define.amd) 
	{
		define('conbo', ['jquery','underscore'], function () { return create(); } );
	}
    // Global
    else
    {
    	window.conbo = create();
    }
	
})(this);

/* FOOTER: END */
