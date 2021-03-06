/*
 * Advanced data binding example for ConboJS, using ES2015 syntax and class import
 * @author	Neil Rackett
 */

let ns = conbo();

/**
 * Switch conbo.Hash (available in Core build) for conbo.RemoveHash (requires 
 * Complete build) if you need web services
 */
// import MyModel from './model/MyModel'
class MyModel extends conbo.Hash
{
	/**
	 * You can't declare data properties in ES2015 classes, so you should
	 * declare them using the `declarations` method or user a get/set accessor
	 */
	declarations()
	{
		this.name = 'Conbo';
	}
}

// import MyContext from './core/Context'
class MyContext extends conbo.Context
{
	/**
	 * Entry point
	 */
	initialize()
	{
		this.mapSingleton('myModel', MyModel);
	}
}

// import InputView from './view/InputView'
class InputView extends conbo.View
{
	get tagName()
	{
		return 'p';
	}
	
	/**
	 * cb-bind is Conbo's simplest form of data binding, automatically
	 * detecting the best way to bind your data to the element
	 */
	get template()
	{
		return 'My name is <input type="text" cb-bind="myModel.name" />';
	}
	
	/**
	 * Properties with a value of undefined that have been mapped to 
	 * singletons in the context are automatically injected
	 */
	declarations()
	{
		this.myModel = undefined;
	}
}

// import OutputView from './view/OutputView'
class OutputView extends conbo.View
{
	get tagName()
	{
		return 'h1';
	}
	
	/**
	 * cb-bind is Conbo's simplest form of data binding, automatically
	 * detecting the best way to bind your data to the element
	 */
	get template()
	{
		return 'Hello <span cb-bind="myModel.name" />!';
	}
	
	/**
	 * Properties with a value of undefined that have been mapped to 
	 * singletons in the context are automatically injected
	 */
	declarations()
	{
		this.myModel = undefined;
	}
}

// import MyApp from './MyApp'
class MyApp extends conbo.Application
{
	get namespace()
	{
		return ns;
	}
	
	/**
	 * Application will automatically use an instance of this class as 
	 * the application's context (event bus); uses vanilla conbo.Context
	 * if not specified
	 */
	get contextClass()
	{
		return MyContext;
	}
	
	/**
	 * Entry point
	 */
	initialize()
	{
		this.appendView
		(
			new OutputView(this.context.addTo()),
			new InputView(this.context.addTo()) 
		);
	}
}

// Import Application and View classes into your namespace to enable auto binding and instantiation 
ns.import({ MyApp, InputView, OutputView });
