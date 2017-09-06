/**
 * Remote Hash
 * Used for syncing remote data with a local Hash
 * 
 * @class		RemoteHash
 * @memberof	conbo
 * @augments	conbo.Hash
 * @author 		Neil Rackett
 * @param 		{Object} options - Object containing initialisation options, see Hash
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#RESULT
 * @fires		conbo.ConboEvent#FAULT
 */
conbo.RemoteHash = conbo.Hash.extend(
/** @lends conbo.RemoteHash.prototype */
{
	/**
	 * Constructor
	 * @param {Object}	options		Object containing `source` (initial properties), `rootUrl` and `command` parameters
	 */
	__construct: function(options)
	{
		options = conbo.defineDefaults(options, this.options);
		
		if (!!options.context) this.context = options.context;
		this.preinitialize(options);
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		var resultHandler = function(event)
		{
			conbo.makeBindable(this, conbo.variables(event.result));
			conbo.setValues(this, event.result);
			
			this.dispatchEvent(event);
		};
		
		this._httpService
			.addEventListener(conbo.ConboEvent.RESULT, resultHandler, this)
			.addEventListener(conbo.ConboEvent.FAULT, this.dispatchEvent, this);
		
		__denumerate(this);
		
		conbo.Hash.prototype.__construct.apply(this, arguments);
	},
	
	load: function(data)
	{
		data = arguments.length ? data : this.toJSON();
		this._httpService.call(this._command, data, 'GET');
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
	
}).implement(conbo.ISyncable);

__denumerate(conbo.HttpService.prototype);
