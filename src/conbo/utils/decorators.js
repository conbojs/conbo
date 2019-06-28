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
 * @param	{string}	[namespace] - The name of the target namespace
 * @param	{string}	[name] - The name to use for this object in the target namespace (required if you use or compile to ES5 and minify your code)
 * @returns	{Function}	Decorator function
 */
conbo.Viewable = function(namespace, name)
{
	switch (arguments.length)
	{
		case 1:
			name = namespace;

			if (name.indexOf('.') !== -1)
			{
				conbo.warn('@Viewable("my.custom.namespace") syntax is no longer valid, please use @Viewable("my.custom.namespace", "MyClassName")');
			}

		case 0:
			namespace = 'default';
			break;
	}

	return function(constructor)
	{
		var imports = {};
		
		name || (name = constructor.name);

		Object.defineProperty(constructor.prototype, '__className', 
		{
			configurable: true,
			enumerable: false,
			writable: true,
			value: conbo.toKebabCase(name)
		});
	
		imports[name] = constructor;
		
		conbo(namespace).import(imports);
		
		return constructor;
	}
};
