/**
 * Advanced data binding example for ConboJS, using data from a model
 * 
 * @author	Neil Rackett
 */
conbo('ns', function()
{
	var ns = this;
	
	/**
	 * Switch conbo.Hash (available in Core build) for conbo.RemoveHash (requires 
	 * Complete build) if you need web services
	 */
	ns.MyModel = conbo.Hash.extend
	({
		defaults: 
		{
			name: 'Conbo'
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
	
	ns.InputView = conbo.View.extend
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
	});
	
	ns.OutputView = conbo.View.extend
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
		}
	});
	
});