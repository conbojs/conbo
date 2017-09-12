/*
 * TypeScript decorators
 */

/**
 * TypeScript decorator for adding pretty much anything to a ConboJS namespace
 * @param	{string}	namespace - The name of the target namespace
 * @returns	{Function}	TypeScript decorator
 */
conbo.conbons = function(namespace) 
{
	return function(target)
	{
		var imports = {};
		imports[target.name] = target;
		
		conbo(namespace).import(imports);
		
		return target;
	}
}
