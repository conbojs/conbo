/**
 * Example of how to use bind CSS classes using cb-* 
 * attributes with ConboJS
 * 
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns
		
		// You don't need to declare properties in your Application
		// or View to bind them, but we definitely recommend it!
	});
	
});