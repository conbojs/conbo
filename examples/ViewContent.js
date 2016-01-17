/**
 * View content example for Conbo.js
 * Demonstrates how to transfer existing content into a View's template
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
		template: 
			'<h1>Templated title!</h1>'+
			'<p cb-content></p>'+
			'<p>More templated content aliquet massa at purus tristique, tincidunt dignissim massa blandit. Sed aliquam fermentum justo, ac dictum sapien aliquet quis.</p>'		
	});
	
	/**
	 * Application with a bindable value
	 */
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns
	});
	
});
