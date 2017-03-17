/**
 * Element Proxy
 * 
 * Wraps an Element to add cross browser or simplified functionality;
 * think of it as "jQuery nano"
 * 
 * @class		conbo.ElementProxy
 * @augments	conbo.EventProxy
 * @author 		Neil Rackett
 * @param 		{Element} el - Element to be proxied
 */
conbo.ElementProxy = conbo.EventProxy.extend(
/** @lends conbo.ElementProxy.prototype */
{
	/**
	 * Returns object containing the value of all attributes on a DOM element
	 * 
	 * @param 		{Element}	el - DOM Element
	 * @returns		{array}
	 * 
	 * @example
	 * ep.getAttributes(); // results in something like {src:"foo/bar.jpg"}
	 */
	getAttributes: function()
	{
		var el = this.__obj;
		var a = {};
		
		if (el)
		{
			conbo.forEach(el.attributes, function(p)
			{
				a[conbo.toCamelCase(p.name)] = p.value;
			});
		}
		
		return a;
	},
	
	/**
	 * Returns object containing the value of all cb-* attributes on a DOM element
	 * 
	 * @param 		{Element}	el - Target DOM Element
	 * @returns		{array}
	 * 
	 * @example
	 * conbo.cbAttributes();
	 */
	cbAttributes: function()
	{
		var el = this.__obj;
		var a = {};
		
		if (el)
		{
			conbo.forEach(el.attributes, function(p)
			{
				if (p.name.indexOf('cb-') === 0)
				{
					a[conbo.toCamelCase(p.name.substr(3))] = p.value;
				}
			});
		}
		
		return a;
	},
	
	/**
	 * Add the specified CSS class(es) to the element
	 *  
	 * @param 		{string}	className - One or more CSS class names, separated by spaces
	 * @returns		{conbo.ElementProxy}
	 */
	addClass: function(className)
	{
		var el = this.__obj;
		
		if (el && className)
		{
			// TODO Use classList when it's more widely supported
			var newClasses = className.trim().split(' ');
			var allClasses = el.className.trim().split(' ').concat(newClasses);
			
			el.className = conbo.uniq(conbo.compact(allClasses)).join(' ');
		}
		
		return this;
	},
	
	/**
	 * Remove the specified CSS class(es) from the element
	 * 
	 * @param 		{string|function}		className - One or more CSS class names, separated by spaces, or a function extracts the classes to be removed from the existing className property
	 * @returns		{conbo.ElementProxy}
	 */
	removeClass: function(className)
	{
		var el = this.__obj;
		
		if (el && className)
		{
			if (conbo.isFunction(className))
			{
				className = className(el.className);
			}
			
			// TODO Use classList when it's more widely supported
			
			var allClasses = el.className.trim().split(' ');
			var classesToRemove = className.trim().split(' ');
			
			allClasses = conbo.difference(allClasses, classesToRemove);
			
			el.className = conbo.uniq(conbo.compact(allClasses)).join(' ');
		}
		
		return this;
	},
	
	/**
	 * Is this element using the specified CSS class?
	 *  
	 * @param 		{string}	className - CSS class name
	 * @returns		{boolean}
	 */
	hasClass: function(className)
	{
		var el = this.__obj;
		
		if (el && className)
		{
			// TODO Use classList when it's more widely supported
			var allClasses = el.className.trim().split(' ');
			return allClasses.indexOf(className) != -1;
		}
		
		return false;
	},
	
	/**
	 * Finds the closest parent element matching the specified selector
	 *  
	 * @param 		{string}	selector - Query selector
	 * @returns		{Element}
	 */
	closest: function(selector)
	{
		var el = this.__obj;
		
		if (el)
		{
			var matchesFn;
			
			['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) 
			{
				if (typeof document.body[fn] == 'function') 
				{
					matchesFn = fn;
					return true;
				}
				
				return false;
			});
			
			var parent;
			
			// traverse parents
			while (el) 
			{
				parent = el.parentElement;
				
				if (parent && parent[matchesFn](selector)) 
				{
					return parent;
				}
				
				el = parent;
			}
		}
	},
	
});
