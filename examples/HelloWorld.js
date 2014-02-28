/**
 * Hello World example for Conbo.js
 * Demonstrates a simple, non-templated application
 * 
 * @author	Neil Rackett
 */
(function()
{
	var MyApp = conbo.Application.extend
	({
		template: 'Hello World!'
	});
	
	/**
	 * Passing el to the constructor will automatically add your
	 * application to that element
	 */
	new MyApp({el:document.body});
	
})();