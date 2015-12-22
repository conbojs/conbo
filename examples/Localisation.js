/**
 * Simple localisaion example for Conbo.js
 * Demonstrates of dynamic localisaion of an app
 * 
 * @author	Neil Rackett
 */
conbo('ns', this, function(window)
{
	var ns = this;
	
	ns.LocalisationModel = conbo.RemoteHash.extend
	({
		initialize: function()
		{
			this.addEventListener('result', function(event)
			{
				console.info(event.result);
			});
			
			this.localiseTo('en');
		},
		
		localiseTo: function(lang)
		{
			// We're only concerned with the first 2 digits in this example
			lang = lang.substr(0,2);
			
			this._command = 'localisation-'+lang+'.json';
			this.load();
		}
	});
	
	ns.LocalisationContext = conbo.Context.extend
	({
		initialize: function()
		{
			this.mapSingleton('localisation', ns.LocalisationModel);
		}
	});
	
	ns.LocalisedView = conbo.View.extend
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
	
	ns.LocalisedApp = conbo.Application.extend
	({
		namespace: ns,
		contextClass: ns.LocalisationContext
	});
	
});