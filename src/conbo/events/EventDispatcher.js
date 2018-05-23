(function()
{
	/**
	 * @private
	 */
	var EventDispatcher__addEventListener = function(type, handler, scope, priority, once)
	{
		if (type == '*') type = 'all';
		if (!this.__queue) __definePrivateProperty(this, '__queue', {});
		
		if (!this.hasEventListener(type, handler, scope))
		{
			if (!(type in this.__queue)) this.__queue[type] = [];
			this.__queue[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
			this.__queue[type].sort(function(a,b){return b.priority-a.priority;});
		}
	};
	
	/**
	 * @private
	 */
	var EventDispatcher__removeEventListener = function(type, handler, scope)
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
	};
	
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
	 * @class		EventDispatcher
	 * @memberof	conbo
	 * @augments	conbo.Class
	 * @augments	conbo.IInjectable
	 * @author		Neil Rackett
	 * @param 		{Object} options - Object containing optional initialisation options, including 'context'
	 */
	conbo.EventDispatcher = conbo.ConboClass.extend(
	/** @lends conbo.EventDispatcher.prototype */
	{
		/**
		 * Add a listener for a particular event type
		 * 
		 * @param 	{string}		type - Type of event ('change') or events ('change blur')
		 * @param 	{Function}		handler - Function that should be called
		 * @param 	{Object}		[scope] - The scope in which to run the event handler
		 * @param 	{number}		[priority=0] - The event handler's priority when the event is dispatached
		 * @param 	{boolean}		[once=false] - Should the event listener automatically be removed after it has been called once?
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
		 */
		addEventListener: function(type, handler, scope, priority, once)
		{
			if (!type) throw new Error('Event type undefined');
			if (!handler || !conbo.isFunction(handler)) throw new Error('Event handler is undefined or not a function');
	
			if (conbo.isString(type)) type = type.split(' ');
			if (conbo.isArray(type)) conbo.forEach(type, function(value, index, list)
			{
				EventDispatcher__addEventListener.call(this, value, handler, scope, priority, !!once); 
			},
			this);
			
			return this;
		},
		
		/**
		 * Remove a listener for a particular event type
		 * 
		 * @param {string}		[type] - Type of event ('change') or events ('change blur'), if not specified, all listeners will be removed 
		 * @param {Function}	[handler] - Function that should be called, if not specified, all listeners of the specified type will be removed
		 * @param {Object} 		[scope] - The scope in which the handler is set to run
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
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
				EventDispatcher__removeEventListener.call(this, value, handler, scope); 
			}, 
			this);
			
			return this;
		},
		
		/**
		 * Does this object have an event listener of the specified type?
		 * 
		 * @param 	{string}	type - Type of event (e.g. 'change') 
		 * @param 	{Function}	[handler] - Function that should be called
		 * @param 	{Object} 	[scope] - The scope in which the handler is set to run
		 * @returns	{boolean}	True if this object has the specified event listener, false if it does not
		 */
		hasEventListener: function(type, handler, scope)
		{
			if (!this.__queue || !(type in this.__queue) || !this.__queue[type].length)
			{
				return false;
			}
			
			var filtered = this.__queue[type].filter(function(queued)
			{
				return (!handler || queued.handler == handler) && (!scope || queued.scope == scope);
			});

			return !!filtered.length;
		},
		
		/**
		 * Dispatch the event to listeners
		 * @param {conbo.Event} 	event - The event to dispatch
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
		 */
		dispatchEvent: function(event)
		{
			if (!(event instanceof conbo.Event))
			{
				throw new Error('event parameter is not an instance of conbo.Event');
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
				if (value.once) EventDispatcher__removeEventListener.call(this, event.type, value.handler, value.scope);
				if (returnValue === false || event.immediatePropagationStopped) break;
			}
			
			return this;
		},
		
		/**
		 * Dispatch a change event for one or more changed properties
		 * @param {string}	propName - The name of the property that has changed
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
		 */
		dispatchChange: function(propName)
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
		
	}).implement(conbo.IInjectable);
	
	//__definePrivateProperty(conbo.EventDispatcher.prototype, 'bindable');
	__denumerate(conbo.EventDispatcher.prototype);
	
})();
