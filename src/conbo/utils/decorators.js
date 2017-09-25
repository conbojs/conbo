/*
 * TypeScript / ES2015 decorators
 */

/**
 * TypeScript / ES2015 decorator for adding pretty much anything to a ConboJS namespace
 * @param	{string}	namespace - The name of the target namespace
 * @param	{string}	[name] - The name to use for this object in the target namespace (useful if you target ES5 and minify your code)
 * @returns	{Function}	Decorator function
 */
conbo.conbons = function(namespace, name) 
{
	return function(target)
	{
		var imports = {};
		imports[name || target.name] = target;
		
		conbo(namespace).import(imports);
		
		return target;
	}
};

/**
 * TypeScript / ES2015 decorator for making properties bindable
 * @param	{*}			value - The current value of the property
 * @returns	{Function}	Property decorator function
 */
conbo.bindable = function(value)
{
	return function (target, key, descriptor) 
	{
        conbo.makeBindable(target, [key]);
    };
};
