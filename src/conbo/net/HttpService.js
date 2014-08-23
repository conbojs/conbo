/**
 * HTTP Service
 * 
 * Base class for HTTP data services, defaults to best guess at content type;
 * You'll need to create a parse method for XML data sources
 * 
 * @author Neil Rackett
 */
conbo.HttpService = conbo.EventDispatcher.extend
({
	isRpc: false,
	
	constructor: function(options)
	{
		options || (options = {});
		
		var props = ['rootUrl', 'contentType'];
		props.forEach(function(prop) { this[prop] = options[prop]; }, this);
		
		conbo.EventDispatcher.prototype.constructor.apply(this, arguments);
	},
	
	get rootUrl()
	{
		return this._rootUrl;
	},
	
	set rootUrl(value)
	{
		value = String(value);
		
		if (value.slice(-1) != '/')
		{
			value += '/';
		}
		
		this._rootUrl = value;
	},
	
	call: function(command, data, method, resultClass)
	{
		if (!this.rootUrl)
		{
			throw new Error('rootUrl not set!');
		}
		
		resultClass || (resultClass = this.resultClass);
		
		data = conbo.clone(data) || {};
		command = this.parseUrl(command, data);
		
		var promise = $.ajax
		({
			data: data,
			type: method || 'GET',
			headers: this.headers,
			url: this.rootUrl+command,
			contentType: this.contentType,
			dataType: this.dataType,
			dataFilter: this.parseFunction
		});
		
		var token = new conbo.AsyncToken({promise:promise, resultClass:resultClass}),
			dispatchEvent = this.bind(this.dispatchEvent);
		
		token.addResponder(new conbo.Responder(dispatchEvent, dispatchEvent));
		
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
			method = command.command;
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
	 * Splice data into URL and remove spliced properties from data object
	 */
	parseUrl: function(url, data)
	{
		var parsedUrl = url;
		
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

_denumerate(conbo.HttpService.prototype);
