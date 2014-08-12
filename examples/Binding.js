/**
 * Binding example for Conbo.js
 * 
 * @author	Neil Rackett
 */
(function()
{
	/**
	 * Switch conbo.Hash (available in Core build) for conbo.Model (requires 
	 * Complete build) if you need web services
	 */
	var MyModel = conbo.Hash.extend
	({
		defaults: 
		{
			name: 'Conbo'
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
	
	var InputView = conbo.View.extend
	({
		tagName: 'p',
		
		/**
		 * cb-bind is Conbo's simplest form of data binding, automatically
		 * detecting the best way to bind your data to the element
		 */
		template: 'My name is <input type="text" cb-bind="myModel.name" />',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		render: function()
		{
			return this;
		}
	});
	
	var OutputView = conbo.View.extend
	({
		tagName: 'h1',
		
		/**
		 * cb-bind is Conbo's simplest form of data binding, automatically
		 * detecting the best way to bind your data to the element
		 */
		template: 'Hello <span cb-bind="myModel.name" />!',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined
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
				new InputView(this.context.addTo()), 
				new OutputView(this.context.addTo())
			);
		}
	});
	
	new MyApp({el:document.body});
	
})();