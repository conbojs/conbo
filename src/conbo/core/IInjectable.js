/**
 * Partial class that enables the ConboJS framework to add the application
 * specific Context class instance and inject specified dependencies 
 * (properties of undefined value which match registered singletons); should
 * be used via the Class.implement method
 * 
 * @memberof	conbo
 * @example		var C = conbo.Class.extend().implement(conbo.IInjectable);
 * @example		conbo.defineValues(classInstance, conbo.IInjectable);
 * @author		Neil Rackett
 */
conbo.IInjectable =
{
	/**
	 * The current class instance's context
	 * @type	{conbo.Context}
	 */
	get context()
	{
		return this.__context;
	},
	
	set context(value)
	{
		if (value == this.__context) return;
		
		if (value instanceof conbo.Context) 
		{
			value.inject(this);
		}
		
		this.__context = value;
		
		__denumerate(this, '__context');
	}
	
};
