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
	constructor: function(options)
	{
		options || (options = {});
		
		this.bindAll('dispatchEvent');
		
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
		
		data = conbo.clone(data) || {};
		command = this.parseUrl(command, data);
		
		var promise = $.ajax
		({
			headers: this.headers,
			type: method || 'GET',
			url: this.rootUrl+command,
			contentType: this.contentType,
			data: data,
			dataType: this.dataType,
			dataFilter: this.parse
		});
		
		var token = new conbo.AsyncToken({promise:promise, resultClass:resultClass});
		
		token.addResponder(new conbo.Responder(this.dispatchEvent, this.dispatchEvent));
		
		return token;
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
	}
	
}).implement(conbo.Injectable);

_denumerate(conbo.HttpService.prototype);
