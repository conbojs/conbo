/*
 * Functions and utility methods use for manipulating the DOM
 * @author		Neil Rackett
 */

(function()
{
	/**
	 * Initialize Applications in the DOM using the specified namespace
	 * 
	 * By default, Conbo scans the entire DOM, but you can limit the
	 * scope by specifying a root element
	 * 
	 * @memberof	conbo
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} [rootEl] - Top most element to scan
	 */
	conbo.initDom = function(namespace, rootEl)
	{
		if (!namespace)
		{
			throw new Error('initDom: namespace is undefined');
		}
		
		if (conbo.isString(namespace))
		{
			namespace = conbo(namespace);
		}
		
		rootEl || (rootEl = document.querySelector('html'));
		
		var initDom = function()
		{
			var nodes = conbo.toArray(rootEl.querySelectorAll(':not(.cb-app)'));
			
			nodes.forEach(function(el)
			{
		   		var appName = __ep(el).attributes.cbApp || conbo.toCamelCase(el.tagName, true);
		   		var appClass = namespace[appName];
		   		
		   		if (appClass && conbo.isClass(appClass, conbo.Application))
		   		{
		   			new appClass({el:el});
		   		}
		   	});
		};
		
		conbo.ready(initDom);
		
		return this;	
	};
	
	/**
	 * @private
	 */
	var __observers = [];
	
	/**
	 * @private
	 */
	var __getObserverIndex = function(namespace, rootEl)
	{
		var length = __observers.length;
		
		for (var i=0; i<length; i++)
		{
			var observer = __observers[i];
			
			if (observer[0] == namespace && observer[1] == rootEl)
			{
				return i;
			}
		}
		
		return -1;
	};
	
	/**
	 * Watch the DOM for new Applications using the specified namespace
	 * 
	 * By default, Conbo watches the entire DOM, but you can limit the
	 * scope by specifying a root element
	 * 
	 * @memberof	conbo
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} [rootEl] - Top most element to observe
	 */
	conbo.observeDom = function(namespace, rootEl)
	{
		if (conbo.isString(namespace))
		{
			namespace = conbo(namespace);
		}
		
		if (__getObserverIndex(namespace, rootEl) != -1)
		{
			return;
		}
		
		rootEl || (rootEl = document.querySelector('html'));
		
		var mo = new conbo.MutationObserver();
		mo.observe(rootEl);
		
		mo.addEventListener(conbo.ConboEvent.ADD, function(event)
		{
			event.nodes.forEach(function(node)
			{
				var ep = __ep(node);
				var appName = ep.cbAttributes.app || conbo.toCamelCase(node.tagName, true);
				
				if (appName && namespace[appName] && !ep.hasClass('cb-app'))
				{
					new namespace[appName]({el:node});
				}
			});
		});
		
		__observers.push([namespace, rootEl, mo]);
		
		return this;
	};
	
	/**
	 * Stop watching the DOM for new Applications
	 * 
	 * @memberof	conbo
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} [rootEl] - Top most element to observe
	 */
	conbo.unobserveDom = function(namespace, rootEl)
	{
		if (conbo.isString(namespace))
		{
			namespace = conbo(namespace);
		}
		
		var i = __getObserverIndex(namespace, rootEl);
		
		if (i != -1)
		{
			var observer = __observers[i];
			
			observer[2].removeEventListener();
			__observers.slice(i,1);
		}
		
		return this;
	};
	
})();