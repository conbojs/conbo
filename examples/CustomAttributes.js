/**
 * Custom attribute example for ConboJS
 * Demonstrates how to create a custom attribute
 * 
 * @author	Neil Rackett
 */
conbo('ns', conbo, function(conbo)
{
	var ns = this;
	
	/**
	 * Bindable custom attribute
	 */
	conbo.bindingUtils.registerAttribute('customItalic', function(el, value, options, param)
	{
		el.style.fontStyle = value ? 'italic' : 'normal';
	});
	
	/**
	 * Read-only custom attribute
	 */
	conbo.bindingUtils.registerAttribute('customBlue', function(el)
	{
		el.style.color = 'blue';
	}, 
	true);
	
	/**
	 * Application with a bindable value
	 */
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		myValue: false
	});
	
});
