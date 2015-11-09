/**
 * Form validation example for Conbo.js
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		initialize: function()
		{
			// 
		},
		
		validateName: function(name)
		{
			return (name || '').length >= 3;
		},
		
		validateAge: function(age)
		{
			return parseInt(age) >= 18;
		},
		
	});
	
	/**
	 * conbo.init automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	ns.init();
	
});