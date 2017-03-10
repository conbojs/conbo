/**
 * Default history manager used by Router, implemented using onhashchange 
 * event and hash-bang URL fragments
 * 
 * @author 		Neil Rackett
 */
conbo.History = conbo.EventDispatcher.extend(
/** @lends conbo.History.prototype */
{
	__construct: function(options)
	{
		this.handlers = [];
		this.location = window.location;
		this.history = window.history;
		
		this.bindAll('__checkUrl');
	},
	
	start: function(options)
	{
		window.addEventListener('hashchange', this.__checkUrl);
		
		this.fragment = this.__getFragment();
		this.__loadUrl();
		
		return this;
	},
	
	stop: function()
	{
		window.removeEventListener('hashchange', this.__checkUrl);
		return this;
	},
	
	addRoute: function(route, callback)
	{
		this.handlers.unshift({route:route, callback:callback});
		return this;
	},
	
	/**
	 * The current path
	 * @returns	{string}
	 */
	getPath: function()
	{
		// Workaround for bug in Firefox where location.hash will always be decoded
		var match = this.location.href.match(/#!?(.*)$/);
		return match ? match[1] : '';
	},
	
	/**
	 * Set the current path
	 * 
	 * @param	{string}	path - The path
	 * @param	{}
	 */
	setPath: function(fragment, options)
	{
		options || (options = {});
		fragment = this.__getFragment(fragment);
		
		if (this.fragment === fragment) 
		{
			return;
		}
		
		var location = this.location;
		
		this.fragment = fragment;
		
		if (options.replace)
		{
			var href = location.href.replace(/(javascript:|#).*$/, '');
			location.replace(href + '#!/' + fragment);
		}
		else
		{
			location.hash = '#!/' + fragment;
		}
		
		if (options.trigger) 
		{
			this.__loadUrl(fragment);
		}
		
		return this;
	},
	
	/**
	 * @private
	 */
	__checkUrl: function(event)
	{
		var changed = this.__getFragment() !== this.fragment;
		
		if (changed)
		{
			this.__loadUrl();
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
		}
		
		return !changed;
	},
	
	/**
	 * Get the cross-browser normalized URL fragment, either from the URL, the hash, or the override.
	 * @private
	 */
	__getFragment: function(fragment)
	{
		return (fragment || this.getPath()).replace(/^#!|^[#\/]|\s+$/g, '');
	},
	
	/**
	 * Attempt to load the current URL fragment
	 * @private
	 * @returns 	{boolean}	Whether or not the path is a valid route
	 */
	__loadUrl: function(fragmentOverride)
	{
		var fragment = this.fragment = this.__getFragment(fragmentOverride);
		
		var matched = conbo.some(this.handlers, function(handler)
		{
			if (handler.route.test(fragment))
			{
				handler.callback(fragment);
				return true;
			}
		});
		
		if (!matched)
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.FAULT));
		}
		
		return matched;
	},
	
});
