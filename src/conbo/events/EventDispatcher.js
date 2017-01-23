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
 * @class		conbo.EventDispatcher
 * @augments	conbo.Class
 * @author		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including 'context'
 */
conbo.EventDispatcher = conbo.ConboClass.extend(
/** @lends conbo.EventDispatcher.prototype */
{
	/**
	 * Do not override: use initialize
	 * @private
	 */
	__construct: function(options)
	{
		if (!!options.context)
		{
			this.context = options.context;
		}
	},
	
	/**
	 * Add a listener for a particular event type
	 * 
	 * @param type		{string}	Type of event ('change') or events ('change blur')
	 * @param handler	{function}	Function that should be called
	 * @param scope		{object}	The scope in which to run the event handler (optional)
	 * @param priority	{number}	The event handler's priority when the event is dispatached (default: 0)
	 * @param once		{boolean}	Should the event listener automatically be removed after it has been called once? (default: false) 
	 */
	addEventListener: function(type, handler, scope, priority, once)
	{
		if (!type) throw new Error('Event type undefined');
		if (!handler || !conbo.isFunction(handler)) throw new Error('Event handler is undefined or not a function');

		if (conbo.isString(type)) type = type.split(' ');
		if (conbo.isArray(type)) conbo.forEach(type, function(value, index, list) { this.__addEventListener(value, handler, scope, priority, !!once); }, this);
		
		return this;
	},
	
	/**
	 * Remove a listener for a particular event type
	 * 
	 * @param type		{string}	Type of event ('change') or events ('change blur') (optional: if not specified, all listeners will be removed) 
	 * @param handler	{function}	Function that should be called (optional: if not specified, all listeners of the specified type will be removed)
	 * @param scope		{object} 	The scope in which the handler is set to run (optional)
	 */
	removeEventListener: function(type, handler, scope)
	{
		if (!arguments.length)
		{
			__definePrivateProperty(this, '__queue', {});
			return this;
		}
		
		if (conbo.isString(type)) type = type.split(' ');
		if (!conbo.isArray(type)) type = [undefined];
		
		conbo.forEach(type, function(value, index, list) 
		{
			this.__removeEventListener(value, handler, scope); 
		}, 
		this);
		
		return this;
	},
	
	/**
	 * Does this object have an event listener of the specified type?
	 * 
	 * @param type		{string}	Type of event (e.g. 'change') 
	 * @param handler	{function}	Function that should be called (optional)
	 * @param scope		{object} 	The scope in which the handler is set to run (optional)
	 */
	hasEventListener: function(type, handler, scope)
	{
		if (!this.__queue 
			|| !(type in this.__queue)
			|| !this.__queue[type].length)
		{
			return false;
		}
		
		var queue = this.__queue[type];
		var length = queue.length;
		
		for (var i=0; i<length; i++)
		{
			if ((!handler || queue[i].handler == handler) 
				&& (!scope || queue[i].scope == scope))
			{
				return true;
			}
		}
		
		return false;
	},
	
	/**
	 * Dispatch the event to listeners
	 * @param event		conbo.Event class instance or event type (e.g. 'change')
	 */
	dispatchEvent: function(event)
	{
		if (!event) throw new Error('Event undefined');
		
		var isString = conbo.isString(event);
		
		if (isString)
		{
			conbo.warn('Use of dispatchEvent("'+event+'") is deprecated, please use dispatchEvent(new conbo.Event("'+event+'"))');
		}
		
		if (isString || !(event instanceof conbo.Event))
		{
			event = new conbo.Event(event);
		}
		
		if (!this.__queue || (!(event.type in this.__queue) && !this.__queue.all)) return this;
		
		if (!event.target) event.target = this;
		event.currentTarget = this;
		
		var queue = conbo.union(this.__queue[event.type] || [], this.__queue.all || []);
		if (!queue || !queue.length) return this;
		
		for (var i=0, length=queue.length; i<length; ++i)
		{
			var value = queue[i];
			var returnValue = value.handler.call(value.scope || this, event);
			if (value.once) this.__removeEventListener(event.type, value.handler, value.scope);
			if (returnValue === false || event.immediatePropagationStopped) break;
		}
		
		return this;
	},
	
	/**
	 * Dispatch a change event for one or more changed properties
	 * @param propName
	 */
	dispatchChange: function()
	{
		conbo.forEach(arguments, function(propName)
		{
			__dispatchChange(this, propName);
		},
		this);
		
		return this;
	},

	toString: function()
	{
		return 'conbo.EventDispatcher';
	},

	/**
	 * @private
	 */
	__addEventListener: function(type, handler, scope, priority, once)
	{
		if (type == '*') type = 'all';
		if (!this.__queue) __definePrivateProperty(this, '__queue', {});
		
		if (!this.hasEventListener(type, handler, scope))
		{
			if (!(type in this.__queue)) this.__queue[type] = [];
			this.__queue[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
			this.__queue[type].sort(function(a,b){return b.priority-a.priority;});
		}
	},
	
	/**
	 * @private
	 */
	__removeEventListener: function(type, handler, scope)
	{
		if (type == '*') type = 'all';
		if (!this.__queue) return;
		
		var queue, 
			i, 
			self = this;
		
		var removeFromQueue = function(queue, key)
		{
			for (i=0; i<queue.length; i++)
			{
				if ((!queue[i].handler || queue[i].handler == handler)
					&& (!queue[i].scope || queue[i].scope == scope))
				{
					queue.splice(i--, 1);
				}
			}
			
			if (!queue.length)
			{
				delete self.__queue[key];
			}
		};
		
		if (type in this.__queue)
		{
			queue = this.__queue[type];
			removeFromQueue(queue, type);
		}
		else if (type == undefined)
		{
			conbo.forEach(this.__queue, function(queue, key)
			{
				removeFromQueue(queue, key);
			});
		}
	},
	
}).implement(conbo.IInjectable);

__definePrivateProperty(conbo.EventDispatcher.prototype, 'bindable');
__denumerate(conbo.EventDispatcher.prototype);
