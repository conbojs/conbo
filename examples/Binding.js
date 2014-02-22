/**
 * Binding example for Conbo.js
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
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		render: function()
		{
			this.$el.html('My name is <input type="text" cb-bind="myModel.name" />');
			return this;
		},
		
		toString: function()
		{
			return 'InputView';
		}

	});
	
	var OutputView = conbo.View.extend
	({
		tagName: 'h1',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		render: function()
		{
			this.$el.html('Hello <span><span><span cb-bind="myModel.name" /></span></span>!');
			return this;
		},
		
		toString: function()
		{
			return 'OutputView';
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
				new InputView(this.context().addTo()), 
				new OutputView(this.context().addTo())
			);
		},
		
		toString: function()
		{
			return 'MyApp';
		}
	});
	
	var app = new MyApp();
	
	document.body.appendChild(app.el);
	
})();