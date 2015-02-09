/**
 * Remote Hash
 * Used for syncing remote data with a local Hash
 * @author Neil Rackett
 */
conbo.RemoteHash = conbo.Hash.extend
({
	/**
	 * Constructor
	 * @param {Object}	source		Object containing initial properties
	 * @param {Object}	options		Object containing 'rootUrl' and 'command' parameters
	 */
	constructor: function(source, options)
	{
		options = conbo.defaults({}, options, this.options);
		
		this.context = options.context;
		this.preinitialize(source, options);
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		var resultHandler = function(event)
		{
			conbo.makeAllBindable(this, conbo.properties(event.result));
			conbo.setValues(this, event.result);
			
			this.dispatchEvent(event);
		};
		
		this._httpService
			.addEventListener('result', resultHandler, this)
			.addEventListener('fault', this.dispatchEvent, this);
		
		_denumerate(this);
		
		conbo.Hash.prototype.constructor.apply(this, arguments);
	},
	
	load: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'GET');
		return this;
	},
	
	save: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'POST');
		return this;
	},
	
	destroy: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'DELETE');
		return this;
	},
	
	toString: function()
	{
		return 'conbo.RemoteHash';
	}
	
}).implement(conbo.ISyncable, conbo.IPreinitialize);

_denumerate(conbo.HttpService.prototype);
