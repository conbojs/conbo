/**
 * Hello World example for Conbo.js
 * Demonstrates how to create a new Conbo.js Application
 * 
 * @author	Neil Rackett
 */
conbo('ns', conbo, function(conbo)
{
	/**
	 * Namespaces enable Conbo.js binding
	 */
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		template: 'Hello World!'
	});
	
	/**
	 * Passing el to the constructor will automatically add your application
	 * to that element. 
	 */
	new ns.MyApp({el:document.body});
	
});
