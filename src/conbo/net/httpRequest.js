/**
 * HTTP Request
 * 
 * Sends data to and/or loads data from a URL; options object is roughly 
 * analogous to the jQuery.ajax() settings object, but also accepts additional
 * `resultClass` and `makeObjectsBindable` parameters
 * 
 * @see			http://api.jquery.com/jquery.ajax/
 * @memberof	conbo
 * @param 		{object} options - Object containing URL and other settings for the HTTP request
 * @returns		{conbo.Promise}
 */
conbo.httpRequest = function(options)
{
	if (!options)
	{
		throw new Error('httpRequest called without any parameters');
	}
	
	var promise = new conbo.Promise();
	var xhr = new window.XMLHttpRequest();
	var aborted;
	var url = options.url;
	var method = (options.method || options.type || "GET").toUpperCase();
	var data = options.data || options.body;
	var headers = options.headers || {};
	var timeoutTimer;
	var contentType = conbo.getValue(headers, "Content-Type", false) || options.contentType || conbo.CONTENT_TYPE_JSON;
	var dataType = options.dataType || 'json';
	var decodeFunction = options.decodeFunction || options.dataFilter;
	
	var called = false;
	var callback = function(err, response, body)
	{
		if (!called)
		{
			called = true;
			options.callback(err, response, body);
		}
	}
	
	var readyStateChangeHandler = function() 
	{
		if (xhr.readyState === 4) 
		{
			conbo.defer(loadHandler);
		}
	};

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
				// TODO Do we need HTML support?
//				case 'html':
//				{
//					var el;
//					var div = document.createElement("div");
//					var fragment = document.createDocumentFragment();
//					
//					div.innerHTML = result;
//					
//					while (el = div.firstChild)
//					{
//						fragment.appendChild(el);
//					}
//					
//					result = fragment;
//					
//					break;
//				}
				
				// TODO Implement JSONP support?
//				case 'jsonp':
				
				// TODO Does this work?
				case 'script':
				{
					(function() { eval(result); }).call(window);
					break;
				}
				
				case 'json':
				{
					try { result = JSON.parse(result); }
					catch (e) { result = undefined; }
					
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
	
	var errorHandler = function(event) 
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
		
		promise.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.FAULT, response));
	};
	
	// will load the data & process the response in a special response object
	var loadHandler = function(event) 
	{
		if (aborted) return;
		
		clearTimeout(timeoutTimer);
		
		var status = (xhr.status === 1223 ? 204 : xhr.status);
		
		if (status === 0 || status >= 400)
		{
			errorHandler(event);
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
		
		promise.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.RESULT, response));
	}
	
//	if (dataType == 'json' && !conbo.getValue(headers, "Accept", false)) 
//	{
//		 headers["Accept"] = conbo.CONTENT_TYPE_JSON;
//	}
	
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
	
	xhr.onreadystatechange = readyStateChangeHandler;
	xhr.onload = loadHandler;
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
			var e = new Error("XMLHttpRequest timeout");
			e.code = "ETIMEDOUT";
			
			errorHandler(e);
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
	
	return promise;
};
