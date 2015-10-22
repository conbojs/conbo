/**
 * Mutation Observer
 * 
 * Simplified mutation observer dispatches ADD and REMOVE events following 
 * changes in the DOM, compatible with IE9+ and all modern browsers
 */
conbo.MutationObserver = conbo.EventDispatcher.extend
({
	initialize: function()
	{
		this.bindAll();
	},
	
	observe: function(el)
	{
		this.disconnect();
		
		if (!el) return;
		
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		
		if (MutationObserver)
		{
			var mo = new MutationObserver(this.bind(function(mutations, observer)
			{
				if (mutations[0].addedNodes.length)
				{
					this.__addHandler();
				}
			
				if (mutations[0].removedNodes.length)
				{
					this.__removeHandler();
				}
			}));
			
			mo.observe(el, {childList:true, subtree:true});
			
			this.__mo = mo;
		}
		else
		{
			el.addEventListener('DOMNodeInserted', __addHandler, false);
			el.addEventListener('DOMNodeRemoved', __removeHandler, false);
			
			this.__el = el;
		}
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
	},
	
	__addHandler: function()
	{
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
	},
	
	__removeHandler: function()
	{
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
	}
});
