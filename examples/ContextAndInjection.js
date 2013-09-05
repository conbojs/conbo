/**
 * Context & dependency injection example for Conbo.js
 * @author	Neil Rackett
 */
(function()
{
	var WarningCommand = conbo.Command.extend
	({
		myModel: undefined,
		
		execute: function()
		{
			alert('Watch out '+this.myModel.get('name')+'!');
		}
	});
	
	/**
	 * Switch conbo.Map for conbo.Model if you need web services
	 */
	var MyModel = conbo.Map.extend
	({
		defaults: 
		{
			name: 'Conbo'
		}
	});
	
	var InputView = conbo.View.extend
	({
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		initialize: function()
		{
			this.bindAll();
			this.template = _.template('My name is <input type="text" value="<%=name%>" /><button>Submit</button>');
			this.render();
		},
		
		render: function()
		{
			this.$el.html(this.template(this.myModel.toJSON()));
			this.$('button').on('click', this.button_clickHandler);
			
			return this;
		},
		
		button_clickHandler: function()
		{
			this.myModel.set('name', this.$('input').val())
			this.context.trigger(new conbo.Event('warning'));
		}
	});
	
	var MyContext = conbo.Context.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.mapCommand('warning', WarningCommand);
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
			this.inputView = new InputView(this.context.addTo());
			this.render();
		},
	
		render: function()
		{
			this.appendView(this.inputView);
			return this;
		}
	});
	
	var app = new MyApp();
	
	document.body.appendChild(app.el);
	
})();