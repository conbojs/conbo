// conbo.Router
// ---------------

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
conbo.Router = conbo.EventDispatcher.extend
({
	  constructor: function(options) 
	  {
		options || (options = {});
		if (options.routes) this.routes = options.routes;
		this._bindRoutes();
		this.initialize.apply(this, arguments);
	  },

  // initialization logic.
  initialize: function(){},

  // Manually bind a single named route to a callback. For example:
  //
  //     this.route('search/:query/p:num', 'search', function(query, num) {
  //       ...
  //     });
  //
  route: function(route, name, callback) {
    if (!_.isRegExp(route)) route = this._routeToRegExp(route);
    if (!callback) callback = this[name];
    
    if (!_.isRegExp(route)) route = this._routeToRegExp(route);
    if (_.isFunction(name)) {
      callback = name;
      name = '';
    }
    
    if (!callback) callback = this[name];
    
    conbo.history.route(route, this.bind(function(fragment)
    {
      var args = this._extractParameters(route, fragment);
      callback && callback.apply(this, args);
      
    	this.trigger(new conbo.ConboEvent
    	({
    		type: 'route:' + name, 
    		router: this,
    		route: route,
    		params: options
    	}));
    	
    	var event = new conbo.ConboEvent
    	({
    		type: conbo.ConboEvent.ROUTE, 
    		router: this,
    		route: name,
    		params: args
        });
    	
    	this.trigger(event);
    	conbo.history.trigger(event);
    }));
    
    return this;
  },

  // Simple proxy to `conbo.history` to save a fragment into the history.
  navigate: function(fragment, options) {
    conbo.history.navigate(fragment, options);
    return this;
  },

  // Bind all defined routes to `conbo.history`. We have to reverse the
  // order of the routes here to support behavior where the most general
  // routes can be defined at the bottom of the route map.
  _bindRoutes: function() {
    if (!this.routes) return;
    this.routes = _.result(this, 'routes');
    var route, routes = _.keys(this.routes);
    while ((route = routes.pop()) != null) {
      this.route(route, this.routes[route]);
    }
  },

  // Convert a route string into a regular expression, suitable for matching
  // against the current location hash.
  _routeToRegExp: function(route) {
    route = route.replace(escapeRegExp, '\\$&')
                 .replace(optionalParam, '(?:$1)?')
                 .replace(namedParam, function(match, optional){
                   return optional ? match : '([^\/]+)';
                 })
                 .replace(splatParam, '(.*?)');
    return new RegExp('^' + route + '$');
  },

  // Given a route, and a URL fragment that it matches, return the array of
  // extracted decoded parameters. Empty or unmatched parameters will be
  // treated as `null` to normalize cross-browser behavior.
  _extractParameters: function(route, fragment) {
    var params = route.exec(fragment).slice(1);
    return _.map(params, function(param) {
      return param ? decodeURIComponent(param) : null;
    });
  }

});
