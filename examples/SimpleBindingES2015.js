/**
 * Simple data binding example for ConboJS using ES2015 syntax
 * 
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	class MyApp extends conbo.Application
	{
		get namespace()
		{
			return ns;
		}
		
		get template()
		{
			return '<p>My name is <input type="text" cb-bind="name" /></p>'+
				'<h1>Hello <span cb-bind="name" />!</h1>',
		}
			
		initialize()
		{
			this.name = "Conbo";
		}
	}
	
	/*
	 * All properties of the return Object are added to the current namespace,
	 * but you can declare classes in the format `ns.MyClass = class extends SuperClass { ... }`
	 * if you prefer
	 */
	return {
		MyApp: MyApp
	}
	
});