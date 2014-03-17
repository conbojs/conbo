/*
 * jQuery plug-ins and expressions
 * @author		Neil Rackett
 */

if (!!$)
{
	$.fn.cbData = function(camelCase)
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
			cb = $el.cbData();
		
		if (!cb) return false;
		if (!!cb && !args.length) return true;
		if (!!args[0] && !args[1]) return args[0] in cb;
		if (!!args[0] && !!args[1]) return cb[args[0]] == args[1];
		return false;
	};
	
}