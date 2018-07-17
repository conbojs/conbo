/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @class		Application
 * @memberof	conbo
 * @augments	conbo.View
 * @author		Neil Rackett
 * @param 		{Object} options - Object containing optional initialisation options, see View
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#DETACH
 * @fires		conbo.ConboEvent#REMOVE
 * @fires		conbo.ConboEvent#BIND
 * @fires		conbo.ConboEvent#UNBIND
 * @fires		conbo.ConboEvent#TEMPLATE_COMPLETE
 * @fires		conbo.ConboEvent#TEMPLATE_ERROR
 * @fires		conbo.ConboEvent#CREATION_COMPLETE
 */
conbo.Application = conbo.View.extend(
/** @lends conbo.Application.prototype */
{
	/**
	 * @member		{conbo.Namespace} namespace - The application's namespace (required)
	 * @memberof	conbo.Application.prototype
	 */
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		options = conbo.clone(options) || {};
		
		if (!(this.namespace instanceof conbo.Namespace))
		{
			throw new Error('Application namespace must be an instance of conbo.Namespace');
		}
		
		options.app = this;
		options.context = new this.contextClass(options);

		this.addEventListener(conbo.ConboEvent.CREATION_COMPLETE, this.__creationComplete, this, 0, true);
		
		conbo.View.prototype.__construct.call(this, options);
	},
	
	/**
	 * @private
	 */
	__creationComplete: function(options)
	{
		if (this.initialView)
		{
			this.appendView(this.initialView);
		}
	},

	/**
	 * If specified, this View will be appended immediately after the Application is intialized.
	 * If this property is set to a class, it will be instantiated automatically the first time
	 * this property is read, with initialViewOptions passed to the constructor.
	 * @type	{conbo.View|Function}
	 */
	get initialView()
	{
		if (typeof this.__initialView == 'function')
		{
			var options = conbo.assign({}, this.initialViewOptions, {context:this.context});
			this.initialView = new this.__initialView(options);
		}

		return this.__initialView;
	},

	set initialView(value)
	{
		this.__initialView = value;
	},

	/**
	 * If initialView is a View class, the initialViewOptions will be passed to the
	 * constructor when it is instantiated and added to the application
	 * @type	{*}
	 */
	get initialViewOptions()
	{
		return this.__initialViewOptions || {};
	},

	set initialViewOptions(value)
	{
		this.__initialViewOptions = value;
	},

	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 * @type	{conbo.Context}
	 */
	get contextClass() 
	{
		return this.__contextClass || conbo.Context;
	},
	
	set contextClass(value)
	{
		this.__contextClass = value;
	},
	
	/**
	 * If true, the application will automatically apply Glimpse and View 
	 * classes to elements when they're added to the DOM 
	 * @type	{boolean}
	 */
	get observeEnabled()
	{
		return !!this.__mo;
	},
	
	set observeEnabled(value)
	{
		if (value == this.observeEnabled) return;
		
		var mo;
		
		if (value)
		{
			mo = new conbo.MutationObserver();
			mo.observe(this.el);
			
			mo.addEventListener(conbo.ConboEvent.ADD, function(event)
			{
				conbo.bindingUtils
					.applyViews(this, this.namespace)
					.applyViews(this, this.namespace, 'glimpse')
					;
			}, 
			this);
			
			this.__mo = mo;
		}
		else if (this.__mo)
		{
			mo = this.__mo;
			mo.removeEventListener();
			mo.disconnect();
			
			delete this.__mo;
		}
		
		this.dispatchChange('observeEnabled');
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	/**
	 * @private
	 */
	__setEl: function(element)
	{
		conbo.View.prototype.__setEl.call(this, element);
		__ep(this.el).addClass('cb-app');
		return this;
	},
	
});

__denumerate(conbo.Application.prototype);
