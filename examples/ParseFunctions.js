/**
 * Binding and parsing example for Conbo.js
 * @author	Neil Rackett
 */
(function()
{
	/**
	 * Switch conbo.Hash for conbo.Model if you need web services
	 */
	var MyModel = conbo.Hash.extend
	({
		defaults: 
		{
			price: 1234.567
		}
	});
	
	var InputView = conbo.View.extend
	({
		tagName: 'p',
		template: 'Type a number here: <input type="text" cb-bind="myModel.price" />',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined
	});
	
	var OutputView = conbo.View.extend
	({
		tagName: 'h1',
		
		/**
		 * Template to creates some HTML for our view with 2 bindable DOM elements
		 * that have their HTML content populated using the cb-html attribute
		 * 
		 * The format for cb-* attributes is "propertyToBindTo|functionParseData", 
		 * where the parse function is optional
		 * 
		 * @returns {this}
		 */
		template: 'It cost <span cb-html="myModel.price|parseCurrency" />? That\'s <span cb-html="myModel.price|parseDescription" />!',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		/**
		 * Parses the input value into a formatted currency value, e.g. 1234.56 --> �1,234.56
		 * @param 	value
		 * @returns	{String}
		 */
		parseCurrency: function(value)
		{
			var n = parseFloat(value), 
				c = 2, 
				d = '.', 
				t = ',', 
				s = n < 0 ? '-' : '', 
				i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '', 
				j = (j = i.length) > 3 ? j % 3 : 0;
			
			return '&pound;' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
		},
		
		/**
		 * Parses the input value into a description of how expensive it is
		 * @param 	value
		 * @returns {String}
		 */
		parseDescription: function(value)
		{
			var n = parseFloat(value);
			
			if (n < 10) return "cheap";
			if (n < 100) return "good";
			if (n < 1000) return "a lot";
			return "expensive";
		}
	});
	
	var MyContext = conbo.Context.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.mapSingleton('myModel', MyModel);
		}
	});
	
	var MyApp = conbo.Application.extend
	({
		/**
		 * Application will automatically use an instance of this class as 
		 * the application's context (event bus); uses vanilla conbo.Context
		 * if not specified
		 */
		contextClass: MyContext,
		
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.appendView
			(
				new InputView(this.context.addTo().addTo()), 
				new OutputView(this.context.addTo().addTo())
			);
			
			return this;
		}
	});
	
	new MyApp({el:document.body});
	
})();