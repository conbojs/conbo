/**
 * Hello World example for Conbo.js
 * Demonstrates how to create a new Conbo.js Application
 * 
 * @author	Neil Rackett
 */
(function()
{
	/**
	 * Namespaces enable Conbo.js binding
	 */
	var ns = {};
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		template: 'Hello World!'
	});
	
	/**
	 * Passing el to the constructor will automatically add your
	 * application to that element
	 */
	new ns.MyApp({el:document.body});
	
})();