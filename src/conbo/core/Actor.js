/**
 * Actor
 * 
 * Suggested base class for web services to be included as singletons 
 * in your Context, using mapSingleton(...)
 * 
 * @author		Neil Rackett
 */
conbo.Actor = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this._inject(options);
		this.initialize.apply(this, arguments);
	}
});
