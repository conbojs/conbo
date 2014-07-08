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
conbo.EventDispatcher = (conbo.Injectable || conbo.Class).extend
({
	/**
	 * Add a listener for a particular event type
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 */
	addEventListener: function(type, handler, scope, priority, once)
	{
		if (!type) throw new Error('Event type undefined');
		if (!handler || !_.isFunction(handler)) throw new Error('Event handler is undefined or not a function');

		if (_.isString(type)) type = type.split(' ');
		if (_.isArray(type)) _.each(type, function(value, index, list) { this._addEventListener(value, handler, scope, priority, !!once); }, this);
		else _.each(type, function(value, key, list) { this._addEventListener(key, value, scope, priority, !!once); }, this); 
		
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
			this._queue = {};
			return this;
		}
		
		if (!type) throw new Error('Event type undefined');
		if (arguments.length == 2 && !handler) return this;
		
		var a = arguments;
		
		if (_.isString(type)) type = type.split(' ');
		if (_.isArray(type)) _.each(type, function(value, index, list) { this._removeEventListener.apply(this, a); }, this);
		else _.each(type, function(value, key, list) { this._removeEventListener.apply(this, a); }, this);
		
		return this;
	},
	
	/**
	 * Dispatch the event to listeners
	 * @param event		conbo.Event class instance or event type (e.g. 'change')
	 */
	dispatchEvent: function(event)
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
			if (value.once) this._removeEventListener(event.type, value.handler, value.scope);
			if (returnValue === false || event.immediatePropagationStopped) break;
		}
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.EventDispatcher';
	},
	
	/**
	 * @private
	 */
	_addEventListener: function(type, handler, scope, priority, once)
	{
		if (type == '*') type = 'all';
		if (!this._queue) this._queue = {};
		this._removeEventListener(type, handler, scope);
		
		if (!(type in this._queue)) this._queue[type] = [];
		this._queue[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
		this._queue[type].sort(function(a,b){return b.priority-a.priority});
	},
	
	/**
	 * @private
	 */
	_removeEventListener: function(type, handler, scope)
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
