var __namespaces = {};

var conbo = function(namespace)
{
	if (!namespace || !conbo.isString(namespace))
	{
		conbo.warn('First parameter must be the namespace string, received', namespace);
		return;
	}

	if (!__namespaces[namespace])
	{
		__namespaces[namespace] = new conbo.Namespace();
	}
	
	var ns = __namespaces[namespace],
		params = conbo.rest(arguments),
		func = params.pop()
		;
	
	if (conbo.isFunction(func))
	{
		func.apply(ns, params);
	}
	
	return ns;
};

conbo.VERSION = '2.2.0';
	
conbo.toString = function() 
{ 
	return 'Conbo '+this.VERSION; 
};

if (!!$)
{
	conbo.$ = $;
}
