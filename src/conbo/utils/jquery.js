/*
 * jQuery plug-ins and expressions
 * @author		Neil Rackett
 */

$.fn.cbData = function()
{
	var data = {},
		attrs = this.get()[0].attributes,
		count = 0;
	
	for (var i=0; i<attrs.length; ++i)
	{
		if (attrs[i].name.indexOf('cb-') != 0) continue;
		var propertyName = attrs[i].name.substr(3).replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
		data[propertyName] = attrs[i].value;
		++count;
	}
	
	return !!count ? data : undefined;
}

$.expr[':'].cbAttr = function(el, index, meta, stack)
{
	var $el = $(el),
		args = meta[3].split(','),
		cb = $el.cbData();
	
	if (!cb) return false;
	if (!!cb && !args.length) return true;
	if (!!args[0] && !args[1]) return cb.hasOwnProperty(args[0]);
	if (!!args[0] && !!args[1]) return cb[args[0]] == args[1];
	return false;
};
