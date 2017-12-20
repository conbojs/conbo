/**
 * HTTP Request
 * 
 * Sends data to and/or loads data from a URL; advanced requests can be made 
 * by passing a single options object, roughly analogous to the jQuery.ajax() 
 * settings object plus `resultClass` and `makeObjectsBindable` properties;
 * or by passing URL, data and method parameters.
 * 
 * @example		conbo.httpRequest("http://www.foo.com/bar", {user:1}, "GET");
 * @example		conbo.httpRequest({url:"http://www.foo.com/bar", data:{user:1}, method:"GET", headers:{'X-Token':'ABC123'}});
 * 
 * @see			http://api.jquery.com/jquery.ajax/
 * @memberof	conbo
 * @param 		{string|object}		urlOrOptions - URL string or Object containing URL and other settings for the HTTP request
 * @param 		{Object}			data - Data to be sent with request (ignored when using options object)
 * @param 		{string}			method - HTTP method to use, e.g. "GET" or "POST" (ignored when using options object)
 * @returns		{Promise}
 */
conbo.httpRequest = function(options)
{
	// Simple mode
	if (conbo.isString(options))
	{
		options = {url:options, data:arguments[1], method:arguments[2]};
	}
	
	if (!conbo.isObject(options) || !options.url)
	{
		throw new Error('httpRequest called without specifying a URL');
	}
	
	return new Promise(function(resolve, reject)
	{
		var xhr = new XMLHttpRequest();
		var aborted;
		var url = options.url;
		var method = (options.method || options.type || "GET").toUpperCase();
		var data = options.data || options.body;
		var headers = options.headers || {};
		var timeoutTimer;
		var contentType = conbo.getValue(headers, "Content-Type", false) || options.contentType || conbo.CONTENT_TYPE_JSON;
		var dataType = options.dataType || conbo.DATA_TYPE_JSON;
		var decodeFunction = options.decodeFunction || options.dataFilter;
		
		var getXml = function()
		{
			if (xhr.responseType === "document") 
			{
				return xhr.responseXML;
			}
			
			var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror";
			
			if (xhr.responseType === "" && !firefoxBugTakenEffect) 
			{
				return xhr.responseXML;
			}
		
			return null;
		};
		
		var getResult = function() 
		{
			// TODO Handle Chrome with requestType=blob throwing errors when testing access to responseText
			var result = xhr.response || xhr.responseText || getXml(xhr);
			
			if (conbo.isFunction(decodeFunction))
			{
				result = decodeFunction(result);
			}
			else
			{
				switch (dataType)
				{
					case conbo.DATA_TYPE_SCRIPT:
					{
						(function() { eval(result); }).call(options.scope || window);
						break;
					}
					
					case conbo.DATA_TYPE_JSON:
					{
						try { result = JSON.parse(result); }
						catch (e) { result = undefined; }
						
						break;
					}
					
					case conbo.DATA_TYPE_TEXT:
					{
						// Nothing to do
						break;
					}
				}
			}
			
			var resultClass = options.resultClass;
			
			if (!resultClass && options.makeObjectsBindable)
			{
				switch (true)
				{
					case conbo.isArray(result):
						resultClass = conbo.List;
						break;
					
					case conbo.isObject(result):
						resultClass = conbo.Hash;
						break;
				}
			}
			
			if (resultClass)
			{
				result = new resultClass({source:result});
			}
			
			return result;
		};

		var getResponseHeaders = function()
		{
			var responseHeaders = xhr.getAllResponseHeaders();
			var newValue = {};
			
			responseHeaders.split('\r\n').forEach(function(header)
			{
				var splitIndex = header.indexOf(':');
				var propName = header.substr(0,splitIndex).trim();
				
				newValue[propName] = header.substr(splitIndex+1).trim();
			});
			
			return newValue;
		};
		
		var errorHandler = function() 
		{
			clearTimeout(timeoutTimer);
			
			var response = 
			{
				fault: getResult(),
				responseHeaders: getResponseHeaders(),
				status: xhr.status,
				method: method,
				url: url,
				xhr: xhr
			};
			
			reject(new conbo.ConboEvent(conbo.ConboEvent.FAULT, response));
		};
		
		// will load the data & process the response in a special response object
		var loadHandler = function() 
		{
			if (aborted) return;
			
			clearTimeout(timeoutTimer);
			
			var status = (xhr.status === 1223 ? 204 : xhr.status);
			
			if (status === 0 || status >= 400)
			{
				errorHandler();
				return;
			}
			
			var response = 
			{
				result: getResult(),
				responseHeaders: getResponseHeaders(),
				status: status,
				method: method,
				url: url,
				xhr: xhr
			};
			
			resolve(new conbo.ConboEvent(conbo.ConboEvent.RESULT, response));
		}
		
		var readyStateChangeHandler = function() 
		{
			if (xhr.readyState === 4) 
			{
				conbo.defer(loadHandler);
			}
		};
		
		if (method !== "GET" && method !== "HEAD") 
		{
			conbo.getValue(headers, "Content-Type", false) || (headers["Content-Type"] = contentType);
			
			if (contentType == conbo.CONTENT_TYPE_JSON && conbo.isObject(data))
			{
				data = JSON.stringify(data);
			}
		}
		else if (method === 'GET' && conbo.isObject(data))
		{
			var query = conbo.toQueryString(data);
			if (query) url += '?'+query;
			data = undefined;
		}
		
		'onload' in xhr
			? xhr.onload = loadHandler // XHR2
			: xhr.onreadystatechange = readyStateChangeHandler; // XHR1 (should never be needed)
		
		xhr.onerror = errorHandler;
		xhr.onprogress = function() {}; // IE9 must have unique onprogress function
		xhr.onabort = function() { aborted = true; };
		xhr.ontimeout = errorHandler;
		
		xhr.open(method, url, true, options.username, options.password);
		xhr.withCredentials = !!options.withCredentials;
		
		// not setting timeout on using XHR because of old webkits not handling that correctly
		// both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
		if (options.timeout > 0) 
		{
			timeoutTimer = setTimeout(function()
			{
				if (aborted) return;
				aborted = true; // IE9 may still call readystatechange
				xhr.abort("timeout");
				errorHandler();
			}, 
			options.timeout);
		}
		
		for (var key in headers)
		{
			if (headers.hasOwnProperty(key))
			{
				xhr.setRequestHeader(key, headers[key]);
			}
		}

		if ("responseType" in options) 
		{
			xhr.responseType = options.responseType;
		}

		if (typeof options.beforeSend === "function") 
		{
			options.beforeSend(xhr);
		}
		
		// Microsoft Edge browser sends "undefined" when send is called with undefined value.
		// XMLHttpRequest spec says to pass null as data to indicate no data
		// See https://github.com/naugtur/xhr/issues/100.
		xhr.send(data || null);

	});		

};
