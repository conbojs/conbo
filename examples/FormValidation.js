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
		
		// You can use cb-max-chars to limit the number of characters that can be entered into a form field 
		maxNameLength: 12,
		
		// You can cb-restrict fields to specific characters using RexExp
		lettersOnly: /[a-zA-Z]/g,
		
		// Validators can by RegExp
		validateName: /\w{3,}/,
		
		// ... or functions
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