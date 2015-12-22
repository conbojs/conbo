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
	 * By default, namespaces will automatically scan the DOM when the page
	 * finished loading and instantiate any matching applications it finds.
	 * 
	 * However, if you want to manually instantiate your Application, passing 
	 * el to the constructor will add your application to that element.
	 */
	new ns.MyApp({el:document.body});
	
});
