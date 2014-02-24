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
 * dependency injection, context and encapsulation, data binding, command 
 * pattern and an event model which enables callback scoping and consistent 
 * event handling
 * 
 * Dependencies: jQuery 1.7+, Lo-Dash or Underscore.js 1.4+
 * 
 * @author		Neil Rackett
 * @see			http://www.mesmotronic.com/
 */

(function(window, document, undefined)
{
	var create = function(_, $)
	{
		var conbo = 
		{
			VERSION:'1.1.10',
			_:_, 
			$:$,
			
			toString: function() 
			{ 
				return 'Conbo '+this.VERSION; 
			}
		};
		

/*
 * Polyfills for native JavaScript methods that are missing from
 * older browsers (yes, IE, I'm looking at you!)
 * 
 * We're only include the minimum possible number here as we don't want 
 * to end up bloated with stuff most people will never use
 * 
 * @author		Neil Rackett
 */

if (!Array.prototype.indexOf) 
{
	Array.prototype.indexOf = function(value, fromIndex)
	{
		return _.indexOf(this, value, fromIndex); 
	};
}

if (!Array.prototype.forEach) 
{
	Array.prototype.forEach = function(callback, thisArg)
	{
		return _.each(this, callback, thisArg); 
	};
}

if (!String.prototype.trim) 
{
	String.prototype.trim = function () 
	{
		return this.replace(/^\s+|\s+$/g,''); 
	};
}

if (!Object.prototype.hasOwnProperty) 
{
	Object.prototype.hasOwnProperty = function(prop) 
	{
		return _.has(this, prop);
	};
}

/* 
 * A quick tweak for Lo-Dash/Underscore.js to enable it to differentiate
 * between functions and classes
 * 
 * @author		Neil Rackett
 */

var _isFunction = _.isFunction;

_.isClass = function(value)
{
	return value instanceof conbo.Class;
};

_.isFunction = function(value)
{
	return _isFunction(value) && !_.isClass(value);
};

/*
 * jQuery plug-ins and expressions
 * @author		Neil Rackett
 */

$.fn.cbData = function()
{
	var data = {},
		attrs = this.get()[0].attributes,
		count = 0;
	
	for (var i=0; i<attrs.length; ++i)
	{
		if (attrs[i].name.indexOf('cb-') != 0) continue;
		var propertyName = attrs[i].name.substr(3).replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
		data[propertyName] = attrs[i].value;
		++count;
	}
	
	return !!count ? data : undefined;
}

$.expr[':'].cbAttr = function(el, index, meta, stack)
{
	var $el = $(el),
		args = meta[3].split(','),
		cb = $el.cbData();
	
	if (!cb) return false;
	if (!!cb && !args.length) return true;
	if (!!args[0] && !args[1]) return cb.hasOwnProperty(args[0]);
	if (!!args[0] && !!args[1]) return cb[args[0]] == args[1];
	return false;
};

/**
 * Class
 * Extendable base class from which all others extend
 */
conbo.Class = function(options) 
{
	this.initialize.apply(this, arguments);
};

conbo.Class.prototype =
{
	/**
	 * Entry point
	 * 
	 * In most circumstances, custom classes should override initialize 
	 * and use it as your class constructor
	 */
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
		if (!('defineProperty' in Object)) throw new Error('Object.defineProperty is not supported by the current browser');
		
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
		
		if (initialValue !== undefined)
		{
			this[name](initialValue);
		}
		
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
	
	toString: function()
	{
		return 'conbo.Class';
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

/**
 * Injectable
 * 
 * Base class that enables the Conbo.js framework to add context to this 
 * class instance and inject specified dependencies (properties of undefined
 * value which match registered singletons)
 * 
 * @author		Neil Rackett
 */
conbo.Injectable = conbo.Class.extend
({
	constructor: function(options)
	{
		this._inject(options);
		this.initialize.apply(this, arguments);
	},
	
	toString: function()
	{
		return 'conbo.Injectable';
	},
	
	/**
	 * Inject
	 * @private
	 */
	_inject: function(options)
	{
		options || (options = {});
		
		this.defineAccessor('context', undefined, undefined, _.result(this, 'context') || options.context);
		if (!!this.context()) this.context().injectSingletons(this);
		
		return this;
	}
});

/**
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
	
	//currentTarget: undefined,
	//target: undefined,
	//type: undefined,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(type)
	{
		if (_.isString(type)) this.type = type;
		else _.defaults(this, type);
		
		if (!this.type) throw new Error('Invalid or undefined event type');
		
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
		return 'conbo.Event';
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
	initialize: function(type, options)
	{
		_.defaults(this, options);
	},
	
	toString: function()
	{
		return 'conbo.ConboEvent';
	}
},
// Static properties
{
	ERROR:		"error", 	// (Properties: model, xhr, options) � when a model's save call fails on the server.
	INVALID:	"invalid", 	// (Properties: model, error, options) � when a model's validation fails on the client.
	CHANGE:		"change", 	// (Properties: model, options) � when a Bindable instance's attributes have changed.
							// "change:[attribute]" (Properties: model, value, options � when a specific attribute has been updated.
	ADD:		"add", 		// (Properties: model, collection, options) � when a model is added to a collection.
	REMOVE:		"remove", 	// (Properties: model, collection, options) � when a model is removed from a collection.
	DESTROY:	"destroy", 	// (Properties: model, collection, options) � when a model is destroyed.
	RESET:		"reset", 	// (Properties: collection, options) � when the collection's entire contents have been replaced.
	SORT:		"sort", 	// (Properties: collection, options) � when the collection has been re-sorted.
	
	REQUEST:	"request", 	// (Properties: model, xhr, options) � when a model (or collection) has started a request to the server.
	SYNC:		"sync", 	// (Properties: model, response, options) � when a model (or collection) has been successfully synced with the server.
	
	ROUTE:		"route", 	// (Properties: router, route, params) � Fired by history (or router) when any route has been matched.
							// "route:[name]" // (Properties: params) � Fired by the router when a specific route is matched.
	
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
conbo.EventDispatcher = conbo.Injectable.extend
({
	/**
	 * Dispatch the event to listeners
	 * @param event		conbo.Event class instance or event type (e.g. 'change')
	 */
	trigger: function(event)
	{
		if (!event) throw new Error('Event undefined');
		
		if (_.isString(event) || !(event instanceof conbo.Event)) 
			event = new conbo.Event(event);
		
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
		if (!type) throw new Error('Event type undefined');
		if (!handler || !_.isFunction(handler)) throw new Error('Event handler is undefined or not a function');

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
		if (!type) throw new Error('Event type undefined');
		if (!handler || !_.isFunction(handler)) throw new Error('Event handler is undefined or not a function');
		
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
		
		if (!type) throw new Error('Event type undefined');
		if (arguments.length == 2 && !handler) return this;
		
		var a = arguments;
		
		if (_.isString(type)) type = type.split(' ');
		if (_.isArray(type)) _.each(type, function(value, index, list) { this._off.apply(this, a); }, this);
		else _.each(type, function(value, key, list) { this._off.apply(this, a); }, this);
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.EventDispatcher';
	},
	
	// Aliases
	dispatchEvent: function() { this.trigger.apply(this, arguments); },
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
		if (!this._queue || !(type in this._queue)) return this;
		
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
		var a = _.result(this, '_attributes');
		return _.result(a, attribute);
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
		if (_.isObject(attributes))
		{
			_.each(attributes, function(value, key) { this.set(key, value, options); }, this);
			return this;
		}
		
		var a = _.result(this, '_attributes'),
			changed = false;
		
		options || (options = {silent:false});
		
		if (options.unset)
		{
			changed = _.has(a, attributes);
			delete a[attributes];
		}
		else if (_.isFunction(a[attributes]))
		{
			if (a[attributes]() !== value)
			{
				a[attributes](value);
				changed = true;
			}
		}
		else if (a[attributes] != value)
		{
			a[attributes] = value;
			changed = true;
		}
		
		if (changed && !options.silent)
		{
			var options = {attribute:attributes, value:value, options:options};
			
			this.trigger(new conbo.ConboEvent('change:'+attributes, options));
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, options));
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
		return 'conbo.Bindable';
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
		options = options || {};
		
		this._commands = {};
		this._singletons = {};
		
		this.defineAccessor('app', undefined, undefined, options.app);
		
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
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (!commandClass) throw new Error('commandClass cannot be undefined');
		
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
		if (!eventType) throw new Error('eventType cannot be undefined');
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
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		if (!singletonClass) throw new Error('singletonClass cannot be undefined');
		
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
		if (!propertyName) throw new Error('propertyName cannot be undefined');
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
			
			if (this._singletons.hasOwnProperty(a))
			{
				obj[a] = this._singletons[a];
			}
		}
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Context';
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
 * conbo.Hash
 * 
 * A Hash is a bindable object of associated keys and values
 * 
 * @example	
 * 	this.set('fun', 123};
 * 	this.get('fun');
 * 
 * @author		Neil Rackett
 */

conbo.Hash = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(attributes, options)
	{
		this._inject(options);
		this._attributes = _.defaults({}, attributes, _.result(this, 'defaults'));
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Returns an object ready to be converted to JSON
	 * TODO Ensure we return only user's props and accessors (converted to props)
	 * @returns
	 */
	toJSON: function()
	{
		return _.clone(this._attributes);
	},
	
	toString: function()
	{
		return 'conbo.Hash';
	}
});

//Underscore methods that we want to implement on the Model.
var hashMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'size'];

//Mix in each available Lo-Dash/Underscore method as a proxy to `Model#attributes`.
_.each(hashMethods, function(method)
{
	if (!_.has(_, method)) return;
	
	conbo.Hash.prototype[method] = function() 
	{
		return _[method].apply(_, [this._attributes].concat(_.rest(arguments)));
	};
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
	 * Bind a property of a Bindable class instance (e.g. Map or Model) 
	 * to a DOM element's value/content 
	 * 
	 * @param source			Class instance which extends from conbo.Bindable (e.g. Map or Model)
	 * @param property			Property name to bind
	 * @param element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param parseFunction		Optional method used to parse values before outputting as HTML
	 */
	bindElement: function(source, propertyName, element, parseFunction)
	{
		if (!(source instanceof conbo.Bindable))
		{
			throw new Error('Source is not Bindable');
		}
		
		parseFunction = parseFunction || function(value)
		{
			return typeof(value) == 'undefined' ? '' : String(value); 
		};
		
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
	 * @param source					Class instance which extends conbo.Bindable
	 * @param sourcePropertyName		String
	 * @param destination				Object or class instance which extends conbo.Bindable
	 * @param destinationPropertyName	String (default: sourcePropertyName)
	 * @param twoWay					Boolean (default: false)
	 */
	bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
	{
		if (!(source instanceof conbo.Bindable)) throw new Error('Source is not Bindable');
		
		destinationPropertyName || (destinationPropertyName = sourcePropertyName);
		
		source.on('change:'+sourcePropertyName, function(event)
		{
			if (!(destination instanceof conbo.Bindable))
			{
				destination[destinationPropertyName] = event.value;
				return;
			}
			
			destination.set(destinationPropertyName, event.value);
		});
		
		if (twoWay && destination instanceof conbo.Bindable)
			this.bindProperty(destination, destinationPropertyName, source, sourcePropertyName);
		
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
		if (!(source instanceof conbo.Bindable)) throw new Error('Source is not Bindable');
		
		if (!_.isFunction(setterFunction))
		{
			if (!setterFunction || !_.has(setterFunction, propertyName)) throw new Error('Invalid setter function');
			setterFunction = setterFunction[propertyName];
		}
		
		source.on('change:'+propertyName, function(event)
		{
			setterFunction(event.value);
		});
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.BindingUtils';
	}
});

/**
 * List of view options to be merged as properties.
 */
var viewOptions = 
[
	'model', 
	'collection', 
	'el', 
	'id', 
	'attributes', 
	'className', 
	'tagName', 
	'events',
	'template',
	'templateUrl'
];

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
		options = _.clone(options) || {};
		
		this.cid = _.uniqueId('view');
		
		this._addStyle();
		this._configure(options);
		this._ensureElement();
		this._inject(options);
		
		this.initialize.apply(this, arguments);
		
		var templateUrl = _.result(this, 'templateUrl'),
			template;
		
		try
		{
			template = _.result(this, 'template');
		}
		catch (e) {}
		
		if (!!templateUrl)
		{
			this.load(templateUrl);
		}
		else
		{
			if (!!template && _.isString(template))
			{
				this.html(template);
			}
			
			this.render();
			this.bindView();
			this.delegateEvents();
		}
	},
	
	/**
	 * The default `tagName` of a View's element is `"div"`.
	 */
	tagName: 'div',
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
	
	/**
	 * jQuery delegate for element lookup, scoped to DOM elements within the
	 * current view. This should be prefered to global lookups where possible.
	 */
	$: function(selector)
	{
		return this.$el.find(selector);
	},
	
	/**
	 * Your class should override **render**, which is called automatically 
	 * after your View is initialized. If you're using a template, this means
	 * **render** is called immediately after the template is applied to your
	 * View's element (`this.el`).
	 * 
	 * If you want to apply Lo-Dash, Mustache or any other third party
	 * templating to your View, this is the place to do it.
	 * 
	 * The convention is for **render** to always return `this`.
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
		
		this.$el = $(element);
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
			throw new Error('Parameter must be instance of conbo.View class');
		
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
			throw new Error('Parameter must be instance of conbo.View class');
		
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
	 * Automatically bind elements to properties of this View
	 * 
	 * @example	<div cb-bind="name|parseMethod"></div> 
	 * @returns	this
	 */
	bindView: function()
	{
		var nestedViews = this.$('.cb-view');
		
		this.$('[cb-bind]').filter(function()
		{
			return !nestedViews.find(this).length;
		})
		.each(this.bind(function(index, el)
		{
			var d = this.$(el).cbData().bind,
				b = d.split('|'),
				s = this._cleanPropName(b[0]).split('.'),
				p = s.pop(),
				m,
				f;
			
			try
			{
				m = !!s.length ? eval('this.'+s.join('.')) : this;
			}
			catch (e) {}
			
			try
			{
				f = !!b[1] ? eval('this.'+this._cleanPropName(b[1])) : undefined;
				f = _.isFunction(f) ? f : undefined;
			}
			catch (e) {}
			
			if (!m) throw new Error(b[0]+' is not defined in this View');
			if (!p) throw new Error('Unable to bind to undefined property');
			
			conbo.BindingUtils.bindElement(m, p, el, f);
			
		}));
		
		return this;
	},
	
	/**
	 * Unbind elements from class properties
	 * @returns	this
	 */
	unbindView: function() 
	{
		// TODO Implement unbindView()
		return this;
	},
	
	/**
	 * Loads HTML content into this.el
	 * 
	 * @param 	url			A string containing the URL to which the request is sent
	 * @param 	data		A plain object or string that is sent to the server with the request
	 * @param 	complete	Callback in format function(responseText, textStatus, xmlHttpRequest)
	 * 
	 * @see					https://api.jquery.com/load/
	 */
	load: function(url, data, callbackFunction)
	{
		this.unbindView();
		this.undelegateEvents();
		
		var completeHandler = this.bind(function(response, status, xhr)
		{
			this.template = response;
			
			if (!!callbackFunction) callbackFunction.apply(this, arguments);
			
			this.render();
			this.bindView();
			this.delegateEvents();
		});
		
		this.$el.load(url, data, completeHandler);
	},
	
	/**
	 * Loads a CSS and apply it
	 * @param	url		The URL of the CSS
	 */
	loadCSS: function(url, callback)
	{
		if (!('document' in window)) return this;
		
		var $link = $('<link>').attr({rel:"stylesheet", type: "text/css", href:url}),
			link = $link[0],
			hasSheet = ('sheet' in link),
			sheet = hasSheet ? 'sheet' : 'styleSheet', 
			rules = hasSheet ? 'cssRules' : 'rules';
		
		var successInterval = setInterval(function()
		{
			try 
			{
				if (link[sheet] && link[sheet][rules].length) 
				{
					clearInterval(successInterval);
					clearTimeout(errorTimeout);
					callback(true);
				}
			}
			catch(e) {}
		}, 10);
		
		var errorTimeout = setTimeout( function() 
		{
			clearInterval(successInterval);
			clearTimeout(errorTimeout);
			$link.remove();
			callback(false);
		}, 15000);
		
		$('head').append($link);
		
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
			
			var match = key.match(/^(\S+)\s*(.*)$/);
			var eventName = match[1], selector = match[2];
			
			method = _.bind(method, this);
			eventName += '.delegateEvents' + this.cid;
			
			if (selector === '') 
			{
				this.$el.on(eventName, method);
			}
			else
			{
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
	undelegateEvents: function() 
	{
		this.$el.off('.delegateEvents' + this.cid);
		return this;
	},
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * Remove everything except alphanumberic and dots from Strings
	 * @param 		value
	 * @returns		String
	 */
	_cleanPropName: function(value)
	{
		return (value || '').replace(/[^\w\.]/g, '');
	},
	
	/**
	 * TODO Put this elsewhere, but still enable user to inject $ manually
	 * @private
	 */
	_addStyle: function()
	{
		if (!!conbo.style) return this;
		
		var style = $(
			'<style type="text/css">'+
				'.conbo-invisible { visibility:hidden !important; }'+
				'.conbo-excludeFromLayout { display:none !important; }'+
				'.conbo-disabled { pointer-events:none !important; }'+
			'</style>');
		
		$('head').append(style);
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
		if (!this.el) 
		{
			var attrs = _.extend({}, _.result(this, 'attributes'));
			if (this.id) attrs.id = _.result(this, 'id');
			if (this.className) attrs['class'] = _.result(this, 'className');
			var $el = $('<' + _.result(this, 'tagName') + '>').attr(attrs);
			this.setElement($el, false);
		}
		else 
		{
			this.setElement(_.result(this, 'el'), false);
			if (!!this.className) this.$el.addClass(this.className);
		}
		
		this.$el.addClass('cb-view');
	},
	
	/**
	 * @private
	 */
	_setClass: function(className, value)
	{
		var a = _.rest(arguments);
		
		if (!a.length) return !this.$el.hasClass(className);
		
		var isElement = _.isString(value) || _.isElement(value) || value instanceof $;
		var $el = isElement ? this.$(value) : this.$el;
		
		if (a.length == 1 && isElement) return !$el.hasClass(className);
		if (a.length == 2 && isElement) value = a[1];
		
		$el.removeClass(className);
		if (!value) $el.addClass(className);
		
		return this;
	}
});

//jQuery method shortcuts
var viewMethods = ['html'];

//Mix in each available Lo-Dash/Underscore method as a proxy to `Model#attributes`.
_.each(viewMethods, function(method)
{
	conbo.View.prototype[method] = function() 
	{
		return this.$el[method].apply(this.$el, arguments);
	};
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
		options = _.clone(options) || {};
		options.app = this;
		
		this.defineAccessor('context', undefined, undefined, new this.contextClass(options)); 
		this.defineAccessor('prefix', undefined, undefined, options.prefix || this.prefix || '');
		this.defineAccessor('namespace', undefined, undefined, options.namespace);
		
		if (!options.el && options.autoApply !== false)
		{
			this.applyApp();
		}
		
		conbo.View.prototype.constructor.apply(this, arguments);
		
		if (options.autoApply !== false)
		{
			this.applyViews();
		}
	},
	
	/**
	 * Apply this Application class to DOM element with matching cb-app attribute
	 */
	applyApp: function()
	{
		var appClassName;
		
		for (var a in this.namespace())
		{
			if (this instanceof this.namespace()[a])
			{
				appClassName = a;
				break;
			}
		}
		
		var selector = '[cb-app="'+this._addPrefix(appClassName)+'"]';
		var el = $(selector)[0];
		
		if (!!el) this.el = el;
		
		return this;
	},
	
	/**
	 * Apply View classes to DOM elements based on their cb-view attribute
	 */
	applyViews: function()
	{
		var selector = !!this.prefix()
			? '[cb-view^="'+this._addPrefix()+'"]'
			: '[cb-view]';
		
		this.$(selector).each(this.bind(function(index, el)
		{
			var view = this.$(el).cbData().view.replace(this._addPrefix(), ''),
				viewClass = this.namespace()[view];
			
			if (!_.isFunction(viewClass)) 
			{
				return;
			}
			
			new viewClass(this.context().addTo({el:el}));
			
		}));
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	/**
	 * Returns prefixed class name
	 * @param 	name
	 * @returns
	 */
	_addPrefix: function(name)
	{
		name = name || '';
		return !!this.prefix() ? this.prefix()+'.'+name : name;
	}
	
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
		this.defineAccessor('event', undefined, undefined, options.event || {});
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
		return 'conbo.Command';
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
		options = _.clone(options) || {};
		options.app = this;
		options.context || (options.context = new this.contextClass(options));
		
		this._inject(options);
		this.options = options;
		this.initialize.apply(this, arguments);
	},
	
	initialize: function() {},
	
	toString: function()
	{
		return 'conbo.ServerApplication';
	},
});

/**
 * conbo.Model
 *
 * Create a new model, with defined attributes. A client id (`cid`)
 * is automatically generated and assigned for you.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Model = conbo.Hash.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(attributes, options) 
	{
		var defaults;
		var attrs = attributes || {};
		
		options || (options = {});
		
		this.cid = _.uniqueId('c');
		this._attributes = {};
		
		_.extend(this, _.pick(options, ['url','urlRoot','collection']));
		
		if (options.parse)
		{
			attrs = this.parse(attrs, options) || {};
		}
		
		attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
		
		this.set(attrs, options);
		
		this._inject(options);
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * A hash of attributes whose current and previous value differ.
	 */
	changed: null,

	/**
	 * The value returned during the last failed validation.
	 */
	validationError: null,

	/**
	 * The default name for the JSON `id` attribute is `"id"`. MongoDB and
	 * CouchDB users may want to set this to `"_id"`.
	 */
	idAttribute: 'id',

	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},

	/**
	 * Proxy `conbo.sync` by default -- but override this if you need
	 * custom syncing semantics for *this* particular model.
	 */
	sync: function() 
	{
		return conbo.sync.apply(this, arguments);
	},

	/**
	 * Get the value of an attribute.
	 */
	get: function(attr) 
	{
		return this._attributes[attr];
	},

	/**
	 * Get the HTML-escaped value of an attribute.
	 */
	escape: function(attr) 
	{
		return _.escape(this.get(attr));
	},

	/**
	 * Returns `true` if the attribute contains a value that is not null
	 * or undefined.
	 */
	has: function(attr) 
	{
		return this.get(attr) != null;
	},

	/**
	 * Set a hash of model attributes on the object, firing `"change"`. This is
	 * the core primitive operation of a model, updating the data and notifying
	 * anyone who needs to know about the change in state. The heart of the beast.
	 */
	set: function(key, val, options) 
	{
		var attr, attrs, unset, changes, silent, changing, prev, current;
		
		if (key == null)
		{
			return this;
		}

		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (typeof key === 'object')
		{
			attrs = key;
			options = val;
		}
		else
		{
			(attrs = {})[key] = val;
		}

		options || (options = {});

		// Run validation.
		if (!this._validate(attrs, options))
		{
			return false;
		}
		
		// Extract attributes and options.
		unset					 = options.unset;
		silent					= options.silent;
		changes				 = [];
		changing				= this._changing;
		this._changing	= true;
		
		if (!changing) 
		{
			this._previousAttributes = _.clone(this._attributes);
			this.changed = {};
		}
		
		current = this._attributes;
		prev = this._previousAttributes;

		// Check for changes of `id`.
		if (this.idAttribute in attrs)
		{
			this.id = attrs[this.idAttribute];
		}

		// For each `set` attribute, update or delete the current value.
		for (attr in attrs) 
		{
			val = attrs[attr];
			
			if (!_.isEqual(current[attr], val)) 
			{
				changes.push(attr);
			}
			
			if (!_.isEqual(prev[attr], val)) 
			{
				this.changed[attr] = val;
			}
			else 
			{
				delete this.changed[attr];
			}
			
			unset ? delete current[attr] : current[attr] = val;
		}
		
		// Trigger all relevant attribute changes.
		if (!silent) 
		{
			if (changes.length) this._pending = true;
			
			for (var i=0, l=changes.length; i<l; i++) 
			{
				this.trigger(new conbo.ConboEvent('change:'+changes[i],
				{
					model: this,
					value: current[changes[i]], 
					options: options, 
					attribute: changes[i]
				}));
			}
		}
		
		// You might be wondering why there's a `while` loop here. Changes can
		// be recursively nested within `"change"` events.
		if (changing)
		{
			return this;
		}
		
		if (!silent) 
		{
			while (this._pending) 
			{
				this._pending = false;
				
				this.trigger(new conbo.ConboEvent(conbo.ConboEvent.CHANGE,
				{
					model: this,
					options: options
				}));
			}
		}
		
		this._pending = false;
		this._changing = false;
		
		return this;
	},

	/**
	 * Remove an attribute from the model, firing `"change"`. `unset` is a noop
	 * if the attribute doesn't exist.
	 */
	unset: function(attr, options) 
	{
		return this.set(attr, undefined, _.extend({}, options, {unset: true}));
	},

	/**
	 * Clear all attributes on the model, firing `"change"`.
	 */
	clear: function(options) 
	{
		var attrs = {};
		for (var key in this._attributes) attrs[key] = undefined;
		return this.set(attrs, _.extend({}, options, {unset: true}));
	},

	/**
	 * Determine if the model has changed since the last `"change"` event.
	 * If you specify an attribute name, determine if that attribute has changed.
	 */
	hasChanged: function(attr) 
	{
		if (attr == null) return !_.isEmpty(this.changed);
		return _.has(this.changed, attr);
	},

	/**
	 * Return an object containing all the attributes that have changed, or
	 * false if there are no changed attributes. Useful for determining what
	 * parts of a view need to be updated and/or what attributes need to be
	 * persisted to the server. Unset attributes will be set to undefined.
	 * You can also pass an attributes object to diff against the model,
	 * determining if there *would be* a change.
	 */
	changedAttributes: function(diff) 
	{
		if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
		var val, changed = false;
		var old = this._changing ? this._previousAttributes : this._attributes;
		for (var attr in diff) {
			if (_.isEqual(old[attr], (val = diff[attr]))) continue;
			(changed || (changed = {}))[attr] = val;
		}
		return changed;
	},

	/**
	 * Get the previous value of an attribute, recorded at the time the last
	 * `"change"` event was fired.
	 */
	previous: function(attr) 
	{
		if (attr == null || !this._previousAttributes) return null;
		return this._previousAttributes[attr];
	},

	/**
	 * Get all of the attributes of the model at the time of the previous
	 * `"change"` event.
	 */
	previousAttributes: function() 
	{
		return _.clone(this._previousAttributes);
	},

	/**
	 * Fetch the model from the server. If the server's representation of the
	 * model differs from its current attributes, they will be overridden,
	 * triggering a `"change"` event.
	 */
	fetch: function(options) 
	{
		options = options ? _.clone(options) : {};
		
		if (options.parse === undefined)
		{
			options.parse = true;
		}
		
		var success = options.success;
		
		options.success = this.bind(function(resp)
		{
			if (!this.set(this.parse(resp, options), options))
			{
				return false;
			}
			
			if (!!success) 
			{
				success(this, resp, options);
			}
			
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				model:		this,
				response:	resp,
				options:	options
			}));
		});
		
		wrapError(this, options);
		
		return this.sync('read', this, options);
	},
	
	/**
	 * Set a hash of model attributes, and sync the model to the server.
	 * If the server returns an attributes hash that differs, the model's
	 * state will be `set` again.
	 */
	save: function(key, val, options) 
	{
		var attrs, method, xhr, attributes = this._attributes;
		
		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (key == null || typeof key === 'object')
		{
			attrs = key;
			options = val;
		}
		else
		{
			(attrs = {})[key] = val;
		}

		// If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
		if (attrs && (!options || !options.wait) && !this.set(attrs, options)) 
		{
			return false;
		}

		options = _.extend({validate: true}, options);

		// Do not persist invalid models.
		if (!this._validate(attrs, options)) 
		{
			return false;
		}

		// Set temporary attributes if `{wait: true}`.
		if (attrs && options.wait)
		{
			this._attributes = _.extend({}, attributes, attrs);
		}

		// After a successful server-side save, the client is (optionally)
		// updated with the server-side state.
		if (options.parse === undefined) 
		{
			options.parse = true;
		}
			
		var model = this;
		var success = options.success;
			
		options.success = function(resp) 
		{
			// Ensure attributes are restored during synchronous saves.
			model._attributes = attributes;
			
			var serverAttrs = model.parse(resp, options);
			
			if (options.wait) 
			{
				serverAttrs = _.extend(attrs || {}, serverAttrs);
			}
			
			if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) 
			{
				return false;
			}
			
			if (success) 
			{
				success(model, resp, options);
			}
			
			model.trigger(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				model: model,
				response: resp, 
				options: options
			}));
		};
			
		wrapError(this, options);

		method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
		if (method === 'patch') options.attrs = attrs;
		xhr = this.sync(method, this, options);

		// Restore attributes.
		if (attrs && options.wait) this._attributes = attributes;
		
		return xhr;
	},

	/**
	 * Destroy this model on the server if it was already persisted.
	 * Optimistically removes the model from its collection, if it has one.
	 * If `wait: true` is passed, waits for the server to respond before removal.
	 */
	destroy: function(options) 
	{
		options = options ? _.clone(options) : {};
		
		var model = this;
		var success = options.success;
		
		var destroy = this.bind(function() 
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.DESTROY,
			{
				model: this,
				collection: model.collection,
				options: options
			}));
		});
		
		options.success = function(resp)
		{
			if (options.wait || model.isNew())
			{
				destroy();
			}
			
			if (success) 
			{
				success(model, resp, options);
			}
			
			if (!model.isNew()) 
			{
				model.trigger(new conbo.ConboEvent(conbo.ConboEvent.SYNC, 
				{
					model: model, 
					response: resp, 
					options: options
				}));
			}
		};
		
		if (this.isNew()) 
		{
			options.success();
			return false;
		}
		
		wrapError(this, options);

		var xhr = this.sync('delete', this, options);
		if (!options.wait) destroy();
		
		return xhr;
	},

	/**
	 * Default URL for the model's representation on the server -- if you're
	 * using conbo's restful methods, override this to change the endpoint
	 * that will be called.
	 */
	url: function() 
	{
		var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
		if (this.isNew()) return base;
		return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
	},

	/**
	 * Converts a response into the hash of attributes to be `set` on
	 * the model. The default implementation is just to pass the response along.
	 */
	parse: function(resp, options) 
	{
		return resp;
	},

	/**
	 * Create a new model with identical attributes to this one.
	 */
	clone: function() 
	{
		return new this.constructor(this._attributes);
	},

	/**
	 * A model is new if it has never been saved to the server, and lacks an id.
	 */
	isNew: function() 
	{
		return this.id == null;
	},

	/**
	 * Check if the model is currently in a valid state.
	 */
	isValid: function(options) 
	{
		return this._validate({}, _.extend(options || {}, { validate: true }));
	},
	
	toString: function()
	{
		return 'conbo.Model';
	},

	/**
	 * Run validation against the next complete set of model attributes,
	 * returning `true` if all is well. Otherwise, fire an `"invalid"` event.
	 */
	_validate: function(attrs, options) 
	{
		if (!options.validate || !this.validate) return true;
		attrs = _.extend({}, this._attributes, attrs);
		var error = this.validationError = this.validate(attrs, options) || null;
		if (!error) return true;
		
		this.trigger(new conbo.ConboEvent(conbo.ConboEvent.INVALID,
		{
			model: 		this,
			error: 		error,
			options: 	_.extend(options || {}, {validationError: error})
		}));
		
		return false;
	}
});

//TODO Don't have this here?
//Wrap an optional error callback with a fallback error event.
var wrapError = function (model, options)
{
	var callback = options.error;
	
	options.error = function(resp) 
	{
		if (!!callback) callback(model, resp, options);
		
		model.trigger(new conbo.ConboEvent(conbo.ConboEvent.ERROR,
		{
			model:model, 
			response:resp, 
			options:options
		}));
	};
};

/**
 * Collection
 *
 * Provides a standard collection class for our sets of models, ordered
 * or unordered. If a `comparator` is specified, the Collection will maintain
 * its models in sort order, as they're added and removed.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Collection = conbo.EventDispatcher.extend
({
	/**
	 * The default model for a collection is just a conbo.Model.
	 * This should be overridden in most cases.
	 */
	model: conbo.Model,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(models, options) 
	{
		options || (options = {});
		
		if (options.url) this.url = options.url;
		if (options.model) this.model = options.model;
		if (options.comparator !== undefined) this.comparator = options.comparator;
		
		this._reset();
		this._inject(options);
		
		if (models) 
		{
			this.reset(models, _.extend({silent: true}, options));
		}
		
		this.initialize.apply(this, arguments);
	},

	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},

	/**
	 * The JSON representation of a Collection is an array of the
	 * models' attributes.
	 */
	toJSON: function(options) 
	{
		return this.map(function(model){ return model.toJSON(options); });
	},

	/**
	 * Proxy `conbo.sync` by default.
	 */
	sync: function() 
	{
		return conbo.sync.apply(this, arguments);
	},

	/**
	 * Add a model, or list of models to the set.
	 */
	add: function(models, options)
	{
		return this.set(models, _.defaults(options || {}, {add: true, merge: false, remove: false}));
	},

	/**
	 * Remove a model, or a list of models from the set.
	 */
	remove: function(models, options)
	{
		models = _.isArray(models) ? models.slice() : [models];
		options || (options = {});
		
		var i, l, index, model;
		
		for (i = 0, l = models.length; i < l; i++) 
		{
			model = this.get(models[i]);
			
			if (!model) 
			{
				continue;
			}
			
			delete this._byId[model.id];
			delete this._byId[model.cid];
			
			index = this.indexOf(model);
			
			this.models.splice(index, 1);
			this.length--;
			
			if (!options.silent) 
			{
				options.index = index;
						
				this.trigger(new conbo.ConboEvent(conbo.ConboEvent.REMOVE,
				{
					model: model,
					collection: this,
					options: options
				}));
			}
			
			this._removeReference(model);
		}
		
		return this;
	},
	
	/**
	 * Update a collection by `set`-ing a new list of models, adding new ones,
	 * removing models that are no longer present, and merging models that
	 * already exist in the collection, as necessary. Similar to Model#set,
	 * the core operation for updating the data contained by the collection.
	 */
	set: function(models, options) 
	{
		options = _.defaults(options || {}, {add: true, remove: true, merge: true});
		
		if (options.parse) models = this.parse(models, options);
		if (!_.isArray(models)) models = models ? [models] : [];
		
		var i, l, model, existing, sort = false;
		var at = options.at;
		var sortable = this.comparator && (at == null) && options.sort !== false;
		var sortAttr = _.isString(this.comparator) ? this.comparator : null;
		var toAdd = [], toRemove = [], modelMap = {};

		// Turn bare objects into model references, and prevent invalid models
		// from being added.
		for (i=0, l=models.length; i<l; i++) 
		{
			if (!(model = this._prepareModel(models[i], options))) continue;

			// If a duplicate is found, prevent it from being added and
			// optionally merge it into the existing model.
			if (existing = this.get(model)) 
			{
				if (options.remove) 
				{
					modelMap[existing.cid] = true;
				}
				
				if (options.merge) 
				{
					existing.set(model.attributes, options);
					if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
				}

			} 
			// This is a new model, push it to the `toAdd` list.
			else if (options.add) 
			{
				toAdd.push(model);

				// Listen to added models' events, and index models for lookup by
				// `id` and by `cid`.
				model.on('all', this._onModelEvent, this);
				
				this._byId[model.cid] = model;
				
				if (model.id != null) 
				{
					this._byId[model.id] = model;
				}
			}
		}

		// Remove nonexistent models if appropriate.
		if (options.remove) 
		{
			for (i = 0, l = this.length; i < l; ++i) 
			{
				if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
			}
			
			if (toRemove.length) 
			{
				this.remove(toRemove, options);
			}
		}

		// See if sorting is needed, update `length` and splice in new models.
		if (toAdd.length) 
		{
			if (sortable) sort = true;
			
			this.length += toAdd.length;
			
			if (at != null) 
			{
				[].splice.apply(this.models, [at, 0].concat(toAdd));
			}
			else 
			{
				[].push.apply(this.models, toAdd);
			}
		}
		
		// Silently sort the collection if appropriate.
		if (sort) this.sort({silent: true});

		if (options.silent) return this;

		// Trigger `add` events.
		for (i=0, l=toAdd.length; i<l; i++) 
		{
			var model = toAdd[i];
			
			model.trigger(new conbo.ConboEvent(conbo.ConboEvent.ADD, 
			{
				model:model, 
				collection:this, 
				options:options
			}));
		}
		
		// Trigger `sort` if the collection was sorted.
		if (sort)
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.SORT, 
   			{
   				collection:this, 
   				options:options
   			}));
		}
		
		return this;
	},

	/**
	 * When you have more items than you want to add or remove individually,
	 * you can reset the entire set with a new list of models, without firing
	 * any `add` or `remove` events. Fires `reset` when finished.
	 */
	reset: function(models, options) 
	{
		options || (options = {});
		
		for (var i = 0, l = this.models.length; i < l; i++) 
		{
			this._removeReference(this.models[i]);
		}
		
		options.previousModels = this.models;
		
		this._reset();
		this.add(models, _.extend({silent: true}, options));
				
		if (!options.silent) 
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.RESET,
			{
				collection: this,
				options: options
			}));
		}
		
		return this;
	},
	
	/**
	 * Add a model to the end of the collection.
	 */
	push: function(model, options)
	{
		model = this._prepareModel(model, options);
		this.add(model, _.extend({at: this.length}, options));
		return model;
	},
	
	/**
	 * Remove a model from the end of the collection.
	 */
	pop: function(options)
	{
		var model = this.at(this.length - 1);
		this.remove(model, options);
		return model;
	},

	/**
	 * Add a model to the beginning of the collection.
	 */
	unshift: function(model, options) 
	{
		model = this._prepareModel(model, options);
		this.add(model, _.extend({at: 0}, options));
		return model;
	},

	/**
	 * Remove a model from the beginning of the collection.
	 */
	shift: function(options) 
	{
		var model = this.at(0);
		this.remove(model, options);
		return model;
	},

	/**
	 * Slice out a sub-array of models from the collection.
	 */
	slice: function(begin, end) 
	{
		return this.models.slice(begin, end);
	},

	/**
	 * Get a model from the set by id.
	 */
	get: function(obj) 
	{
		if (obj == null) return undefined;
		this._idAttr || (this._idAttr = this.model.prototype.idAttribute);
		return this._byId[obj.id || obj.cid || obj[this._idAttr] || obj];
	},

	/**
	 * Get the model at the given index.
	 */
	at: function(index) 
	{
		return this.models[index];
	},

	/**
	 * Return models with matching attributes. Useful for simple cases of `filter`.
	 */
	where: function(attrs, first) 
	{
		if (_.isEmpty(attrs)) return first ? undefined : [];
		
		return this[first ? 'find' : 'filter'](function(model) 
		{
			for (var key in attrs) 
			{
				if (attrs[key] !== model.get(key)) return false;
			}
			
			return true;
		});
	},

	/**
	 * Return the first model with matching attributes. Useful for simple cases
	 * of `find`.
	 */
	findWhere: function(attrs) 
	{
		return this.where(attrs, true);
	},
		
	/**
	 * Force the collection to re-sort itself. You don't need to call this under
	 * normal circumstances, as the set will maintain sort order as each item
	 * is added.
	 */
	sort: function(options) 
	{
		if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
		options || (options = {});
		
		// Run sort based on type of `comparator`.
		if (_.isString(this.comparator) || this.comparator.length === 1) 
		{
			this.models = this.sortBy(this.comparator, this);
		}
		else 
		{
			this.models.sort(_.bind(this.comparator, this));
		}

		if (!options.silent) 
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.SORT,
			{
				collection: this,
				options: options
			}));
		}
		
		return this;
	},

	/**
	 * Figure out the smallest index at which a model should be inserted so as
	 * to maintain order.
	 */
	sortedIndex: function(model, value, context) 
	{
		value || (value = this.comparator);
		
		var iterator = _.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return _.sortedIndex(this.models, model, iterator, context);
	},

	/**
	 * Pluck an attribute from each model in the collection.
	 */
	pluck: function(attr)
	{
		return _.invoke(this.models, 'get', attr);
	},

	/**
	 * Fetch the default set of models for this collection, resetting the
	 * collection when they arrive. If `reset: true` is passed, the response
	 * data will be passed through the `reset` method instead of `set`.
	 */
	fetch: function(options) 
	{
		options = options ? _.clone(options) : {};
		
		if (options.parse === undefined) options.parse = true;
		
		var success = options.success;
		var collection = this;
		
		options.success = function(resp)
		{
			var method = options.reset ? 'reset' : 'set';
			
			collection[method](resp, options);
			
			if (success)
			{
				success(collection, resp, options);
			}
			
			collection.trigger(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				collection:	collection,
				response:	resp,
				options:	options
			}));
		};
		
		wrapError(this, options);
		
		return this.sync('read', this, options);
	},
		
	/**
	 * Create a new instance of a model in this collection. Add the model to the
	 * collection immediately, unless `wait: true` is passed, in which case we
	 * wait for the server to agree.
	 */
	create: function(model, options) 
	{
		options = options ? _.clone(options) : {};
		
		if (!(model = this._prepareModel(model, options))) return false;
		if (!options.wait) this.add(model, options);
		
		var collection = this;
		var success = options.success;
		
		options.success = function(resp) 
		{
			if (options.wait) collection.add(model, options);
			if (success) success(model, resp, options);
		};
		
		model.save(null, options);
		
		return model;
	},
		
	/**
	 * parse converts a response into a list of models to be added to the
	 * collection. The default implementation is just to pass it through.
	 */
	parse: function(resp, options) 
	{
		return resp;
	},

	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this.models);
	},

	/**
	 * Private method to reset all internal state. Called when the collection
	 * is first initialized or reset.
	 */
	_reset: function() 
	{
		this.length = 0;
		this.models = [];
		this._byId	= {};
	},
	
	/**
	 * Prepare a hash of attributes (or other model) to be added to this
	 * collection.
	 */
	_prepareModel: function(attrs, options) 
	{
		if (attrs instanceof conbo.Model) 
		{
			if (!attrs.collection) attrs.collection = this;
			return attrs;
		}
		
		options || (options = {});
		options.collection = this;
		
		var model = new this.model(attrs, options);
		
		if (!model._validate(attrs, options)) 
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.INVALID,
			{
				collection:	this,
				attrs:		attrs,
				options:	options
			}));
			
			return false;
		}
		
		return model;
	},
		
	/**
	 * Internal method to sever a model's ties to a collection.
	 */
	_removeReference: function(model) {
		if (this === model.collection) delete model.collection;
		model.off('all', this._onModelEvent, this);
	},

	/**
	 * Internal method called every time a model in the set fires an event.
	 * Sets need to update their indexes when models change ids. All other
	 * events simply proxy through. "add" and "remove" events that originate
	 * in other collections are ignored.
	 * 
	 * @example		_onModelEvent: function(event, model, collection, options) 
	 */
	_onModelEvent: function(event)
	{
		if ((event.type == conbo.ConboEvent.ADD 
			|| event.type == conbo.ConboEvent.REMOVE) && event.collection != this)
		{
			return;
		}
		
		var model = event.model;
		
		if (event.type == conbo.ConboEvent.DESTROY) 
		{
			this.remove(model, event.options);
		}
		
		if (model && event.type == 'change:' + model.idAttribute) 
		{
			delete this._byId[event.model.previous(model.idAttribute)];
			
			if (model.id != null) 
			{
				this._byId[model.id] = model;
			}
		}
		
		this.trigger(event);
	},

	toString: function()
	{
		return 'conbo.Collection';
	}
});

// Underscore methods that we want to implement on the Collection.
var methods = 
[
	'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
	'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
	'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
	'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
	'isEmpty', 'chain'
];

// Mix in each available Underscore/Lo-Dash method as a proxy to `Collection#models`.
_.each(methods, function(method) 
{
	if (!_.has(_, method)) return;
	
	conbo.Collection.prototype[method] = function() 
	{
		var args = [].slice.call(arguments);
		args.unshift(this.models);
		return _[method].apply(_, args);
	};
});

// Underscore methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

// Use attributes instead of properties.
_.each(attributeMethods, function(method)
{
	if (!_.has(_, method)) return;
	
	conbo.Collection.prototype[method] = function(value, context) 
	{
		var iterator = _.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return _[method](this.models, iterator, context);
	};
});

// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
var rootStripper = /^\/+|\/+$/g;

// Cached regex for detecting MSIE.
var isExplorer = /msie [\w.]+/;

// Cached regex for removing a trailing slash.
var trailingSlash = /\/$/;

/**
 * conbo.History
 * 
 * Handles cross-browser history management, based on either
 * [pushState](http://diveintohtml5.info/history.html) and real URLs, or
 * [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
 * and URL fragments. If the browser supports neither (old IE, natch),
 * falls back to polling.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.History = conbo.EventDispatcher.extend
({
	/**
	 * Has the history handling already been started?
	 */
	started: false,
	
	/**
	 * The default interval to poll for hash changes, if necessary, is
	 * twenty times a second.
	 */
	interval: 50,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this.handlers = [];
		this.bindAll('checkUrl');
		
		// Ensure that `History` can be used outside of the browser.
		if (typeof window !== 'undefined')
		{
			this.location = window.location;
			this.history = window.history;
		}
		
		this._inject(options);
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize: Override this!
	 */
	initialize: function(){},
	
	/**
	 * Gets the true hash value. Cannot use location.hash directly due
	 * to bug
	 * in Firefox where location.hash will always be decoded.
	 */
	getHash: function(window)
	{
		var match = (window || this).location.href.match(/#(.*)$/);
		return match ? match[1]: '';
	},
	
	/**
	 * Get the cross-browser normalized URL fragment, either from the
	 * URL,
	 * the hash, or the override.
	 */
	getFragment: function(fragment, forcePushState)
	{
		if (fragment == null)
		{
			if (this._hasPushState || !this._wantsHashChange
					|| forcePushState)
			{
				fragment = this.location.pathname;
				var root = this.root.replace(trailingSlash, '');
				if (!fragment.indexOf(root)) fragment = fragment
						.substr(root.length);
			}
			else
			{
				fragment = this.getHash();
			}
		}
		return fragment.replace(routeStripper, '');
	},
	
	/**
	 * Start the hash change handling, returning `true` if the current
	 * URL matches an existing route, and `false` otherwise.
	 */
	start: function(options)
	{
		if (this.started) throw new Error("conbo.history has already been started");
		this.started = true;
		
		// Figure out the initial configuration. Do we need an iframe?
		// Is pushState desired ... is it available?
		this.options = _.extend(
		{},
		{
			root: '/'
		}, this.options, options);
		this.root = this.options.root;
		this._wantsHashChange = this.options.hashChange !== false;
		this._wantsPushState = !!this.options.pushState;
		this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
		var fragment = this.getFragment();
		var docMode = document.documentMode;
		var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
		
		// Normalize root to always include a leading and trailing
		// slash.
		this.root = ('/' + this.root + '/').replace(rootStripper, '/');
		
		if (oldIE && this._wantsHashChange)
		{
			this.iframe = $(
					'<iframe src="javascript:0" tabindex="-1" />')
					.hide().appendTo('body')[0].contentWindow;
			this.navigate(fragment);
		}
		
		// Depending on whether we're using pushState or hashes, and whether 
		// 'onhashchange' is supported, determine how we check the URL state.
		if (this._hasPushState)
		{
			$(window).on('popstate', this.checkUrl);
		}
		else if (this._wantsHashChange && ('onhashchange' in window)
				&& !oldIE)
		{
			$(window).on('hashchange', this.checkUrl);
		}
		else if (this._wantsHashChange)
		{
			this._checkUrlInterval = setInterval(this.checkUrl,
					this.interval);
		}
		
		// Determine if we need to change the base url, for a pushState
		// link
		// opened by a non-pushState browser.
		this.fragment = fragment;
		var loc = this.location;
		var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;
		
		// If we've started off with a route from a `pushState`-enabled
		// browser,
		// but we're currently in a browser that doesn't support it...
		if (this._wantsHashChange && this._wantsPushState
				&& !this._hasPushState && !atRoot)
		{
			this.fragment = this.getFragment(null, true);
			this.location.replace(this.root + this.location.search
					+ '#' + this.fragment);
			// Return immediately as browser will do redirect to new url
			return true;
			
			// Or if we've started out with a hash-based route, but
			// we're currently
			// in a browser where it could be `pushState`-based
			// instead...
		}
		else if (this._wantsPushState && this._hasPushState && atRoot
				&& loc.hash)
		{
			this.fragment = this.getHash().replace(routeStripper, '');
			this.history.replaceState(
			{}, document.title, this.root + this.fragment + loc.search);
		}
		
		if (!this.options.silent) return this.loadUrl();
	},
	
	/**
	 * Disable conbo.history, perhaps temporarily. Not useful in a real app,
	 * but possibly useful for unit testing Routers.
	 */
	stop: function()
	{
		$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
		clearInterval(this._checkUrlInterval);
		this.started = false;
	},
	
	/**
	 * Add a route to be tested when the fragment changes. Routes added
	 * later may override previous routes.
	 */
	route: function(route, callback)
	{
		this.handlers.unshift({route:route, callback:callback});
	},
	
	/**
	 * Checks the current URL to see if it has changed, and if it has,
	 * calls `loadUrl`, normalizing across the hidden iframe.
	 */
	checkUrl: function(e)
	{
		var current = this.getFragment();
		if (current === this.fragment && this.iframe)
		{
			current = this.getFragment(this.getHash(this.iframe));
		}
		if (current === this.fragment) return false;
		if (this.iframe) this.navigate(current);
		this.loadUrl() || this.loadUrl(this.getHash());
	},
	
	/**
	 * Attempt to load the current URL fragment. If a route succeeds with a
	 * match, returns `true`. If no defined routes matches the fragment, returns `false`.
	 */
	loadUrl: function(fragmentOverride)
	{
		var fragment = this.fragment = this.getFragment(fragmentOverride);
		
		var matched = _.any(this.handlers, function(handler)
		{
			if (handler.route.test(fragment))
			{
				handler.callback(fragment);
				return true;
			}
		});
		return matched;
	},
	
	/**
	 * Save a fragment into the hash history, or replace the URL state
	 * if the 'replace' option is passed. You are responsible for properly
	 * URL-encoding the fragment in advance.
	 * 
	 * The options object can contain `trigger: true` if you wish to have the
	 * route callback be fired (not usually desirable), or `replace: true`, if
	 * you wish to modify the current URL without adding an entry to the history.
	 */
	navigate: function(fragment, options)
	{
		if (!this.started) return false;
		if (!options || options === true) options =
		{
			trigger: options
		};
		fragment = this.getFragment(fragment || '');
		if (this.fragment === fragment) return;
		this.fragment = fragment;
		var url = this.root + fragment;
		
		// If pushState is available, we use it to set the fragment as a
		// real URL.
		if (this._hasPushState)
		{
			this.history[options.replace ? 'replaceState': 'pushState']({}, document.title, url);
			
			// If hash changes haven't been explicitly disabled, update
			// the hash
			// fragment to store history.
		}
		else if (this._wantsHashChange)
		{
			this._updateHash(this.location, fragment, options.replace);
			
			if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe))))
			{
				// Opening and closing the iframe tricks IE7 and earlier
				// to push a history entry on hash-tag change. When replace is
				// true, we don't want this.
				if (!options.replace) this.iframe.document.open().close();
				this._updateHash(this.iframe.location, fragment, options.replace);
			}
			
			// If you've told us that you explicitly don't want fallback
			// hashchange-based history, then `navigate` becomes a page refresh.
		}
		else
		{
			return this.location.assign(url);
		}
		
		if (options.trigger) this.loadUrl(fragment);
	},
	
	toString: function()
	{
		return 'conbo.History';
	},
	
	
	/**
	 * Update the hash location, either replacing the current entry, or
	 * adding a new one to the browser history.
	 */
	_updateHash: function(location, fragment, replace)
	{
		if (replace)
		{
			var href = location.href.replace(/(javascript:|#).*$/, '');
			location.replace(href + '#/' + fragment);
		}
		else
		{
			// Some browsers require that `hash` contains a leading #.
			location.hash = '#/' + fragment;
		}
	}
	
});

// Create default instance of the History class
conbo.history = new conbo.History();

var optionalParam = /\((.*?)\)/g;
var namedParam		= /(\(\?)?:\w+/g;
var splatParam		= /\*\w+/g;
var escapeRegExp	= /[\-{}\[\]+?.,\\\^$|#\s]/g;

/**
 * Router
 * 
 * Routers map faux-URLs to actions, and fire events when routes are
 * matched. Creating a new one sets its `routes` hash, if not set statically.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Router = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options) 
	{
		options || (options = {});
		if (options.routes) this.routes = options.routes;
		this._bindRoutes();
		
		this._inject(options);
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize: Override this!
	 */
	initialize: function(){},

	/**
	 * Manually bind a single named route to a callback. For example:
	 * 
	 * @example
	 * 		this.route('search/:query/p:num', 'search', function(query, num) {
	 * 			 ...
	 * 		});
	 */ 
	route: function(route, name, callback) 
	{
		if (!_.isRegExp(route)) 
		{
			route = this._routeToRegExp(route);
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		if (_.isFunction(name)) 
		{
			callback = name;
			name = '';
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		conbo.history.route(route, this.bind(function(fragment)
		{
			var args = this._extractParameters(route, fragment);
			callback && callback.apply(this, args);
			
			var options = 
			{
				router:		this,
				route:		route,
				name:		name,
				parameters:	args
			}
			
			this.trigger(new conbo.ConboEvent('route:'+name, options));
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
			
			conbo.history.trigger(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
		}));
		
		return this;
	},

	/**
	 * Simple proxy to `conbo.history` to save a fragment into the history.
	 */
	navigate: function(fragment, options) 
	{
		conbo.history.navigate(fragment, options);
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Router';
	},
	
	/**
	 * Bind all defined routes to `conbo.history`. We have to reverse the
	 * order of the routes here to support behavior where the most general
	 * routes can be defined at the bottom of the route map.
	 * 
	 * @private
	 */
	_bindRoutes: function() 
	{
		if (!this.routes) return;
		this.routes = _.result(this, 'routes');
		var route, routes = _.keys(this.routes);
		while ((route = routes.pop()) != null) {
			this.route(route, this.routes[route]);
		}
	},

	/**
	 * Convert a route string into a regular expression, suitable for matching
	 * against the current location hash.
	 * 
	 * @private
	 */
	_routeToRegExp: function(route) 
	{
		route = route.replace(escapeRegExp, '\\$&')
			.replace(optionalParam, '(?:$1)?')
			.replace(namedParam, function(match, optional){
				return optional ? match : '([^\/]+)';
			})
			.replace(splatParam, '(.*?)');
		
		return new RegExp('^' + route + '$');
	},

	/**
	 * Given a route, and a URL fragment that it matches, return the array of
	 * extracted decoded parameters. Empty or unmatched parameters will be
	 * treated as `null` to normalize cross-browser behavior.
	 * 
	 * @private
	 */
	_extractParameters: function(route, fragment) 
	{
		var params = route.exec(fragment).slice(1);
		return _.map(params, function(param) {
			return param ? decodeURIComponent(param) : null;
		});
	}

});

/**
 * Sync
 * 
 * Override this function to change the manner in which conbo persists
 * models to the server. You will be passed the type of request, and the
 * model in question. By default, makes a RESTful Ajax request
 * to the model's `url()`. Some possible customizations could be:
 * 
 * - Use `setTimeout` to batch rapid-fire updates into a single request.
 * - Send up the models as XML instead of JSON.
 * - Persist models via WebSockets instead of Ajax.
 * 
 * Turn on `conbo.emulateHTTP` in order to send `PUT` and `DELETE` requests
 * as `POST`, with a `_method` parameter containing the true HTTP method,
 * as well as all requests with the body as `application/x-www-form-urlencoded`
 * instead of `application/json` with the model in a param named `model`.
 * Useful when interfacing with server-side languages like **PHP** that make
 * it difficult to read the body of `PUT` requests.
 * 
 * Derived from the Backbone.js method of the same name
 */
conbo.sync = function(method, model, options) 
{
	var type = methodMap[method];

	// Default options, unless specified.
	_.defaults(options || (options = {}), 
	{
		emulateHTTP: conbo.emulateHTTP,
		emulateJSON: conbo.emulateJSON
	});

	// Default JSON-request options.
	var params =
	{
		type: type, 
		dataType: options.dataType || model.dataType || 'json'
	};

	// Ensure that we have a URL.
	if (!options.url) 
	{
		var url = _.result(model, 'url');
		if (!url) throw new Error('"url" must be specified');
		params.url = url;
	}
	
	// Ensure that we have the appropriate request data.
	if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) 
	{
		params.contentType = 'application/json';
		params.data = JSON.stringify(options.attrs || model.toJSON(options));
	}

	// For older servers, emulate JSON by encoding the request into an HTML-form.
	if (options.emulateJSON)
	{
		params.contentType = 'application/x-www-form-urlencoded';
		params.data = params.data ? {model: params.data} : {};
	}

	// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	// And an `X-HTTP-Method-Override` header.
	if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) 
	{
		params.type = 'POST';
		
		if (options.emulateJSON)
		{
			params.data._method = type;
		}
		
		var beforeSend = options.beforeSend;
		
		options.beforeSend = function(xhr) 
		{
			xhr.setRequestHeader('X-HTTP-Method-Override', type);
			if (beforeSend) return beforeSend.apply(this, arguments);
		};
	}

	// Don't process data on a non-GET request.
	if (params.type !== 'GET' && !options.emulateJSON) 
	{
		params.processData = false;
	}
	
	// Enable the use of non-JSON data formats; must use parse() in model/collection
	if (params.dataType != 'json')
	{
		params.contentType = options.contentType || model.dataType || 'application/json';
			params.processData = false;
	}
	
	// If we're sending a `PATCH` request, and we're in an old Internet Explorer
	// that still has ActiveX enabled by default, override jQuery to use that
	// for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
	if (params.type === 'PATCH' && window.ActiveXObject &&
		!(window.external && window.external.msActiveXFilteringEnabled)) 
	{
		params.xhr = function()
		{
			return new ActiveXObject("Microsoft.XMLHTTP");
		};
	}

	// Make the request, allowing the user to override any Ajax options.
	var xhr = options.xhr = conbo.ajax(_.extend(params, options));
	
	model.trigger(new conbo.ConboEvent(conbo.ConboEvent.REQUEST,
	{
		model: model, 
		xhr: xhr, 
		options: options
	}));
	
	return xhr;
};

/** 
 * Map from CRUD to HTTP for our default `conbo.sync` implementation.
 */
var methodMap = 
{
	'create':	'POST',
	'update':	'PUT',
	'patch':	'PATCH',
	'delete':	'DELETE',
	'read':		'GET'
};

/**
 * Set the default implementation of `conbo.ajax` to proxy through to `$`.
 * Override this if you'd like to use a different library.
 */
conbo.ajax = function() 
{
	return $.ajax.apply($, arguments);
};


		return conbo;
	}
	
	// Node.js
	if (typeof module !== 'undefined' && module.exports)
	{
		var _, $;
		
		try { _ = require('lodash'); } catch (e) {
		try { _ = require('underscore'); } catch (e)
			{ throw new Error('Conbo.js requires underscore or lodash'); }}
		
		try { $ = require('jQuery'); } catch (e) {
		try { $ = require('jquery'); } catch (e) {}}
		
    	module.exports = create(_, $);
    }
    // AMD
    else if (typeof define === 'function' && define.amd) 
	{
		define('conbo', ['underscore','jquery'], function (_, $)
		{
			return create(_, $);
		});
	}
	// Global
	else
	{
		window.conbo = create(window._, window.jQuery || window.Zepto || window.ender);
	}
	
})(this, document);
