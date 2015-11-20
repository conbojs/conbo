/*
 * DOM and jQuery utilities
 * @author		Neil Rackett
 */

/**
 * Initialize Applications in the DOM using the specified namespace
 * 
 * By default, Conbo scans the entire DOM, but you can limit the
 * scope by specifying a root element
 */
conbo.initDom = function(namespace, rootEl)
{
	var $rootEl = $(rootEl || 'html');
	
	if (!conbo.isObject(namespace))
	{
		conbo.warn('Unable to initialize namespace:', namespace);
		return;
	}
	
	$(function()
	{
		$rootEl.find('[cb-app]').not('.cb-app').each(function(index, el)
       	{
			var $el = $(el)
       		  , appName = $el.attr('cb-app')
       		  , appClass = namespace[appName]
       		  ;
       		
       		if (appClass)
       		{
       			new appClass({el:el})
       		}
       	});
	});
};

var __observers = [];

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
 */
conbo.observeDom = function(namespace, rootEl)
{
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
};

/**
 * Stop watching the DOM for new Applications
 */
conbo.unobserveDom = function(namespace, rootEl)
{
	var i = __getObserverIndex(namespace, rootEl);
	
	if (i != -1)
	{
		var observer = __observers[i];
		
		observer[2].removeEventListener();
		__observers.slice(i,1);
	}
};

if (!!$)
{
	/**
	 * Return a list of cb-* attributes on the DOM element
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
	}
	
	/**
	 * Find elements based on their cb-attribute
	 */
	$.expr[':'].cbAttr = function(el, index, meta, stack)
	{
		var $el = $(el),
			args = (meta[3] || '').split(','),
			cb = $el.cbAttrs();
		
		if (!cb) return false;
		if (!!cb && !args.length) return true;
		if (!!args[0] && !args[1]) return args[0] in cb;
		if (!!args[0] && !!args[1]) return cb[args[0]] == args[1];
		return false;
	};
	
}