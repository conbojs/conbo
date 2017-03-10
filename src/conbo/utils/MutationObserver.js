/**
 * Mutation Observer
 * 
 * Simplified mutation observer dispatches ADD and REMOVE events following 
 * changes in the DOM, compatible with IE9+ and all modern browsers
 * 
 * @class		conbo.MutationObserver
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#REMOVE
 */
conbo.MutationObserver = conbo.EventDispatcher.extend(
/** @lends conbo.MutationObserver.prototype */
{
	initialize: function()
	{
		this.bindAll();
	},
	
	observe: function(el)
	{
		this.disconnect();
		
		if (!el) return;
		
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		
		// Modern browsers
		if (MutationObserver)
		{
			var mo = new MutationObserver(this.bind(function(mutations, observer)
			{
				var added = mutations[0].addedNodes;
				var removed = mutations[0].removedNodes;
				
				if (added.length)
				{
					this.__addHandler(conbo.toArray(added));
				}
			
				if (mutations[0].removedNodes.length)
				{
					this.__removeHandler(conbo.toArray(removed));
				}
			}));
			
			mo.observe(el, {childList:true, subtree:true});
			
			this.__mo = mo;
		}
		// IE9
		else
		{
			el.addEventListener('DOMNodeInserted', this.__addHandler);
			el.addEventListener('DOMNodeRemoved', this.__removeHandler);
			
			this.__el = el;
		}
		
		return this;
	},
	
	disconnect: function()
	{
		var mo = this.__mo;
		var el = this.__el;
		
		if (mo) 
		{
			mo.disconnect();
		}
		
		if (el) 
		{
			el.removeEventListener('DOMNodeInserted', __addHandler);
			el.removeEventListener('DOMNodeRemoved', __removeHandler);
		}
		
		return this;
	},
	
	__addHandler: function(event)
	{
		var nodes = conbo.isArray(event)
			? event
			: [event.target];
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD, {nodes:nodes}));
	},
	
	__removeHandler: function(event)
	{
		var nodes = conbo.isArray(event)
			? event
			: [event.target];
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE, {nodes:nodes}));
	}
});
