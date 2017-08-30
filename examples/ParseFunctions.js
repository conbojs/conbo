/**
 * Binding and parsing example for ConboJS
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	/**
	 * Switch conbo.Hash for conbo.RemoteHash if you need web services
	 */
	ns.MyModel = conbo.Hash.extend
	({
		declarations: function()
		{
			this.price = 123.456;
		}
	});
	
	ns.InputView = conbo.View.extend
	({
		tagName: 'p',
		numRegex: /[0-9\.]/g,
		template: 'Type a number here: <input type="text" cb-bind="myModel.price" cb-restrict="numRegex" />',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined
	});
	
	ns.OutputView = conbo.View.extend
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
			var n = Number(value);
			
			if (n == 0) return "free";
			if (n < 10) return "cheap";
			if (n < 100) return "good";
			if (n < 1000) return "a lot";
			return "expensive";
		}
	});
	
	ns.MyContext = conbo.Context.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.mapSingleton('myModel', ns.MyModel);
		}
	});
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		/**
		 * Application will automatically use an instance of this class as 
		 * the application's context (event bus); uses vanilla conbo.Context
		 * if not specified
		 */
		contextClass: ns.MyContext,
		
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.appendView
			(
				new ns.InputView(this.context.addTo()), 
				new ns.OutputView(this.context.addTo())
			);
			
			return this;
		}
	});
	
});