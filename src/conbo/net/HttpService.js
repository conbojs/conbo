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
 */
conbo.HttpService = conbo.EventDispatcher.extend(
/** @lends conbo.HttpService.prototype */
{
	constructor: function(options)
	{
		conbo.setValues(this, conbo.pick(options || {}, 
		    'rootUrl', 
		    'contentType', 
		    'dataType', 
		    'isRpc', 
		    'headers', 
		    'encodeFunction', 
		    'decodeFunction', 
		    'resultClass',
		    'makeObjectsBindable'
		));
		
		conbo.EventDispatcher.prototype.constructor.apply(this, arguments);
	},
	
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
	
	call: function(command, data, method, resultClass)
	{
		var contentType;
		
		data = conbo.clone(data) || {};
		method || (method = 'GET');
		resultClass || (resultClass = this.resultClass);
		
		contentType = this.contentType
			|| (this.isRpc ? 'application/json' : 'application/x-www-form-urlencoded');
		
		command = this.parseUrl(command, data);
		data = this.encodeFunction(data);
		
		var promise = $.ajax
		({
			data: data,
			type: method,
			headers: this.headers,
			url: this.rootUrl+command,
			contentType: contentType,
			dataType: this.dataType,
			dataFilter: this.decodeFunction
		});
		
		var token = new conbo.AsyncToken
		({
			promise: promise, 
			resultClass: resultClass, 
			makeObjectsBindable: this.makeObjectsBindable
		});
		
		token.addResponder(new conbo.Responder(this.dispatchEvent, this.dispatchEvent, this));
		
		return token;
	},
	
	/**
	 * Add one or more remote commands as methods of this class instance
	 * @param	{String}	command
	 * @param	{String}	method
	 * @param	{Class}		resultClass
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
	 * @param	{object}	data - Object containing the data to be sent to the API
	 */
	encodeFunction: function(data)
	{
		return this.isRpc ? JSON.stringify(data) : data;
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
	
	
}).implement(conbo.IInjectable);

