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
 * TypeScript / ES2015 decorator to make a property bindable
 * @param	{any}		target - The target object
 * @param	{string}	key - The name of the property
 */
conbo.bindable = function(target, key)
{
	conbo.makeBindable(target, [key]);
}

/**
 * TypeScript / ES2015 decorator to prepare a property for injection
 * @param	{any}		target - The target object
 * @param	{string}	key - The name of the property
 */
conbo.injectable = function(target, key)
{
	if (delete target[key])
	{
		Object.defineProperty(target, key, 
		{
			configurable: true,
			enumerable: true,
			writable: true
		});
	}
}
