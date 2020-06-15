/**
 * Router
 * 
 * Routers map faux-URLs to actions, and fire events when routes are
 * matched. Creating a new one sets its `routes` hash, if not set statically.
 * 
 * Derived from the Backbone.js class of the same name
 * 
 * @class		Router
 * @memberof	conbo
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{Object} options - Object containing initialisation options
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#FAULT
 * @fires		conbo.ConboEvent#ROUTE
 * @fires		conbo.ConboEvent#START
 * @fires		conbo.ConboEvent#STOP
 */
conbo.Router = conbo.EventDispatcher.extend(
/** @lends conbo.Router.prototype */
{
	/**
	 * @private
	 */
	__construct: function(options) 
	{
		if (options.routes) 
		{
			this.routes = options.routes;
		}
		
		this.historyClass = conbo.History;
		this.context = options.context;
	},
	
	/**
	 * Start the router
	 */
	start: function(options)
	{
		if (!this.__history)
		{
			this.__history = new this.historyClass();
			this.__bindRoutes();
			
			this.__history
				.addEventListener(conbo.ConboEvent.FAULT, this.dispatchEvent, {scope:this})
				.addEventListener(conbo.ConboEvent.CHANGE, this.dispatchEvent, {scope:this})
				.start(options)
				;
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.START));
		}
		
		return this;
	},
	
	/**
	 * Stop the router
	 */
	stop: function()
	{
		if (this.__history)
		{
			this.__history
				.removeEventListener()
				.stop()
				;
			
			delete this.__history;
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.STOP));
		}
		
		return this;
	},
	
	/**
	 * Adds a route
	 * 
	 * @example
	 * 		this.addRoute('search/:query/p:num', 'search', function(query, num) {
	 * 			 ...
	 * 		});
	 */ 
	addRoute: function(route, nameOrData, callback) 
	{
		var name = conbo.isString(nameOrData) ? nameOrData : (('name' in nameOrData) ? nameOrData.name : '');
		var data = conbo.isString(nameOrData) ? null : nameOrData;
		var regExp = conbo.isRegExp(route) ? route : this.__routeToRegExp(route);
		
		if (!callback)
		{
			callback = this[name];
		}
		
		this.__history.addRoute(regExp, (function(path)
		{
			var args = this.__extractParameters(regExp, path);
			
			var params = conbo.isString(route) 
				? conbo.object((route.match(/:\w+/g) || []).map(function(r) { return r.substr(1); }), args) 
				: {}
				;
			
			if (conbo.isFunction(callback))
			{
				callback.apply(this, args);
			}
			
			var options = 
			{
				router:		this,
				route:		regExp,
				name:		name,
				data:		data,
				parameters:	args,
				params:		params,
				path:		path
			};
			
			if (name)
			{
				this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ROUTE+':'+name, options));
			}

			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
			
		}).bind(this));
		
		return this;
	},
	
	/**
	 * Sets the current path, optionally replacing the current path or silently 
	 * without triggering a route event
	 * 
	 * @param	{string}	path - The path to navigate to
	 * @param	{Object}	[options] - Object containing options: trigger (default: true) and replace (default: false)
	 */
	setPath: function(path, options) 
	{
		options = conbo.setDefaults({}, options, {trigger:true});
		
		this.__history.setPath(path, options);
		return this;
	},
	
	/**
	 * Get or set the current path using the default options
	 * @type	{string}
	 */
	get path()
	{
		return this.__history ? this.__history.getPath() : '';
	},
	
	set path(value)
	{
		return this.setPath(value);
	},
	
	toString: function()
	{
		return 'conbo.Router';
	},
	
	/**
	 * Bind all defined routes. We have to reverse the
	 * order of the routes here to support behavior where the most general
	 * routes can be defined at the bottom of the route map.
	 * 
	 * @private
	 */
	__bindRoutes: function() 
	{
		if (!this.routes) return;
		
		var route;
		var routes = conbo.keys(this.routes);
		
		while ((route = routes.pop()) != null)
		{
			this.addRoute(route, this.routes[route]);
		}
	},
	
	/**
	 * Convert a route string into a regular expression, suitable for matching
	 * against the current location hash.
	 * 
	 * @private
	 */
	__routeToRegExp: function(route) 
	{
		var rootStripper 	= /^\/+|\/+$/g;
		var optionalParam 	= /\((.*?)\)/g;
		var namedParam		= /(\(\?)?:\w+/g;
		var splatParam		= /\*\w+/g;
		var escapeRegExp	= /[\-{}\[\]+?.,\\\^$|#\s]/g;
		
		route = route
			.replace(rootStripper, '')
			.replace(escapeRegExp, '\\$&')
			.replace(optionalParam, '(?:$1)?')
			.replace(namedParam, function(match, optional)
			{
				return optional ? match : '([^\/]+)';
			})
			.replace(splatParam, '(.*?)');
		
		return new RegExp('^' + route + '$');
	},

	/**
	 * Given a route, and a URL fragment that it matches, return the array of
	 * extracted decoded parameters. Empty or unmatched parameters will be
	 * treated as `null` to normalize cross-browser behavior.
	 * 
	 * @private
	 */
	__extractParameters: function(route, fragment) 
	{
		var params = route.exec(fragment).slice(1);
		
		return conbo.map(params, function(param) 
		{
			if (param)
			{
				// Fix for Chrome's invalid URI error
				try { return decodeURIComponent(param); }
				catch (e) { return unescape(param); }
			}
			
			return null;
		});
	}
	
}).implement(conbo.IInjectable);

__denumerate(conbo.Router.prototype);
