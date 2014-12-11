/**
 * HTTP Service
 * 
 * Base class for HTTP data services, default settings are designed for JSON
 * REST APIs; parseFunction required for XML data sources
 * 
 * @author Neil Rackett
 */
conbo.HttpService = conbo.EventDispatcher.extend
({
	constructor: function(options)
	{
		this.isRpc = true;
		
		conbo.setValues(this, conbo.pick(options || {}, 
		    'rootUrl', 
		    'contentType', 
		    'dataType', 
		    'isRpc', 
		    'headers', 
		    'parseFunction', 
		    'resultClass',
		    'makeObjectsBindable'
		));
		
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
		
		var contentType;
		
		data = conbo.clone(data) || {};
		resultClass || (resultClass = this.resultClass);
		
		contentType = this.contentType
			|| (this.isRpc ? 'application/json' : 'application/x-www-form-urlencoded');
		
		command = this.parseUrl(command, data);
		
		data = this.isRpc
			? (method == 'GET' ? undefined : JSON.stringify(conbo.isFunction(data.toJSON) ? data.toJSON() : data))
			: data;
		
		var promise = $.ajax
		({
			data: data,
			type: method || 'GET',
			headers: this.headers,
			url: this.rootUrl+command,
			contentType: contentType,
			dataType: this.dataType,
			dataFilter: this.parseFunction
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

