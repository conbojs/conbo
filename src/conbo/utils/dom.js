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
conbo.init = function(namespace, rootEl)
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
}

if (!!$)
{
	/**
	 * Return a list of cb-* attributes on the DOM element
	 */
	$.fn.cbAttrs = function(camelCase)
	{
		var data = {},
			attrs = this.get()[0].attributes,
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
			
			++count;
		}
		
		return !!count ? data : undefined;
	}
	
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