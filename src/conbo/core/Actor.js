conbo.Actor = conbo.Bindable.extend
({
	constructor: function(options)
	{
		this._inject(options);
		this.initialize.apply(this, arguments);
	}
});
