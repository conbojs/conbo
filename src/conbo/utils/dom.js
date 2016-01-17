/*
 * DOM functions and utility methods that require jQuery
 * @author		Neil Rackett
 */

/**
 * Initialize Applications in the DOM using the specified namespace
 * 
 * By default, Conbo scans the entire DOM, but you can limit the
 * scope by specifying a root element
 * 
 * @memberof	conbo
 */
conbo.initDom = function(namespace, rootEl)
{
	if (!namespace)
	{
		throw new Error('initDom: namespace is undefined');
		return this;
	}
	
	if (conbo.isString(namespace))
	{
		namespace = conbo(namespace);
	}
	
	var $rootEl = $(rootEl || 'html');
	
	$(function()
	{
		$rootEl.find('*').not('.cb-app').each(function(index, el)
	   	{
			var $el = $(el)
	   		  , appName = $el.attr('cb-app') || conbo.toCamelCase(el.tagName, true)
	   		  , appClass = namespace[appName]
	   		  ;
	   		
	   		if (appClass 
	   			&& conbo.isClass(appClass, conbo.Application))
	   		{
	   			new appClass({el:el})
	   		}
	   	});
	});
	
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
	
	var mo;
	var $rootEl = $(rootEl || 'html');
	
	mo = new conbo.MutationObserver();
	mo.observe($rootEl[0]);
	
	mo.addEventListener(conbo.ConboEvent.ADD, function(event)
	{
		event.nodes.forEach(function(node)
		{
			var $node = $(node);
			var appName = $node.cbAttrs().app;
			
			if (namespace[appName] && !$node.hasClass('cb-app'))
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

if (!!$)
{
	/**
	 * Get or set the value of all attributes on a DOM element
	 * 
	 * @memberof	conbo.$
	 * @param 		{object}	attrs - Attributes to set (optional)
	 * 
	 * @example
	 * $el.attrs(); // Returns all attributes as an Object
	 * $el.attrs({foo:"bar", fast:"car"}); // Sets foo and bar attributes
	 */
	$.fn.attrs = function(attrs) 
	{
		var $el = $(this);
		
		// Set
		if (arguments.length) 
		{
			$el.each(function(i, el) 
			{
				var $j = $(el);
				
				for (var attr in attrs) 
				{
					$j.attr(attr, attrs[attr]);
				};
			});
			
			return $el;
		} 
		// Get
		else 
		{
			var a = {};
			
			conbo.forEach($el[0].attributes, function(p)
			{
				a[conbo.toCamelCase(p.nodeName)] = p.nodeValue;
			});
			
			return a;
		}
	};
	
	/**
	 * Return object containing the value of all cb-* attributes on a DOM element
	 * 
	 * @memberof	conbo.$
	 * @param 		{boolean}	camelCase - Should the property names be converted to camelCase? (default: true)
	 * 
	 * @example
	 * $el.cbAttrs();
	 */
	$.fn.cbAttrs = function(camelCase)
	{
		var data = {},
			attrs = conbo.toArray(this.get()[0].attributes),
			count = 0,
			propertyName;
		
		for (var i=0; i<attrs.length; ++i)
		{
			if (attrs[i].name.indexOf('cb-') != 0) continue;
			
			propertyName = attrs[i].name.substr(3);
			
			if (camelCase !== false)
			{
				propertyName = conbo.toCamelCase(propertyName);
			}
			
			data[propertyName] = attrs[i].value;
		}
		
		return data;
	};
	
	/**
	 * jQuery method to select child elements related to View or Glimpse 
	 * class instances
	 * 
	 * @memberof	conbo.$
	 * @param 		{class}		viewClass - View or Glimpse class to search for
	 * 
	 * @example
	 * $el.cbViews(myNamespace.MyViewClass);
	 */
	$.fn.cbViews = function(viewClass)
	{
		return this.find('.cb-view, .cb-glimpse').filter(function()
		{
			return conbo.instanceOf(this.cbView || this.cbGlimpse, viewClass);
		});
	};
	
	/**
	 * Find elements based on their cb-attribute
	 * @memberof	conbo.$
	 * 
	 * @example
	 * $(':cbAttr');
	 * $('div:cbAttr');
	 */
	$.expr[':'].cbAttr = function(el, index, meta, stack)
	{
		var $el = $(el),
			args = (meta[3] || '').split(','),
			attrs = $el.cbAttrs(),
			keys = conbo.keys(attrs)
			;
		
		if (!keys.length) return false;
		if (!!attrs && !args.length) return true;
		if (!!args[0] && !args[1]) return args[0] in attrs;
		if (!!args[0] && !!args[1]) return attrs[args[0]] == args[1];
		return false;
	};
	
}