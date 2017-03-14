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
	 * @param		{Element} rootEl - Top most element to scan (optional)
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
		   		var appName = conbo.getAttributes(el).cbApp || conbo.toCamelCase(el.tagName, true);
		   		var appClass = namespace[appName];
		   		
		   		if (appClass && conbo.isClass(appClass, conbo.Application))
		   		{
		   			new appClass({el:el});
		   		}
		   	});
		};
		
		if (__domContentLoaded)
		{
			initDom();
		}
		else
		{
			document.addEventListener('DOMContentLoaded', initDom);
		}
		
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
	 * @param		{Element} rootEl - Top most element to observe (optional)
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
				var appName = conbo.cbAttributes(node).app;
				
				if (namespace[appName] && !conbo.hasClass(node, 'cb-app'))
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
	 * @param		{Element} rootEl - Top most element to observe (optional)
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
	
	// Temporary jQuery replacement or proxy methods to facilitate a jQuery free world...
	
	/**
	 * Returns object containing the value of all attributes on a DOM element
	 * 
	 * @memberof	conbo
	 * @param 		{Element}	el - DOM Element
	 * 
	 * @example
	 * conbo.getAttributes(el); // results in something like {src:"foo/bar.jpg"}
	 */
	conbo.getAttributes = function(el)
	{
		var a = {};
		
		conbo.forEach(el.attributes, function(p)
		{
			a[conbo.toCamelCase(p.name)] = p.value;
		});
		
		return a;
	};
	
	/**
	 * Returns object containing the value of all cb-* attributes on a DOM element
	 * 
	 * @memberof	conbo
	 * @param 		{Element}	el - Target DOM Element
	 * 
	 * @example
	 * conbo.cbAttributes(el);
	 */
	conbo.cbAttributes = function(el)
	{
		var a = {};
		
		conbo.forEach(el.attributes, function(p)
		{
			if (p.name.indexOf('cb-') === 0)
			{
				a[conbo.toCamelCase(p.name.substr(3))] = p.value;
			}
		});
		
		return a;
	};
	
	/**
	 * Temporary method to add CSS classes to elements while we wait for classList 
	 * to become more widely supported
	 *  
	 * @memberof	conbo
	 * @param 		{Element}	el - Target DOM Element
	 * @param 		{string}	className - One or more CSS class names, separated by spaces
	 */
	conbo.addClass = function(el, className)
	{
		var newClasses = className.trim().split(' ');
		var allClasses = el.className.trim().split(' ').concat(newClasses);
		
		el.className = conbo.uniq(conbo.compact(allClasses)).join(' ');
	};
	
	/**
	 * Temporary method to remove CSS classes from elements while we wait for 
	 * classList to become more widely supported
	 * 
	 * @memberof	conbo
	 * @param 		{Element}	el - Target DOM Element
	 * @param 		{string}	className - One or more CSS class names, separated by spaces
	 */
	conbo.removeClass = function(el, className)
	{
		var newClasses = className.trim().split(' ');
		var allClasses = conbo.difference(el.className.trim().split(' '), newClasses);
		
		el.className = conbo.uniq(conbo.compact(allClasses)).join(' ');
	};
	
	/**
	 * Temporary method to test for a CSS class on an element while we wait for classList 
	 * to become more widely supported
	 *  
	 * @memberof	conbo
	 * @param 		{Element}	el - Target DOM Element
	 * @param 		{string}	className - CSS class name
	 */
	conbo.hasClass = function(el, className)
	{
		var allClasses = el.className.trim().split(' ');
		return allClasses.indexOf(className) != -1;
	};
	
})();