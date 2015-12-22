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
		
		/**
		 * ... or a function that returns true for a valid result and either
		 * false or a String for an invalid result; if a string is returned it
		 * will be appended to cb-invalid-* and applied as a class
		 */
		validateAge: function(age)
		{
			age = parseInt(age);
			
			switch (true)
			{
				case age < 18:
					return false;
				
				case age >= 100:
					return "too-old";
			}
			
			return true;
		},
		
	});
	
});