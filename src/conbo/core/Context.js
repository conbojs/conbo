/**
 * conbo.Context
 * 
 * This is your application's event bus and dependency injector, and is
 * usually where all your models and web service classes are registered,
 * using mapSingleton(...), and Command classes are mapped to events 
 * 
 * @class		conbo.Context
 * @augments	conbo.EventDispatcher
 * @author		Neil Rackett
 */
conbo.Context = conbo.EventDispatcher.extend(
/** @lends conbo.Context.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options || (options = {});
		
		__defineUnenumerableProperty(this, '__commands', {});
		__defineUnenumerableProperty(this, '__singletons', {});
		
		this.app = options.app;
		this.namespace = options.namespace || options.app.namespace;
		
		this.addEventListener(conbo.Event.ALL, this.__allHandler);
		this.initialize.apply(this, arguments);
		
		conbo.makeAllBindable(this, this.bindable);
	},
	
	/**
	 * Initialize: Override this
	 * @param options
	 */
	initialize: function(options) {},
	
	/**
	 * Create a new subcontext that shares the same application
	 * and namespace as this one
	 * 
	 * @param	The context class to use (default: conbo.Context)
	 * @returns {conbo.Context}
	 */
	createSubcontext: function(contextClass)
	{
		contextClass || (contextClass = conbo.Context);
		return new contextClass(this);
	},
	
	/**
	 * Map specified Command class the given event
	 */
	mapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (!commandClass) throw new Error('commandClass for '+eventType+' cannot be undefined');
		
		if (this.__mapMulti(eventType, commandClass, this.mapCommand)) return;
		
		if (this.__commands[eventType] && this.__commands[eventType].indexOf(commandClass) != -1)
		{
			return;
		}
		
		this.__commands[eventType] = this.__commands[eventType] || [];
		this.__commands[eventType].push(commandClass);
		
		return this;
	},
	
	/**
	 * Unmap specified Command class from given event
	 */
	unmapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (this.__mapMulti(eventType, commandClass, this.unmapCommand)) return;
		
		if (commandClass === undefined)
		{
			delete this.__commands[eventType];
			return;
		}
		
		if (!this.__commands[eventType]) return;
		var index = this.__commands[eventType].indexOf(commandClass);
		if (index == -1) return;
		this.__commands[eventType].splice(index, 1);
		
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
	 * @example		myProperty: undefined
	 */
	mapSingleton: function(propertyName, singletonClass)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		
		if (!singletonClass) 
		{
			conbo.warn('singletonClass for '+propertyClass+' is undefined');
		}
		
		if (this.__mapMulti(propertyName, singletonClass, this.mapSingleton)) return;
		
		this.__singletons[propertyName] = conbo.isClass(singletonClass)
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
		if (this.__mapMulti(propertyName, null, this.unmapSingleton)) return;
		
		if (!this.__singletons[propertyName]) return;
		delete this.__singletons[propertyName];
		
		return this;
	},
	
	/**
	 * Add this context to the specified Object
	 */
	addTo: function(obj)
	{
		return conbo.extend(obj || {}, {context:this});
	},
	
	/**
	 * Inject singleton instances into specified object
	 */
	injectSingletons: function(obj)
	{
		for (var a in obj)
		{
			if (obj[a] !== undefined) continue;
			
			if (a in this.__singletons)
			{
				obj[a] = this.__singletons[a];
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
	__allHandler: function(event)
	{
		var commands = conbo.union(this.__commands.all || [], this.__commands[event.type] || []);
		if (!commands.length) return;
		
		conbo.forEach(commands, function(commandClass, index, list)
		{
			this.__executeCommand(commandClass, event);
		}, 
		this);
	},
	
	/**
	 * @private
	 */
	__executeCommand: function(commandClass, event)
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
	__mapMulti: function(n, c, f)
	{
		if (conbo.isArray(n) || n.indexOf(' ') == -1) return false;
		var names = conbo.isArray(n) ? n : n.split(' ');
		conbo.forEach(names, function(e) { f(e,c); }, this);
		return true;
	}
	
});

__denumerate(conbo.Context.prototype);
