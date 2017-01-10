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
	conbo.BindingUtils.registerAttribute('customItalic', function(el, value, options, param)
	{
		$(el).css('font-style', value ? 'italic' : 'normal');
	});
	
	/**
	 * Read-only custom attribute
	 */
	conbo.BindingUtils.registerAttribute('customBlue', function(el)
	{
		$(el).css('color', 'blue');
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
