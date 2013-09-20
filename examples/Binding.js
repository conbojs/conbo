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
	
	var InputView = conbo.View.extend
	({
		tagName: 'p',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		initialize: function()
		{
			this.$el.html('My name is <input type="text" data-src="myModel.name" />');
			this.bindView();
			
			/*
			// This could also be written as:
			this.$el.html('My name is <input type="text" />');
			conbo.BindingUtils.bindElement(this.myModel, 'name', this.$('input'));
			*/
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
		
		initialize: function()
		{
			this.$el.html('Hello <span data-src="myModel.name" />!');
			this.bindView(); // Automatically binds data-src values in HTML to class properties
			
			/*
			// This could also be written as:
			this.$el.html('Hello <span/>!');
			conbo.BindingUtils.bindElement(this.myModel, 'name', this.$('span'));
			*/
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
			this.render();
		},
		
		render: function()
		{
			this.appendView
			(
				new InputView(this.context.addTo()), 
				new OutputView(this.context.addTo())
			);
			
			return this;
		}
	});
	
	var app = new MyApp();
	
	document.body.appendChild(app.el);
	
})();