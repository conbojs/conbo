/**
 * TypeScript / ES2017 decorator to make a property bindable
 * @memberof			conbo
 * @param	{any}		target - The target object
 * @param	{string}	key - The name of the property
 */
conbo.Bindable = function(target, key)
{
	conbo.makeBindable(target, [key]);
}

/**
 * TypeScript / ES2017 decorator to prepare a property for injection
 * @memberof			conbo
 * @param	{any}		target - The target object
 * @param	{string}	key - The name of the property
 */
conbo.Inject = function(target, key)
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

/**
 * TypeScript / ES2017 decorator for adding Application, View and Glimpse classes a ConboJS namespace to enable auto instantiation
 * @memberof			conbo
 * @param	{string}	namespace - The name of the target namespace
 * @param	{string}	[name] - The name to use for this object in the target namespace (useful if you target ES5 and minify your code)
 * @returns	{Function}	Decorator function
 */
conbo.Viewable = function(namespace, name)
{
	return function(target)
	{
		var imports = {};
		imports[name || target.name] = target;
		
		conbo(namespace).import(imports);
		
		return target;
	}
};
