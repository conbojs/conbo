/**
 * Custom attribute example for Conbo.js
 * Demonstrates how to create a custom attribute
 * 
 * @author	Neil Rackett
 */
conbo('ns', conbo, function(conbo)
{
	var ns = this;
	
	/**
	 * Custom view that will be applied to elements with the tag name <my-view />
	 */
	ns.MyView = conbo.View.extend
	({
		template: '<h1>This is inside a custom tag!</h1>',
	});
	
	/**
	 * Application with a bindable value
	 */
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns
	});
	
});
