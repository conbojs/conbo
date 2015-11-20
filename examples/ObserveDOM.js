/**
 * observeDom example for Conbo.js
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		template: '<p><b>Hello!</b></p><p>I was dynamically detected in the DOM :-)</p>',
	});
	
	/**
	 * ns.observeDom watches the DOM for new elements with a cb-app attribute 
	 * and automatically instantiates the appropriate Application instance
	 */
	ns.observeDom();
});

$(function()
{
	$('#jsButton').on('click', function(event)
	{
		var div = document.createElement('DIV');
		div.setAttribute('cb-app', 'MyApp');
		document.body.appendChild(div);
	});
	
	$('#jqueryButton').on('click', function(event)
	{
		$('body').append('<div cb-app="MyApp" />');
	});
	
});
