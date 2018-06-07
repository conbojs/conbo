/**
 * conbo.Context
 * 
 * This is your application's event bus and dependency injector, and is
 * usually where all your models and web service classes are registered,
 * using mapSingleton(...), and Command classes are mapped to events 
 * 
 * @class		Context
 * @memberof	conbo
 * @augments	conbo.EventDispatcher
 * @author		Neil Rackett
 * @param 		{Object} options - Object containing initialisation options, including 'app' (Application) and 'namespace' (Namespace) 
 */
conbo.Context = conbo.EventDispatcher.extend(
/** @lends conbo.Context.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options)
	{
		__definePrivateProperties(this, 
		{
			__commands: options.commands || {},
			__singletons: options.singletons || {},
			__app: options.app,
			__namespace: options.namespace || options.app.namespace,
			__parentContext: options.context
		});
		
		this.addEventListener(conbo.Event.ALL, this.__allHandler);
	},
	
	/**
	 * The Application instance associated with this context
	 * @returns {conbo.Application}
	 */
	get app()
	{
		return this.__app;
	},
	
	/**
	 * The Namespace this context exists in
	 * @returns {conbo.Namespace}
	 */
	get namespace()
	{
		return this.__namespace;
	},
	
	/**
	 * If this is a subcontext, this is a reference to the Context that created it
	 * @returns {conbo.Context}
	 */
	get parentContext()
	{
		return this.__parentContext;
	},
	
	/**
	 * Create a new subcontext that shares the same application
	 * and namespace as this one
	 * 
	 * @param	{class} [contextClass] - The context class to use (default: conbo.Context)
	 * @param	{boolean} [cloneSingletons] - Should this Context's singletons be duplicated on the new subcontext? (default: false)
	 * @param	{boolean} [cloneCommands] - Should this Context's commands be duplicated on the new subcontext? (default: false)
	 * @returns {conbo.Context}
	 */
	createSubcontext: function(contextClass, cloneSingletons, cloneCommands)
	{
		contextClass || (contextClass = conbo.Context);
		return new contextClass
		({
			context: this,
			app: this.app,
			namespace: this.namespace,
			commands: cloneCommands ? conbo.clone(this.__commands) : undefined,
			singletons: cloneSingletons ? conbo.clone(this.__singletons) : undefined
		});
	},
	
	/**
	 * Map specified Command class the given event
	 * @param	{string}	eventType - The name of the event
	 * @param	{class}		commandClass - The command class to instantiate when the event is dispatched
	 */
	mapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (!commandClass) throw new Error('commandClass for '+eventType+' cannot be undefined');
		
		if (this.__commands[eventType] && this.__commands[eventType].indexOf(commandClass) != -1)
		{
			return this;
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
		
		if (commandClass === undefined)
		{
			delete this.__commands[eventType];
			return this;
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
	 * with the Context and declare the value as undefined in your class
	 * to enable it to be injected at run time
	 * 
	 * @example		context.mapSingleton('myProperty', MyModel);
	 * @example		myProperty: undefined
	 */
	mapSingleton: function(propertyName, singletonClass)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		
		if (singletonClass === undefined)
		{
			conbo.warn('singletonClass for '+propertyName+' is undefined');
		}

		if (conbo.isClass(singletonClass))
		{
			var args = conbo.rest(arguments);

			if (args.length == 1 && singletonClass.prototype instanceof conbo.ConboClass)
			{
				args.push(this);
			}

			this.__singletons[propertyName] = new (Function.prototype.bind.apply(singletonClass, args))
		}
		else
		{
			this.__singletons[propertyName] = singletonClass;
		}
			
		return this;
	},
	
	/**
	 * Unmap class instance from a property name
	 */
	unmapSingleton: function(propertyName)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		
		if (!this.__singletons[propertyName]) return;
		delete this.__singletons[propertyName];
		
		return this;
	},
	
	/**
	 * Map constant value to a property name
	 * 
	 * To inject a constant into a class, register the property name
	 * with the Context and declare the property as undefined in your 
	 * class to enable it to be injected at run time
	 * 
	 * @example		context.mapConstant('MY_VALUE', 123);
	 * @example		MY_VALUE: undefined
	 */
	mapConstant: function(propertyName, value)
	{
		return this.mapSingleton(propertyName, value);
	},
	
	/**
	 * Unmap constant value from a property name
	 */
	unmapConstant: function(propertyName)
	{
		return this.unmapSingleton(propertyName);
	},
	
	/**
	 * Add this Context to the specified Object, or create an object with a 
	 * reference to this Context
	 */
	addTo: function(obj)
	{
		return conbo.defineValues(obj || {}, {context:this});
	},
	
	/**
	 * Inject singleton instances into specified object
	 * 
	 * @param	obj		{Object} 	The object to inject singletons into
	 */
	injectSingletons: function(obj)
	{
		var scope = this;

		for (var a in scope.__singletons)
		{
			if (!(a in obj)) continue;

			Object.defineProperty(obj, a,
			{
				configurable: true,
				get: function() { return scope.__singletons[a]; }
			})
		}
		
		return this;
	},
	
	/**
	 * Set all singleton instances on the specified object to undefined
	 * 
	 * @param	obj		{Object} 	The object to remove singletons from
	 */
	uninjectSingletons: function(obj)
	{
		for (var a in this.__singletons)
		{
			if (a in obj)
			{
				Object.defineProperty(obj, a,
				{
					configurable: true,
					value: undefined
				});
			}
		}

		return this;
	},

	/**
	 * Clears all commands and singletons, and removes all listeners
	 */
	destroy: function()
	{
		conbo.assign(this,
		{
			__commands: undefined,
			__singletons: undefined,
			__app: undefined,
			__namespace: undefined,
			__parentContext: undefined
		});

		this.removeEventListener();

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
	
});

__denumerate(conbo.Context.prototype);
