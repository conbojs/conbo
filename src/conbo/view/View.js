var delegateEventSplitter = /^(\S+)\s*(.*)$/;

//List of view options to be merged as properties.
var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

/*
 * jQuery plug-ins
 */

conbo.$.fn.cbData = function()
{
	var data = {},
		attrs = this.get()[0].attributes,
		count = 0;
	
	for (var i=0; i<attrs.length; ++i)
	{
		if (attrs[i].name.indexOf('cb-') != 0) continue;
		data[attrs[i].name.substr(3)] = attrs[i].value;
		++count;
	}
	
	return !!count ? data : undefined;
}

/*
 * jQuery expressions
 */

conbo.$.expr[':'].cbAttr = function(el, index, meta, stack)
{
	var $el = conbo.$(el),
		args = meta[3].split(','),
		cb = $el.cbData();
	
	if (!cb) return false;
	if (!!cb && !args.length) return true;
	if (!!args[0] && !args[1]) return cb.hasOwnProperty(args[0]);
	if (!!args[0] && !!args[1]) return cb[args[0]] == args[1];
	return false;
};

/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * Some methods derived from the Backbone.js class of the same name
 */
conbo.View = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = _.clone(options) || {};
		
		this.cid = _.uniqueId('view');
		
		this._addStyle();
		this._configure(options);
		this._ensureElement();
		this._inject(options);
		
		this.initialize.apply(this, arguments);
		
		var templateUrl = options.templateUrl || _.result(this, 'templateUrl'),
			template = options.template || _.result(this, 'template');
		
		if (!!templateUrl)
		{
			this.load(templateUrl);
		}
		else
		{
			if (!!template)
			{
				this.$el.html(template);
			}
			else
			{
				this.render();
			}
			
			this.$el.addClass('cb-view');
			
//			this.callLater(function()
//			{
				this.bindView();
				this.delegateEvents();
//			});
		}
	},
	
	/**
	 * The default `tagName` of a View's element is `"div"`.
	 */
	tagName: 'div',
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	
	initialize: function(){},
	/**
	 * jQuery delegate for element lookup, scoped to DOM elements within the
	 * current view. This should be prefered to global lookups where possible.
	 */
	$: function(selector)
	{
		return this.$el.find(selector);
	},
	
	/**
	 * If you're not using a template, you should override **render** to
	 * populate your View's element (`this.el`) with the appropriate HTML. The
	 * convention is for **render** to always return `this`.
	 */
	render: function() 
	{
		return this;
	},
	
	/**
	 * Remove this view by taking the element out of the DOM, and removing any
	 * applicable events listeners.
	 */
	remove: function() 
	{
		this.$el.remove();
		
		this.unbindView()
			.off();
		
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property), including event
	 * re-delegation.
	 */
	setElement: function(element, delegate)
	{
		if (this.$el)
		{
			this.undelegateEvents()
				.unbindView();
		}
		
		this.$el = conbo.$(element);
		this.el = this.$el[0];
		
		if (delegate !== false) this.delegateEvents();
		
		if (!(this instanceof conbo.Application))
		{
			this.bindView();
		}
		
		return this;
	},
	
	/**
	 * Append this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	appendView: function(view)
	{
		if (arguments.length > 1)
		{
			_.each(arguments, function(view, index, list) {
				this.appendView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw new Error('Parameter must be instance of conbo.View class');
		
		this.$el.append(view.el);
		return this;
	},
	
	/**
	 * Prepend this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	prependView: function(view)
	{
		if (arguments.length > 1)
		{
			_.each(arguments, function(view, index, list) {
				this.prependView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw new Error('Parameter must be instance of conbo.View class');
		
		this.$el.prepend(view.el);
		return this;
	},
	
	/**
	 * Enables or disabled mouse/touch interaction with this view
	 * @param 	value	Boolean
	 * @returns
	 */
	mouseEnabled: function(value)
	{
		return this._setClass.apply(this, _.union(['conbo-disabled'], _.toArray(arguments)));
	},
	
	/**
	 * Hides view, but takes up the same space as before
	 * @param 		value	Boolean
	 * @returns		
	 */
	visible: function(value)
	{
		return this._setClass.apply(this, _.union(['conbo-invisible'], _.toArray(arguments)));
	},
	
	/**
	 * Hide view and display as if the element is not there
	 * @param value
	 * @returns
	 */
	includeInLayout: function(value)
	{
		return this._setClass.apply(this, _.union(['conbo-excludeFromLayout'], _.toArray(arguments)));
	},
	
	/**
	 * Automatically bind elements to properties of this View
	 * 
	 * @example	<div cb-bind="name|parseMethod"></div> 
	 * @returns	this
	 */
	bindView: function()
	{
		var nestedViews = this.$('.cb-view');
		
		this.$('[cb-bind]').filter(function()
		{
			return !nestedViews.find(this).length;
		})
		.each(this.bind(function(index, el)
		{
			var d = this.$(el).cbData().bind,
				b = d.split('|'),
				s = this._cleanPropName(b[0]).split('.'),
				p = s.pop(),
				m,
				f;
			
			try
			{
				m = !!s.length ? eval('this.'+s.join('.')) : this;
			}
			catch (e) {}
			
			try
			{
				f = !!b[1] ? eval('this.'+this._cleanPropName(b[1])) : undefined;
				f = _.isFunction(f) ? f : undefined;
			}
			catch (e) {}
			
			if (!m) throw new Error(b[0]+' is not defined in this View');
			if (!p) throw new Error('Unable to bind to undefined property');
			
			conbo.BindingUtils.bindElement(m, p, el, f);
			
		}));
		
		return this;
	},
	
	/**
	 * Remove everything except alphanumberic and dots from Strings
	 * @param 		value
	 * @returns		String
	 */
	_cleanPropName: function(value)
	{
		return (value || '').replace(/[^\w,\.]/g, '');
	},
	
	/**
	 * Unbind elements from class properties
	 * @returns	this
	 */
	unbindView: function() 
	{
		// TODO Implement unbindView()
		return this;
	},
	
	/**
	 * Loads HTML content into this.el
	 * 
	 * @param 	url			A string containing the URL to which the request is sent
	 * @param 	data		A plain object or string that is sent to the server with the request
	 * @param 	complete	Callback in format function(responseText, textStatus, xmlHttpRequest)
	 * 
	 * @see					https://api.jquery.com/load/
	 */
	load: function(url, data, callbackFunction)
	{
		this.unbindView();
		this.undelegateEvents();
		
		var completeHandler = this.bind(function(responseText, textStatus, xmlHttpRequest)
		{
			this.bindView();
			this.delegateEvents();
			
			if (!!callbackFunction) callbackFunction.apply(this, arguments);
		});
		
		this.$el.load(url, data, completeHandler);
	},
	
	/**
	 * Loads a CSS and apply it
	 * @param	url		The URL of the CSS
	 */
	loadCSS: function(url, callback)
	{
		if (!('document' in window)) return this;
		
		var $link = conbo.$('<link>').attr({rel:"stylesheet", type: "text/css", href:url}),
			link = $link[0],
			hasSheet = ('sheet' in link),
			sheet = hasSheet ? 'sheet' : 'styleSheet', 
			rules = hasSheet ? 'cssRules' : 'rules';
		
		var successInterval = setInterval(function()
		{
			try 
			{
				if (link[sheet] && link[sheet][rules].length) 
				{
					clearInterval(successInterval);
					clearTimeout(errorTimeout);
					callback(true);
				}
			}
			catch(e) {}
		}, 10);
		
		var errorTimeout = setTimeout( function() 
		{
			clearInterval(successInterval);
			clearTimeout(errorTimeout);
			$link.remove();
			callback(false);
		}, 15000);
		
		conbo.$('head').append($link);
		
		return this;
	},
	
	/**
	 * Set callbacks, where `this.events` is a hash of
	 * 
	 * *{"event selector": "callback"}*
	 *
	 *     {
	 *       'mousedown .title':  'edit',
	 *       'click .button':     'save'
	 *       'click .open':       function(e) { ... }
	 *     }
	 *
	 * pairs. Callbacks will be bound to the view, with `this` set properly.
	 * Uses event delegation for efficiency.
	 * Omitting the selector binds the event to `this.el`.
	 * This only works for delegate-able events: not `focus`, `blur`, and
	 * not `change`, `submit`, and `reset` in Internet Explorer.
	 * 
	 * @param	events
	 * @returns this
	 */
	delegateEvents: function(events) 
	{
		if (!(events || (events = _.result(this, 'events')))) return;
		
		this.undelegateEvents();
		
		for (var key in events)
		{
			var method = events[key];
			if (!_.isFunction(method)) method = this[events[key]];
			if (!method) throw new Error('Method "' + events[key] + '" does not exist');
			var match = key.match(delegateEventSplitter);
			var eventName = match[1], selector = match[2];
			method = _.bind(method, this);
			eventName += '.delegateEvents' + this.cid;
			
			if (selector === '') {
				this.$el.on(eventName, method);
			} else {
				this.$el.on(eventName, selector, method);
			}
		}
		return this;
	},
	
	/**
	 * Clears all callbacks previously bound to the view with `delegateEvents`.
	 * You usually don't need to use this, but may wish to if you have multiple
	 * conbo views attached to the same DOM element.
	 */
	undelegateEvents: function() 
	{
		this.$el.off('.delegateEvents' + this.cid);
		return this;
	},
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * TODO Put this elsewhere, but still enable user to inject conbo.$ manually
	 * @private
	 */
	_addStyle: function()
	{
		if (!!conbo.style) return this;
		
		var style = conbo.$(
			'<style type="text/css">'+
				'.conbo-invisible { visibility:hidden !important; }'+
				'.conbo-excludeFromLayout { display:none !important; }'+
				'.conbo-disabled { pointer-events:none !important; }'+
			'</style>');
		
		conbo.$('head').append(style);
		conbo.style = style;
		
		return this;
	},
	
	/**
	 * Performs the initial configuration of a View with a set of options.
	 * Keys with special meaning *(model, collection, id, className)*, are
	 * attached directly to the view.
	 * 
	 * @private
	 */
	_configure: function(options) 
	{
		if (this.options) options = _.extend({}, _.result(this, 'options'), options);
		_.extend(this, _.pick(options, viewOptions));
		this.options = options;
	},
	
	/**
	 * Ensure that the View has a DOM element to render into.
	 * If `this.el` is a string, pass it through `$()`, take the first
	 * matching element, and re-assign it to `el`. Otherwise, create
	 * an element from the `id`, `className` and `tagName` properties.
	 * 
	 * @private
	 */
	_ensureElement: function() 
	{
		if (!this.el) 
		{
			var attrs = _.extend({}, _.result(this, 'attributes'));
			if (this.id) attrs.id = _.result(this, 'id');
			if (this.className) attrs['class'] = _.result(this, 'className');
			var $el = conbo.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
			this.setElement($el, false);
		}
		else 
		{
			this.setElement(_.result(this, 'el'), false);
			if (this.className) this.$el.addClass(this.className);
		}
	},
	
	/**
	 * @private
	 */
	_setClass: function(className, value)
	{
		var a = _.rest(arguments);
		
		if (!a.length) return !this.$el.hasClass(className);
		
		var isElement = _.isString(value) || _.isElement(value) || value instanceof conbo.$;
		var $el = isElement ? this.$(value) : this.$el;
		
		if (a.length == 1 && isElement) return !$el.hasClass(className);
		if (a.length == 2 && isElement) value = a[1];
		
		$el.removeClass(className);
		if (!value) $el.addClass(className);
		
		return this;
	}
});
