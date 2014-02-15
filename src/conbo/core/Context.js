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
		this.application = this.options.application;
		
		// @deprecated
		this.view = this.application;
		
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
			obj[a] = this._singletons[a];
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
