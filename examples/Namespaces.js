/**
 * Namespace example for Conbo.js
 * 
 * As well as being able to automatically apply Application and View classes
 * to existing DOM elements using a namespace, Conbo offers a modular method 
 * of creating namespaces that is optimized for minification.
 * 
 * @example	conbo('mynamespace', [globalVar, ...,] function(minifiableVar) { var ns = this; ... }
 * 
 * @author	Neil Rackett
 */

conbo('utils', function()
{
	var ns = this;
	
	ns.getHello = function(name)
	{
		return 'Hello '+name+'!';
	};
});

conbo('ns', conbo, function(conbo)
{
	var ns = this;
	var utils = conbo('utils');
	
	/**
	 * By requiring your app to have a namespace, Conbo.js can automatically
	 * apply your app to existing DOM elements using the cb-app attribute
	 * and guarantees that the correct Views are applies to existing DOM
	 * elements that use the cb-view attribute, without any additional
	 * code needing to be written!
	 */
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns
	});
	
	ns.MyView = conbo.View.extend
	({
		template: utils.getHello('Namespace')
	});
	
});