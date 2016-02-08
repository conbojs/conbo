/**
 * Injectable
 * 
 * Partial class that enables the Conbo.js framework to add the Context class 
 * to inject specified dependencies (properties of undefined value which match 
 * registered singletons); should be used via the Class.implement method
 * 
 * @augments	conbo
 * @example		var C = conbo.Class.extend().implement(conbo.IInjectable);
 * @author		Neil Rackett
 */
conbo.IInjectable =
{
	get context()
	{
		return this.__context;
	},
	
	set context(value)
	{
		if (value == this.__context) return;
		
		if (value instanceof conbo.Context) 
		{
			value.injectSingletons(this);
		}
		
		this.__context = value;
		
		__denumerate(this, '__context');
	}
};
