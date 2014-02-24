/**
 * Sync
 * 
 * Override this function to change the manner in which conbo persists
 * models to the server. You will be passed the type of request, and the
 * model in question. By default, makes a RESTful Ajax request
 * to the model's `url()`. Some possible customizations could be:
 * 
 * - Use `setTimeout` to batch rapid-fire updates into a single request.
 * - Send up the models as XML instead of JSON.
 * - Persist models via WebSockets instead of Ajax.
 * 
 * Turn on `conbo.emulateHTTP` in order to send `PUT` and `DELETE` requests
 * as `POST`, with a `_method` parameter containing the true HTTP method,
 * as well as all requests with the body as `application/x-www-form-urlencoded`
 * instead of `application/json` with the model in a param named `model`.
 * Useful when interfacing with server-side languages like **PHP** that make
 * it difficult to read the body of `PUT` requests.
 * 
 * Derived from the Backbone.js method of the same name
 */
conbo.sync = function(method, model, options) 
{
	var type = methodMap[method];

	// Default options, unless specified.
	_.defaults(options || (options = {}), 
	{
		emulateHTTP: conbo.emulateHTTP,
		emulateJSON: conbo.emulateJSON
	});

	// Default JSON-request options.
	var params =
	{
		type: type, 
		dataType: options.dataType || model.dataType || 'json'
	};

	// Ensure that we have a URL.
	if (!options.url) 
	{
		var url = _.result(model, 'url');
		if (!url) throw new Error('"url" must be specified');
		params.url = url;
	}
	
	// Ensure that we have the appropriate request data.
	if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) 
	{
		params.contentType = 'application/json';
		params.data = JSON.stringify(options.attrs || model.toJSON(options));
	}

	// For older servers, emulate JSON by encoding the request into an HTML-form.
	if (options.emulateJSON)
	{
		params.contentType = 'application/x-www-form-urlencoded';
		params.data = params.data ? {model: params.data} : {};
	}

	// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	// And an `X-HTTP-Method-Override` header.
	if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) 
	{
		params.type = 'POST';
		
		if (options.emulateJSON)
		{
			params.data._method = type;
		}
		
		var beforeSend = options.beforeSend;
		
		options.beforeSend = function(xhr) 
		{
			xhr.setRequestHeader('X-HTTP-Method-Override', type);
			if (beforeSend) return beforeSend.apply(this, arguments);
		};
	}

	// Don't process data on a non-GET request.
	if (params.type !== 'GET' && !options.emulateJSON) 
	{
		params.processData = false;
	}
	
	// Enable the use of non-JSON data formats; must use parse() in model/collection
	if (params.dataType != 'json')
	{
		params.contentType = options.contentType || model.dataType || 'application/json';
			params.processData = false;
	}
	
	// If we're sending a `PATCH` request, and we're in an old Internet Explorer
	// that still has ActiveX enabled by default, override jQuery to use that
	// for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
	if (params.type === 'PATCH' && window.ActiveXObject &&
		!(window.external && window.external.msActiveXFilteringEnabled)) 
	{
		params.xhr = function()
		{
			return new ActiveXObject("Microsoft.XMLHTTP");
		};
	}

	// Make the request, allowing the user to override any Ajax options.
	var xhr = options.xhr = conbo.ajax(_.extend(params, options));
	
	model.trigger(new conbo.ConboEvent(conbo.ConboEvent.REQUEST,
	{
		model: model, 
		xhr: xhr, 
		options: options
	}));
	
	return xhr;
};

/** 
 * Map from CRUD to HTTP for our default `conbo.sync` implementation.
 */
var methodMap = 
{
	'create':	'POST',
	'update':	'PUT',
	'patch':	'PATCH',
	'delete':	'DELETE',
	'read':		'GET'
};

/**
 * Set the default implementation of `conbo.ajax` to proxy through to `$`.
 * Override this if you'd like to use a different library.
 */
conbo.ajax = function() 
{
	return $.ajax.apply($, arguments);
};
