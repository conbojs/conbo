/**
 * HTTP Service
 * 
 * Base class for HTTP data services, with default configuration designed 
 * for use with JSON REST APIs.
 * 
 * For XML data sources, you will need to override decodeFunction to parse 
 * response data, change the contentType and implement encodeFunction if 
 * you're using RPC.  
 * 
 * @class		conbo.HttpService
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{Object} options - Object containing optional initialisation options, including 'rootUrl', 'contentType', 'dataType', 'headers', 'encodeFunction', 'decodeFunction', 'resultClass','makeObjectsBindable'
 * @fires		conbo.ConboEvent#RESULT
 * @fires		conbo.ConboEvent#FAULT
 */
conbo.HttpService = conbo.EventDispatcher.extend(
/** @lends conbo.HttpService.prototype */
{
	__construct: function(options)
	{
		options = conbo.setDefaults(options, 
		{
			contentType: conbo.CONTENT_TYPE_JSON
		});
		
		conbo.setValues(this, conbo.setDefaults(conbo.pick(options, 
		    'rootUrl', 
		    'contentType', 
		    'dataType', 
		    'headers', 
		    'encodeFunction', 
		    'decodeFunction', 
		    'resultClass',
		    'makeObjectsBindable'
		), {
			dataType: 'json'
		}));
		
		var verbs = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'];
		
		verbs.forEach(function(verb)
		{
			this[verb.toLowerCase()] = function(command, data, method, resultClass)
			{
				return this.call(command, data, verb, resultClass);
			};
		}, 
		this);
		
		conbo.EventDispatcher.prototype.__construct.apply(this, arguments);
	},
	
	/**
	 * The root URL of the web service
	 */
	get rootUrl()
	{
		return this._rootUrl || '';
	},
	
	set rootUrl(value)
	{
		value = String(value);
		
		if (value && value.slice(-1) != '/')
		{
			value += '/';
		}
		
		this._rootUrl = value;
	},
	
	/**
	 * Call a method of the web service using the specified verb
	 * 
	 * @param	{string}	command - The name of the command
	 * @param	{Object}	data - Object containing the data to send to the web service
	 * @param	{string}	method - GET, POST, etc (default: GET)
	 * @param	{Class}		resultClass - Optional
	 * @returns	{conbo.Promise}
	 */
	call: function(command, data, method, resultClass)
	{
		data = conbo.clone(data || {});
		command = this.parseUrl(command, data);
		data = this.encodeFunction(data, method);
		
		var promise = conbo.httpRequest
		({
			data: data,
			type: method || 'GET',
			headers: this.headers,
			url: this.rootUrl+command,
			contentType: this.contentType || conbo.CONTENT_TYPE_JSON,
			dataType: this.dataType,
			dataFilter: this.decodeFunction,
			resultClass: resultClass || this.resultClass, 
			makeObjectsBindable: this.makeObjectsBindable
		});
		
		promise.then(this.dispatchEvent, this.dispatchEvent, this);
		
		return promise;
	},
	
	/**
	 * Call a method of the web service using the POST verb
	 * 
	 * @memberof	conbo.HttpService.prototype
	 * @method		post
	 * @param		{string}	command - The name of the command
	 * @param		{Object}	data - Object containing the data to send to the web service
	 * @param		{Class}		resultClass - Optional
	 * @returns		{conbo.Promise}
	 */
	
	/**
	 * Call a method of the web service using the GET verb
	 * 
	 * @memberof	conbo.HttpService.prototype
	 * @method		get 
	 * @param		{string}	command - The name of the command
	 * @param		{Object}	data - Object containing the data to send to the web service
	 * @param		{Class}		resultClass - Optional
	 * @returns		{conbo.Promise}
	 */
	
	/**
	 * Call a method of the web service using the PUT verb
	 * 
	 * @memberof	conbo.HttpService.prototype
	 * @method		put
	 * @param		{string}	command - The name of the command
	 * @param		{Object}	data - Object containing the data to send to the web service
	 * @param		{Class}		resultClass - Optional
	 * @returns		{conbo.Promise}
	 */
	
	/**
	 * Call a method of the web service using the PATCH verb
	 * 
	 * @memberof	conbo.HttpService.prototype
	 * @method		patch
	 * @param		{string}	command - The name of the command
	 * @param		{Object}	data - Object containing the data to send to the web service
	 * @param		{Class}		resultClass - Optional
	 * @returns		{conbo.Promise}
	 */
	
	/**
	 * Call a method of the web service using the DELETE verb
	 * 
	 * @memberof	conbo.HttpService.prototype
	 * @method		delete
	 * @param		{string}	command - The name of the command
	 * @param		{Object}	data - Object containing the data to send to the web service
	 * @param		{Class}		resultClass - Optional
	 * @returns		{conbo.Promise}
	 */
	
	/**
	 * Add one or more remote commands as methods of this class instance
	 * @param	{string}	command - The name of the command
	 * @param	{string}	method - GET, POST, etc (default: GET)
	 * @param	{Class}		resultClass - Optional
	 */
	addCommand: function(command, method, resultClass)
	{
		if (conbo.isObject(command))
		{
			method = command.method;
			resultClass = command.resultClass;
			command = command.command;
		}
		
		this[conbo.toCamelCase(command)] = function(data)
		{
			return this.call(command, data, method, resultClass);
		};
		
		return this;
	},
	
	/**
	 * Add multiple commands as methods of this class instance
	 * @param	{Array}		commands
	 */
	addCommands: function(commands)
	{
		if (!conbo.isArray(commands))
		{
			return this;
		}
		
		commands.forEach(function(command)
		{
			this.addCommand(command);
		}, 
		this);
		
		return this;
	},
	
	/**
	 * Method that encodes data to be sent to the API
	 * 
	 * @param	{Object}	data - Object containing the data to be sent to the API
	 * @param	{string}	method - GET, POST, etc (default: GET)
	 */
	encodeFunction: function(data, method)
	{
		return data;
	},
	
	/**
	 * Splice data into URL and remove spliced properties from data object
	 */
	parseUrl: function(url, data)
	{
		var parsedUrl = url,
			matches = parsedUrl.match(/:\b\w+\b/g);
		
		if (!!matches)
		{
			matches.forEach(function(key) 
			{
				key = key.substr(1);
				
				if (!(key in data))
				{
					throw new Error('Property "'+key+'" required but not found in data');
				}
			});
		}
			
		conbo.keys(data).forEach(function(key)
		{
			var regExp = new RegExp(':\\b'+key+'\\b', 'g');
			
			if (regExp.test(parsedUrl))
			{
				parsedUrl = parsedUrl.replace(regExp, data[key]);
				delete data[key];
			}
		});
		
		return parsedUrl;
	},
	
	toString: function()
	{
		return 'conbo.HttpService';
	}
	
})
.implement(conbo.IInjectable);
