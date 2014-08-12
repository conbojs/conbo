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
 * @see		conbo.EventDispatcher
 */
conbo.EventDispatcher = (conbo.Injectable || conbo.Class).extend
({
	/**
	 * Do not override: use initialize
	 * @private
	 */
	constructor: function(options)
	{
		conbo.propertize(this);
		this.initialize.apply(this, arguments);
		conbo.bindProperties(this, this.bindable);
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
		if (conbo.isArray(type)) conbo.each(type, function(value, index, list) { this._addEventListener(value, handler, scope, priority, !!once); }, this);
		else conbo.each(type, function(value, key, list) { this._addEventListener(key, value, scope, priority, !!once); }, this); 
		
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
			this.__queue__ = {};
			return this;
		}
		
		if (!type) throw new Error('Event type undefined');
		if (arguments.length == 2 && !handler) return this;
		
		var a = arguments;
		
		if (conbo.isString(type)) type = type.split(' ');
		if (conbo.isArray(type)) conbo.each(type, function(value, index, list) { this._removeEventListener.apply(this, a); }, this);
		else conbo.each(type, function(value, key, list) { this._removeEventListener.apply(this, a); }, this);
		
		return this;
	},
	
	/**
	 * Dispatch the event to listeners
	 * @param event		conbo.Event class instance or event type (e.g. 'change')
	 */
	dispatchEvent: function(event)
	{
		if (!event) throw new Error('Event undefined');
		
		if (conbo.isString(event) || !(event instanceof conbo.Event)) 
			event = new conbo.Event(event);
		
		if (!this.__queue__ || (!(event.type in this.__queue__) && !this.__queue__.all)) return this;
		
		if (!event.target) event.target = this;
		event.currentTarget = this;
		
		var queue = conbo.union(this.__queue__[event.type] || [], this.__queue__.all || []);
		if (!queue || !queue.length) return this;
		
		for (var i=0, length=queue.length; i<length; ++i)
		{
			var value = queue[i];
			var returnValue = value.handler.call(value.scope || this, event);
			if (value.once) this._removeEventListener(event.type, value.handler, value.scope);
			if (returnValue === false || event.immediatePropagationStopped) break;
		}
		
		return this;
	},
	
	/**
	 * @private
	 */
	_addEventListener: function(type, handler, scope, priority, once)
	{
		if (type == '*') type = 'all';
		if (!this.__queue__) _defineIncalculableProperty(this, '__queue__', {});
		this._removeEventListener(type, handler, scope);
		
		if (!(type in this.__queue__)) this.__queue__[type] = [];
		this.__queue__[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
		this.__queue__[type].sort(function(a,b){return b.priority-a.priority});
	},
	
	/**
	 * @private
	 */
	_removeEventListener: function(type, handler, scope)
	{
		if (!this.__queue__ || !(type in this.__queue__)) return this;
		
		var queue = this.__queue__[type];
		
		if (arguments.length == 1)
		{
			delete this.__queue__[type];
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
	
	/**
	 * Get the value of a property
	 * @param	attribute
	 * @example	instance.get('n');
	 * @returns
	 */
	get: function(propName)
	{
		return this[propName];
	},
	
	/**
	 * Set the value of one or more property and dispatch a change:[propertyName] event
	 * 
	 * Event handlers, in line with conbo.Model change:[propertyName] handlers, 
	 * should be in the format handler(source, value) {...}
	 * 
	 * @param 	attribute
	 * @param 	value
	 * @param 	options
	 * @example	instance.set('n', 123);
	 * @example	instance.set({n:123, s:'abc'});
	 * @returns	this
	 */
	set: function(propName, value)
	{
		if (conbo.isObject(propName))
		{
			conbo.each(propName, function(value, key) { this.set(key, value); }, this);
			return this;
		}
		
		if (this[propName] === value)
		{
			return this;
		}
		
		this[propName] = value;
		
		// We're assuming defined values will dispatch their own change events
		if (!conbo.isBindableProperty(this, propName))
		{
			_dispatchChange(this, propName);
		}
		
		return this;
	},
	
//	/**
//	 * Delete a property and dispatch a change:[propertyName] event
//	 * @param 	value
//	 * @returns	this
//	 */
//	unset: function(attribute)
//	{
//		delete this[attribute];
//		this.dispatchChangeEvent(attribute)
//		return this;
//	},
	
	toString: function()
	{
		return 'conbo.EventDispatcher';
	}	
	
});

//(function()
//{
//	var value;
//	
//	Object.defineProperty
//	(
//		conbo.Injectable.prototype,
//		'bindable',
//		
//		{
//			configurable: true,
//			enumerable: false,
//			
//			get: function()
//			{
//				return value;
//			},
//			
//			set: function(newValue)
//			{
//				if (!newValue || newValue == value) return;
//				
//				value = newValue;
//				conbo.bindable.apply(conbo, [this].concat(newValue));
//			}
//		}
//	);
//	
//})();

_defineIncalculableProperty(conbo.EventDispatcher.prototype, 'bindable');
_denumerate(conbo.EventDispatcher.prototype);
