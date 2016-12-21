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
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 */
	addEventListener: function(type, handler, scope, priority, once)
	{
		if (!type) throw new Error('Event type undefined');
		if (!handler || !conbo.isFunction(handler)) throw new Error('Event handler is undefined or not a function');

		if (conbo.isString(type)) type = type.split(' ');
		if (conbo.isArray(type)) conbo.forEach(type, function(value, index, list) { this.__addEventListener(value, handler, scope, priority, !!once); }, this);
		else conbo.forEach(type, function(value, key, list) { this.__addEventListener(key, value, scope, priority, !!once); }, this); 
		
		return this;
	},
	
	/**
	 * Remove a listener for a particular event type
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 * @param scope	The scope
	 */
	removeEventListener: function(type, handler, scope)
	{
		if (!arguments.length)
		{
			__defineUnenumerableProperty(this, '__queue', {});
			return this;
		}
		
		if (!type) throw new Error('Event type undefined');
		if (arguments.length == 2 && !handler) return this;
		
		var a = arguments;
		
		if (conbo.isString(type)) type = type.split(' ');
		if (conbo.isArray(type)) conbo.forEach(type, function(value, index, list) { this.__removeEventListener.apply(this, a); }, this);
		else conbo.forEach(type, function(value, key, list) { this.__removeEventListener.apply(this, a); }, this);
		
		return this;
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
		if (!this.__queue) __defineUnenumerableProperty(this, '__queue', {});
		this.__removeEventListener(type, handler, scope);
		
		if (!(type in this.__queue)) this.__queue[type] = [];
		this.__queue[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
		this.__queue[type].sort(function(a,b){return b.priority-a.priority;});
	},
	
	/**
	 * @private
	 */
	__removeEventListener: function(type, handler, scope)
	{
		if (!this.__queue || !(type in this.__queue)) return this;
		
		var queue = this.__queue[type];
		
		if (arguments.length == 1)
		{
			delete this.__queue[type];
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
	},
	
}).implement(conbo.IInjectable);

__defineUnenumerableProperty(conbo.EventDispatcher.prototype, 'bindable');
__denumerate(conbo.EventDispatcher.prototype);
