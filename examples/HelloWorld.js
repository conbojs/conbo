/**
 * Hello World example for ConboJS
 * Demonstrates how to create a new ConboJS Application
 * 
 * @author	Neil Rackett
 */
conbo('ns', conbo, function(conbo)
{
	/**
	 * Namespaces enable ConboJS binding
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
