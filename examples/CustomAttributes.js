/**
 * Custom attribute example for Conbo.js
 * Demonstrates how to create a custom attribute
 * 
 * @author	Neil Rackett
 */
conbo('ns', conbo, function(conbo)
{
	var ns = this;
	
	conbo.BindingUtils.registerAttribute('customItalic', function(value, el, options, param)
	{
		$(el).css('font-style', value ? 'italic' : 'normal');
	});
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		myValue: false
	});	
});
