/**
 * Event Proxy
 * 
 * Standardises the adding and removing of event listeners across DOM elements,
 * Conbo EventDispatchers and jQuery instances 
 * 
 * @class		conbo.EventProxy
 * @augments	conbo.Class
 * @author 		Neil Rackett
 * @param 		{object} eventDispatcher - Element, EventDispatcher or jQuery object to be proxied
 */
conbo.EventProxy = conbo.Class.extend(
/** @lends conbo.EventProxy.prototype */
{
	constructor: function(obj)
	{
		this.__obj = obj;
	},
	
	/**
	 * Add a listener for a particular event type
	 * 
	 * @param 	{string}			type - Type of event ('change') or events ('change blur')
	 * @param 	{function}			handler - Function that should be called
	 * @returns	{conbo.EventProxy}	A reference to this class instance 
	 */
	addEventListener: function(type, handler)
	{
		var obj = this.__obj;
		
		if (obj)
		{
			switch (true)
			{
				// TODO Remove the last tiny piece of jQuery support?
				case conbo.$ && obj instanceof conbo.$:
				case window.$ && obj instanceof window.$:
				{
					obj.on(type, handler);
					break;
				}
				
				case obj instanceof conbo.EventDispatcher:
				{
					obj.addEventListener(type, handler);
					break;
				}
				
				default:
				{
					var types = type.split(' ');
					
					types.forEach(function(type)
					{
						obj.addEventListener(type, handler);
					});
				}
			}
		}
		
		return this;
	},
	
	/**
	 * Remove a listener for a particular event type
	 * 
	 * @param 	{string}			type - Type of event ('change') or events ('change blur')
	 * @param 	{function}			handler - Function that should be called
	 * @returns	{conbo.EventProxy}	A reference to this class instance 
	 */
	removeEventListener: function(type, handler)
	{
		var obj = this.__obj;
		
		if (obj)
		{
			switch (true)
			{
				// TODO Remove the last tiny piece of jQuery support?
				case conbo.$ && obj instanceof conbo.$:
				case window.$ && obj instanceof window.$:
				{
					obj.off(type, handler);
					break;
				}
				
				case obj instanceof conbo.obj:
				{
					obj.removeEventListener(type, handler);
					break;
				}
				
				default:
				{
					var types = type.split(' ');
					
					types.forEach(function(type)
					{
						obj.removeEventListener(type, handler);
					});
				}
			}
		}
		
		return this;
	},
	
});
