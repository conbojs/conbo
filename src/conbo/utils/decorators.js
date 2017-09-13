/*
 * TypeScript decorators
 */

/**
 * TypeScript decorator for adding pretty much anything to a ConboJS namespace
 * @param	{string}	namespace - The name of the target namespace
 * @param	{string}	[name] - The name to use for this object in the target namespace (useful if you target ES5 and minify your code)
 * @returns	{Function}	TypeScript decorator
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
}
