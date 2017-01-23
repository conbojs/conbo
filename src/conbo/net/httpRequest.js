/**
 * HTTP Request
 * 
 * Sends data to and/or loads data from a URL; options object is currently 
 * analogous to the jQuery.ajax() settings object, but also accepts additional
 * `resultClass` and `makeObjectsBindable` parameters
 * 
 * @memberof	conbo
 * @param 		{object} options - Object containing URL and other settings for the HTTP request
 * @see			http://api.jquery.com/jquery.ajax/
 */
conbo.httpRequest = function(options)
{
	// TODO Remove jQuery dependency by implementing this using XHR:
	if (!$)
	{
		throw new Error('conbo.httpRequest requires jQuery');
	}
	
	return new conbo.AsyncToken
	({
		promise: $.ajax(options), 
		resultClass: options.resultClass, 
		makeObjectsBindable: options.makeObjectsBindable
	});

};
