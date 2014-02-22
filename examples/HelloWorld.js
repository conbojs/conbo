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
		render: function()
		{
			this.el.innerHTML = "Hello World!";
			return this;
		}
	});
	
	var app = new MyApp();
	
	document.body.appendChild(app.el);
	
})();