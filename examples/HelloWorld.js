/**
 * Hello World example for Conbo.js
 * @author	Neil Rackett
 */
(function()
{
	var MyApp = conbo.Application.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.el.innerHTML = "Hello World!";
		}
	});
	
	var app = new MyApp();
	
	document.body.appendChild(app.el);
	
})();