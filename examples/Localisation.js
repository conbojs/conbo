/**
 * Simple localisaion example for Conbo.js
 * Demonstrates of dynamic localisaion of an app
 * 
 * @author	Neil Rackett
 */
(function(window)
{
	var example = {};
	
	example.LocalisationModel = conbo.Model.extend
	({
		initialize: function()
		{
			this.localiseTo('en');
		},
		
		localiseTo: function(lang)
		{
			// We're only concerned with the first 2 digits in this example
			lang = lang.substr(0,2);
			
			this.fetch({url:'localisation-'+lang+'.json'});
		}
	});
	
	example.LocalisationContext = conbo.Context.extend
	({
		initialize: function()
		{
			this.mapSingleton('localisation', example.LocalisationModel);
		}
	});
	
	example.LocalisedView = conbo.View.extend
	({
		localisation: undefined,
		
		browserLocale: (window.navigator.userLanguage || window.navigator.language || 'Unknown'),
		
		initialize: function()
		{
			this.bindAll();
		},
		
		onChangeLocalisation: function(event)
		{
			var $el = conbo.$(event.target),
				lang = $el.data('lang');
			
			this.localisation.localiseTo(lang);
		}
	});
	
	example.LocalisedApp = conbo.Application.extend
	({
		contextClass: example.LocalisationContext
	});
	
	/**
	 * If you don't specify a target element, the app will automatically try
	 * to find a cb-app declararation with the same name as itself, otherwise
	 * it will populate a new element which you can add to the page manually
	 * using app.el
	 */
	var app = new example.LocalisedApp({namespace:example});
	
})(window);