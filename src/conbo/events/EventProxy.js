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
	constructor: function(eventDispatcher)
	{
		this.__eventDispatcher = eventDispatcher;
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
		var eventDispatcher = this.__eventDispatcher;
		
		switch (true)
		{
			case $ && eventDispatcher instanceof $:
			{
				eventDispatcher.on(type, handler);
				break;
			}
			
			case eventDispatcher instanceof conbo.EventDispatcher:
			{
				eventDispatcher.addEventListener(type, handler);
				break;
			}
			
			default:
			{
				var types = type.split(' ');
				
				types.forEach(function(type)
				{
					eventDispatcher.addEventListener(type, handler);
				});
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
		var eventDispatcher = this.__eventDispatcher;
		
		switch (true)
		{
			case $ && eventDispatcher instanceof $:
			{
				eventDispatcher.off(type, handler);
				break;
			}
			
			case eventDispatcher instanceof conbo.EventDispatcher:
			{
				eventDispatcher.removeEventListener(type, handler);
				break;
			}
			
			default:
			{
				var types = type.split(' ');
				
				types.forEach(function(type)
				{
					eventDispatcher.removeEventListener(type, handler);
				});
			}
		}
		
		return this;
	},
	
});
