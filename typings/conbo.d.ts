export as namespace conbo;
export = conbo;

/**
 * Create or access a ConboJS namespace
 * @param		{string}	namespace - The selected namespace
 * @param		{...any}	[globals] - Globals to minify followed by function to execute, with each of the globals as parameters
 * @returns		{conbo.Namespace}
 * @example
 * // Conbo can replace the standard minification pattern with modular namespace definitions
 * // If an Object is returned, its contents will be added to the namespace
 * conbo('com.example.namespace', window, document, conbo, function(window, document, conbo, undefined)
 * {
 *  // The executed function is scoped to the namespace
 * 	var ns = this;
 * 	// ... Your code here ...
 * 	// Optionally, return an Object containing values to be added to the namespace
 *  return { MyApp, MyView };
 * });
 * @example
 * // Retrieve a namespace and import classes defined elsewhere
 * var ns = conbo('com.example.namespace');
 * ns.import({ MyApp, MyView });
 */
declare function conbo(namespace: string, ...globals: any[]):conbo.Namespace;

declare namespace conbo 
{	
	/**
	 * Base class from which all others extend
	 * @param 		{Object} options - Object containing initialisation options
	 */
	class Class
	{
		/**
		 * Extend this class to create a new class
		 * 
		 * @memberof 	conbo.Class
		 * @param		{Object}	[protoProps] - Object containing the new class's prototype
		 * @param		{Object}	[staticProps] - Object containing the new class's static methods and properties
		 * 
		 * @example		
		 * var MyClass = conbo.Class.extend
		 * ({
		 * 	doSomething:function()
		 * 	{ 
		 * 		console.log(':-)'); 
		 * 	}
		 * });
		 */
		static extend(protoProps?:any, staticProps?:any):any;

		/**
		 * Implements the specified pseudo-interface(s) on the class, copying 
		 * the default methods or properties from the partial(s) if they have 
		 * not already been implemented.
		 * 
		 * .Class
		 * @param		{...Object} interface - Object containing one or more properties or methods to be implemented (an unlimited number of parameters can be passed)
		 * 
		 * @example
		 * var MyClass = conbo.Class.extend().implement(conbo.IInjectable);
		 */
		static implement(...interfaces:any[]):any;
		
		/**
		 * Declarations is used to declare instance properties used by this class
		 * @returns		{void}
		 */
		protected declarations(...args:any[]):void;

		/**
		 * Preinitialize is called before any code in the constructor has been run
		 * @returns		{void}
		 */
		protected preinitialize(...args:any[]):void;

		/**
		 * Initialize (entry point) is called immediately after the constructor has completed
		 */
		protected initialize(...args:any[]):void;

		/**
		 * Clean everything up ready for garbage collection (you should override in your own classes)
		 * @returns		{void}
		 */
		public destroy():void;

		/**
		 * Scope all methods of this class instance to this class instance
		 */
		public bindAll(...methodNames:string[]):this;

		/**
		 * String representation of the current class
		 */
		public toString():string;
	}

	/**
	 * Conbo class
	 * Base class for most Conbo framework classes that calls preinitialize before
	 * the constructor and initialize afterwards, populating the options parameter
	 * with an empty Object if no parameter is passed and automatically making all
	 * properties bindable.
	 * @class		ConboClass
	 * 
	 * @augments	conbo.Class
	 * @author		Neil Rackett
	 * @param 		{Object}	options - Class configuration object
	 */
	class ConboClass extends Class {

		constructor(options?: any);

		/**
		 * Declarations is used to declare instance properties used by this class
		 * @override
		 * @returns		{void}
		 */
		protected declarations(options?: any):void;

		/**
		 * Preinitialize is called before any code in the constructor has been run
		 * @override
		 * @returns		{void}
		 */
		protected preinitialize(options?: any):void;

		/**
		 * Initialize (entry point) is called immediately after the constructor has completed
		 * @override
		 * @returns		{void}
		 */
		protected initialize(options?: any):void;
	}

	/**
	 * Conbo namespaces enable you to create modular, encapsulated code, similar to
	 * how you might use packages in languages like Java or ActionScript.
	 * By default, namespaces will automatically call initDom() when the HTML page
	 * has finished loading.
	 */
	class Namespace extends Class {

		[key:number]:any;
		[key:string]:any;
		
		/**
		 * Search the DOM and initialize Applications contained in this namespace
		 * @param 	{Element} 	[rootEl] - The root element to initialize
		 * @returns {this}
		 */
		initDom(rootEl?: any):this;

		/**
		 * Watch the DOM and automatically initialize Applications contained in
		 * this namespace when an element with the appropriate cb-app attribute
		 * is added.
		 * @param 	{Element} 	[rootEl] - The root element to initialize
		 * @returns {this}
		 */
		observeDom(rootEl?: any):this;

		/**
		 * Stop watching the DOM for Applications
		 * @param 	{Element} 	[rootEl] - The root element to initialize
		 * @returns {this}
		 */
		unobserveDom(rootEl?: any):this;

		/**
		 * Add classes, properties or methods to the namespace. Using this method
		 * will not overwrite existing items of the same name.
		 * @param 	{Object}			obj - An object containing items to add to the namespace
		 * @returns	{conbo.Namespace}	This Namespace instance
		 */
		import(obj: any):this;

	}

	/**
	 * Base class for all events triggered in ConboJS
	 * @author		Neil Rackett
	 * @param 		{string}	type - The type of event this object represents
	 */
	class Event extends Class 
	{
		/** 
		 * Special event used to listed for all event types 
		 * 
		 * @event			conbo.ConboEvent#ALL
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly ALL:string;

		/**
		 * Event type
		 */
		type:string;

		/**
		 * Event related data
		 */
		data:any;
		
		/**
		 * Has the default action been prevented?
		 */
		defaultPrevented:boolean;

		/**
		 * Has propogation been stopped?
		 */
		cancelBubble:boolean;

		/**
		 * Has immediate propogation been stopped?
		 */
		immediatePropagationStopped:boolean;

		/**
		 * Constructor: DO NOT override! (Use initialize instead)
		 * @param 	{string} type - The type of event this class instance represents
		 * @param 	{any} [data] - Data to store in the event's data property
		 */
		constructor(type: string, data?: any);

		/**
		 * Initialize (entry point)
		 * @param 	{string} type - The type of event this class instance represents
		 * @param 	{any} [data] - Data to store in the event's data property
		 */
		protected initialize(type: string, data?: any):void;

		/**
		 * Create an identical clone of this event
		 * @returns 	{conbo.Event}	A clone of this event
		 */
		clone():this;

		/**
		 * Prevent whatever the default framework action for this event is
		 * @returns	{conbo.Event}	A reference to this event instance
		 */
		preventDefault():this;

		/**
		 * Not currently used
		 * @returns	{conbo.Event}	A reference to this event instance
		 */
		stopPropagation():this;

		/**
		 * Keep the rest of the handlers from being executed
		 * @returns	{conbo.Event}	A reference to this event
		 */
		stopImmediatePropagation():this;

	}

	/**
	 * Default event class for events fired by ConboJS
	 * For consistency, callback parameters of Backbone.js derived classes
	 * are event object properties in ConboJS
	 * @author		Neil Rackett
	 * @param 		{string}	type - The type of event this object represents
	 * @param 		{Object}	options - Properties to be added to this event object
	 */
	class ConboEvent extends Event 
	{
		[key:number]:any;
		[key:string]:any;
		
		/** 
		 * Special event used to listed for all event types 
		 * 
		 * @event			conbo.ConboEvent#ALL
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly ALL:string;

		/**
		 * Something has changed (also 'change:[name]')
		 * 
		 * @event			conbo.ConboEvent#CHANGE
		 * @type 			{conbo.ConboEvent}
		 * @property		{string} property - The name of the property that changed
		 * @property		{any} value - The new value of the property
		 */
		static readonly CHANGE:string;
		
		/** 
		 * Something was added
		 * 
		 * @event			conbo.ConboEvent#ADD
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly ADD:string; 				

		/**
		 * Something was removed
		 * 
		 * @event			conbo.ConboEvent#REMOVE
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly REMOVE:string;

		/**
		 * The route has changed (also 'route:[name]')
		 * 
		 * @event			conbo.ConboEvent#ROUTE
		 * @type 			{conbo.ConboEvent}
		 * @property		{conbo.Router}	router - The router that handled the route change
		 * @property		{RegExp} 		route - The route that was followed
		 * @property		{string} 		name - The name assigned to the route
		 * @property		{any[]} 		parameters - The parameters extracted from the route
		 * @property		{string} 		path - The new path 
		 */
		static readonly ROUTE:string; 			

		/** 
		 * Something has started
		 * 
		 * @event			conbo.ConboEvent#START
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly START:string;

		/**
		 * Something has stopped
		 * 
		 * @event			conbo.ConboEvent#STOP
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly STOP:string;
		
		/**
		 * A template is ready to use
		 * 
		 * @event			conbo.ConboEvent#TEMPLATE_COMPLETE
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly TEMPLATE_COMPLETE:string;

		/** 
		 * A template error has occurred
		 *  
		 * @event			conbo.ConboEvent#TEMPLATE_ERROR
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly TEMPLATE_ERROR:string;

		/** 
		 * Something has been bound
		 *  
		 * @event			conbo.ConboEvent#BIND
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly BIND:string;

		/** 
		 * Something has been unbound
		 *  
		 * @event			conbo.ConboEvent#UNBIND
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly UNBIND:string;			

		/** 
		 * Something has been created and it's ready to use
		 * 
		 * @event			conbo.ConboEvent#CREATION_COMPLETE
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly CREATION_COMPLETE:string;
		
		/** 
		 * Something has been detached
		 * 
		 * @event			conbo.ConboEvent#DETACH
		 * @type 			{conbo.ConboEvent}
		 */
		static readonly DETACH:string;
		
		/** 
		 * A result has been received
		 *  
		 * @event			conbo.ConboEvent#RESULT
		 * @type 			{conbo.ConboEvent}
		 * @property		{any} result - The data received 
		 */
		static readonly RESULT:string;
		
		/** 
		 * A fault has occurred
		 *  
		 * @event			conbo.ConboEvent#FAULT
		 * @type 			{conbo.ConboEvent}
		 * @property		{any} fault - The fault received 
		 */
		static readonly FAULT:string;			

		/**
		 * The name of the property that changed
		 */
		property:string;
		
		/**
		 * The new value of the property
		 */
		value:any; 
		
		/**
		 * The router that handled the route change
		 */
		router:Router;
		
		/**
		 * The route that was followed
		 */
		route:RegExp; 
		
		/**
		 * The name assigned to the route
		 */
		name:string; 
		
		/**
		 * The parameters extracted from the route as an array
		 */
		parameters:any[];
		
		/**
		 * The parameters extracted from the route as an object
		 */
		params:any;
		
		/**
		 * The new path
		 */
		path:string; 
		
		/**
		 * The data or result received
		 */
		result:any; 
		
		/**
		 * The fault received
		 */
		fault:any; 
		
		/**
		 * Array of nodes added or removed from the DOM
		 */
		nodes:Node[];
		
		/**
		 * Object containing all response headers received from the call
		 */
		responseHeaders:any;
		
		/**
		 * HTTP status code
		 */
		status:number;
		
		/**
		 * The HTTP verb used when making the call
		 */
		method:string;
		
		/**
		 * The URL called
		 */
		url:string;
		
		/**
		 * XMLHttpRequest instance used to make the call
		 */
		xhr:XMLHttpRequest;
		
		/**
		 * The item affected by the operation
		 */
		item:any;
		
		/**
		 * Constructor
		 * @param	{string}	type - The type of event this class instance represents
		 * @param	{Object}	[options] - Object containing additional properties to add to this class instance
		 */
		constructor(type: string, options?: any);

	}

	interface IInjectable 
	{
		context: Context;
	}

	/**
	 * Event Dispatcher
	 * Event model designed to bring events into line with DOM events and those
	 * found in HTML DOM, jQuery and ActionScript 2 & 3, offering a more
	 * predictable, object based approach to event dispatching and handling
	 * Should be used as the base class for any class that won't be used for
	 * data binding
	 */
	class EventDispatcher extends Class implements IInjectable {

		/**
		 * This is your application's event bus and dependency injector
		 */
		context: Context;

		/**
		 * Constructor
		 * @param 		{Object} options - Object containing optional initialisation options, including 'context'
		 */
		constructor(options?: any);

		/**
		 * Add a listener for a particular event type
		 * @param 	{string}	type - Type of event ('change') or events ('change blur')
		 * @param 	{Function}	handler - Function that should be called
		 * @param 	{Object}	[scope] - The scope in which to run the event handler
		 * @param 	{number}	[priority=0] - The event handler's priority when the event is dispatached
		 * @param 	{boolean}	[once=false] - Should the event listener automatically be removed after it has been called once?
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance
		 */
		addEventListener(type: string, handler: any, scope?: any, priority?: number, once?: boolean):this;

		/**
		 * Remove a listener for a particular event type
		 * @param 	{string}	[type] - Type of event ('change') or events ('change blur'), if not specified, all listeners will be removed
		 * @param 	{Function}	[handler] - Function that should be called, if not specified, all listeners of the specified type will be removed
		 * @param 	{Object} 	[scope] - The scope in which the handler is set to run
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance
		 */
		removeEventListener(type?: string, handler?: any, scope?: any):this;

		/**
		 * Does this object have an event listener of the specified type?
		 * @param 	{string}	type - Type of event (e.g. 'change')
		 * @param 	{Function}	[handler] - Function that should be called
		 * @param 	{Object} 	[scope] - The scope in which the handler is set to run
		 * @returns	{boolean}	True if this object has the specified event listener, false if it does not
		 */
		hasEventListener(type: string, handler?: any, scope?: any):boolean;

		/**
		 * Dispatch the event to listeners
		 * @param	{conbo.Event} 	event - The event to dispatch
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance
		 */
		dispatchEvent(event: Event):this;

		/**
		 * Dispatch a change event for one or more changed properties
		 * @param	{string}	propName - The name of the property that has changed
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance
		 */
		dispatchChange(...propName: string[]):this;

	}

	/**
	 * Event Proxy
	 * Standardises the adding and removing of event listeners across DOM elements,
	 * Conbo EventDispatchers and jQuery instances
	 */
	class EventProxy extends Class {

		/**
		 * @param 		{Object} eventDispatcher - Element, EventDispatcher or jQuery object to be proxied
		 */
		constructor(eventDispatcher: any);

		/**
		 * Add a listener for a particular event type
		 * @param 	{string}			type - Type of event ('change') or events ('change blur')
		 * @param 	{Function}			handler - Function that should be called
		 * @returns	{conbo.EventProxy}	A reference to this class instance
		 */
		addEventListener(type: string, handler: any):this;

		/**
		 * Remove a listener for a particular event type
		 * @param 	{string}			type - Type of event ('change') or events ('change blur')
		 * @param 	{Function}			handler - Function that should be called
		 * @returns	{conbo.EventProxy}	A reference to this class instance
		 */
		removeEventListener(type: string, handler: any):this;

	}

	/**
	 * Headless Application
	 * Base class for applications that don't require DOM, e.g. Node.js
	 */
	class HeadlessApplication extends EventDispatcher {

		/**
		 * Default context class to use
		 * You'll normally want to override this with your own
		 */
		contextClass:any;
	}

	/**
	 * conbo.Context
	 * This is your application's event bus and dependency injector, and is
	 * usually where all your models and web service classes are registered,
	 * using mapSingleton(...), and Command classes are mapped to events
	 */
	class Context extends EventDispatcher {

		/**
		 * @param 	{Object} options - Object containing initialisation options, including 'app' (Application) and 'namespace' (Namespace)
		 */
		constructor(options?: any);

		/**
		 * The Application instance associated with this context
		 * @returns {conbo.Application}
		 */
		app: Application;

		/**
		 * The Namespace this context exists in
		 * @returns {conbo.Namespace}
		 */
		namespace: Namespace;

		/**
		 * If this is a subcontext, this is a reference to the Context that created it
		 * @returns {conbo.Context}
		 */
		parentContext: Context;

		/**
		 * Create a new subcontext that shares the same application
		 * and namespace as this one
		 *
		 * @param	{any} 		[contextClass] - The context class to use (default: conbo.Context)
		 * @param	{boolean}	[cloneSingletons] - Should this Context's singletons be duplicated on the new subcontext? (default: false)
		 * @param	{boolean}	[cloneCommands] - Should this Context's commands be duplicated on the new subcontext? (default: false)
		 * @returns {conbo.Context}
		 */
		createSubcontext(contextClass?:any, cloneSingletons?:boolean, cloneCommands?:boolean):Context;

		/**
		 * Map specified Command class the given event
		 * @param	{string}	eventType - The name of the event
		 * @param	{class}		commandClass - The command class to instantiate when the event is dispatched
		 */
		mapCommand(eventType:string, commandClass:any):this;

		/**
		 * Unmap specified Command class from given event
		 */
		unmapCommand(eventType:string, commandClass:any):this;

		/**
		 * Map class instance to a property name
		 *
		 * To inject a property into a class, register the property name
		 * with the Context and declare the value as undefined in your class
		 * to enable it to be injected at run time
		 *
		 * @example		context.mapSingleton('myProperty', MyModel);
		 * @example		myProperty: undefined
		 */
		mapSingleton(propertyName:String, singletonClass:any, ...args:any[]):this;

		/**
		 * Unmap class instance from a property name
		 */
		unmapSingleton(propertyName:string):this;

		/**
		 * Map constant value to a property name
		 *
		 * To inject a constant into a class, register the property name
		 * with the Context and declare the property as undefined in your
		 * class to enable it to be injected at run time
		 *
		 * @example		context.mapConstant('MY_VALUE', 123);
		 * @example		MY_VALUE: undefined
		 */
		mapConstant(propertyName:string, value:any):this;

		/**
		 * Unmap constant value from a property name
		 */
		unmapConstant(propertyName:string):this;

		/**
		 * Add this Context to the specified Object, or create an object with a
		 * reference to this Context
		 */
		addTo(obj?:any):any;

		/**
		 * Inject singleton instances into specified object
		 *
		 * @param	obj		{Object} 	The object to inject singletons into
		 */
		injectSingletons(obj:any):this;

		/**
		 * Set all singleton instances on the specified object to undefined
		 *
		 * @param	obj		{Object} 	The object to remove singletons from
		 */
		uninjectSingletons(obj:any):this;

		/**
		 * Clears all commands and singletons, and removes all listeners
		 */
		destroy():this;
	}

	/**
	 * conbo.Hash
	 * A Hash is a bindable object of associated keys and values
	 * @class		Hash
	 * 
	 * @augments	conbo.EventDispatcher
	 * @author 		Neil Rackett
	 * @param 		{Object} options - Object containing optional initialisation options, including 'source' (object) containing initial values
	 * @fires		conbo.ConboEvent#CHANGE
	 */
	class Hash extends EventDispatcher 
	{
		/**
		 * @param {any} [options] - Object containing initialization options, including 'source' object
		 */
		constructor(options?: any);

		/**
		 * Returns a version of this object that can easily be converted into JSON
		 */
		toJSON():any;
	}

	/**
	 * A persistent Hash that stores data in LocalStorage or Session
	 * @class		LocalHash
	 * 
	 * @augments	conbo.Hash
	 * @author 		Neil Rackett
	 * @param 		{Object} options - Object containing initialisation options, including 'name' (string), 'session' (Boolean) and 'source' (object) containing default values; see Hash for other options
	 * @fires		conbo.ConboEvent#CHANGE
	 */
	class LocalHash extends Hash {

		/**
		 * Immediately writes all data to local storage. If you don't use this method,
		 * Conbo writes the data the next time it detects a change to a bindable property.
		 */
		flush():this;
	}

	interface ISyncable
	{
		load(data?:any):this;
		save():this;
		destroy():this;
	}
	
	/**
	 * Remote Hash is used for syncing remote data with a local Hash
	 * @fires		conbo.ConboEvent#CHANGE
	 * @fires		conbo.ConboEvent#RESULT
	 * @fires		conbo.ConboEvent#FAULT
	 */
	class RemoteHash extends Hash implements ISyncable
	{
		load(data?:any):this;
		save():this;
		destroy():this;
	}

	/**
	 * A bindable Array wrapper that can be used when you don't require
	 * web service connectivity.
	 * Plain objects will automatically be converted into an instance of
	 * the specified `itemClass` when added to a List, and the appropriate
	 * events dispatched if the items it contains are changed or updated.
	 * @fires		conbo.ConboEvent#CHANGE
	 * @fires		conbo.ConboEvent#ADD
	 * @fires		conbo.ConboEvent#REMOVE
	 */
	class List extends EventDispatcher 
	{
		[key:number]:any;

		/**
		 * @param 		{Object} options - Object containing optional initialisation options, including `source` (array), `context` (Context) and `itemClass` (Class)
		 */
		constructor(options?:any);
		
		/**
		 * The Array used as the source for this List
		 */
		source: any[];
		
		/**
		 * The class to use for items in this list (plain JS objects will
		 * automatically be wrapped using this class), defaults to conbo.Hash
		 */
		itemClass:any;
		
		/**
		 * The number of items in the List
		 */
		readonly length:number;
		
		/**
		 * Add an item to the end of the collection.
		 */
		push(...items:any[]):number;
		
		/**
		 * Remove an item from the end of the collection.
		 */
		pop():any;
		
		/**
		 * Add an item to the beginning of the collection.
		 */
		unshift(...items:any[]):number;
		
		/**
		 * Remove an item from the beginning of the collection.
		 */
		shift():any;
		
		/**
		 * Slice out a sub-array of items from the collection.
		 */
		slice(begin?:number, length?:number):List;
		
		
		/**
		 * Splice out a sub-array of items from the collection.
		 */
		splice(begin?:number, length?:number):List;
		
		/**
		 * Get the item at the given index; similar to array[index]
		 */
		getItemAt(index:number):any; 
		
		/**
		 * Add (or replace) item at given index with the one specified,
		 * similar to array[index] = value;
		 */
		setItemAt(index:number, item:any):any;
		
		/**
		 * Force the collection to re-sort itself.
		 * @param	{Function}	[compareFunction] - Compare function to determine sort order
		 */
		sort(compareFunction?:Function):List; 
		
		/**
		 * Create a new List identical to this one.
		 */
		clone():List; 
		
		/**
		 * The JSON-friendly representation of the List
		 */
		toJSON():Object; 
		
		forEach(...args:any[]):any;
		map(...args:any[]):any;
		find(...args:any[]):any;
		findIndex(...args:any[]):any;
		filter(...args:any[]):any;
		reject(...args:any[]):any;
		every(...args:any[]):any;
		contains(...args:any[]):any;
		invoke(...args:any[]):any;
		indexOf(...args:any[]):any;
		lastIndexOf(...args:any[]):any;
		max(...args:any[]):any;
		min(...args:any[]):any;
		toArray(...args:any[]):any;
		size(...args:any[]):any;
		rest(...args:any[]):any;
		last(...args:any[]):any;
		without(...args:any[]):any;
		shuffle(...args:any[]):any;
		isEmpty(...args:any[]):any;
		sortOn(...args:any[]):any;    	
	}

	/**
	 * LocalList is a persistent List class that is saved into LocalStorage
	 * or SessionStorage
	 * @fires		conbo.ConboEvent#CHANGE
	 * @fires		conbo.ConboEvent#ADD
	 * @fires		conbo.ConboEvent#REMOVE
	 */
	class LocalList extends List
	{
		/**
		 * @param 		{Object} options - Object containing initialisation options, including 'name' (String), 'session' (Boolean) and 'source' (Array) of default options
		 */
		constructor(options?: any);

		/**
		 * Immediately writes all data to local storage. If you don't use this method,
		 * Conbo writes the data the next time it detects a change to a bindable property.
		 */
		flush():this;
	}

	/**
	 * Remote List is used for syncing remote array data with a local List
	 * @fires		conbo.ConboEvent#CHANGE
	 * @fires		conbo.ConboEvent#ADD
	 * @fires		conbo.ConboEvent#REMOVE
	 * @fires		conbo.ConboEvent#RESULT
	 * @fires		conbo.ConboEvent#FAULT
	 */
	class RemoteList extends List 
	{
		load(data?:any):this;
		save():this;
		destroy():this;

		/**
		 * @param 		{Object} options - Object containing initialisation options, including HttpService options
		 */
		constructor(options?: any);
	}

	/**
	 * Attribute Bindings
	 * Functions that can be used to bind DOM elements to properties of Bindable
	 * class instances to DOM elements via their attributes.
	 */
	class AttributeBindings extends Class {
		/**
		 * Can the given attribute be bound to multiple properties at the same time?
		 * @param 	{string}	attribute
		 * @returns {Boolean}
		 */
		canHandleMultiple(attribute: string):boolean;

		/**
		 * Makes an element visible
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-show="propertyName"></div>
		 */
		cbShow(el: HTMLElement, value: any):void;

		/**
		 * Hides an element by making it invisible, but does not remove
		 * if from the layout of the page, meaning a blank space will remain
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-hide="propertyName"></div>
		 */
		cbHide(el: HTMLElement, value: any):void;

		/**
		 * Include an element on the screen and in the layout of the page
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-include="propertyName"></div>
		 */
		cbInclude(el: HTMLElement, value: any):void;

		/**
		 * Remove an element from the screen and prevent it having an effect
		 * on the layout of the page
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-exclude="propertyName"></div>
		 */
		cbExclude(el: HTMLElement, value: any):void;

		/**
		 * The exact opposite of HTML's built-in `disabled` property
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-enabled="propertyName"></div>
		 */
		cbEnabled(el: HTMLElement, value: any):void;

		/**
		 * Inserts raw HTML into the element, which is rendered as HTML
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-html="propertyName"></div>
		 */
		cbHtml(el: HTMLElement, value: any):void;

		/**
		 * Inserts text into the element so that it appears on screen exactly as
		 * it's written by converting special characters (<, >, &, etc) into HTML
		 * entities before rendering them, e.g. "8 < 10" becomes "8 &lt; 10", and
		 * line breaks into <br/>
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-text="propertyName"></div>
		 */
		cbText(el: HTMLElement, value: any):void;

		/**
		 * Applies or removes a CSS class to or from the element based on the value
		 * of the bound property, e.g. cb-class="myProperty:class-name"
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-class="propertyName:my-class-name"></div>
		 */
		cbClass(el: HTMLElement, value: any):void;

		/**
		 * Applies class(es) to the element based on the value contained in a variable.
		 * Experimental.
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-classes="propertyName"></div>
		 */
		cbClasses(el: HTMLElement, value: any):void;

		/**
		 * Apply styles from a variable
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @param 		{Object} 		options - Options relating to this binding
		 * @param 		{string} 		styleName - The name of the style to bind
		 * @returns		{void}
		 * @example
		 * <div cb-="propertyName:font-weight"></div>
		 */
		cbStyle(el: HTMLElement, value: any, options: any, styleName: string):void;

		/**
		 * Repeats the element once for each item of the specified list or Array,
		 * applying the specified Glimpse or View class to the element and passing
		 * each value to the item renderer as a "data" property.
		 * The optional item renderer class can be specified by following the
		 * property name with a colon and the class name or by using the tag name.
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @param 		{Object} 		options - Options relating to this binding
		 * @param 		{string} 		itemRendererClassName - The name of the class to apply to each item rendered
		 * @returns		{void}
		 * @example
		 * <li cb-repeat="people" cb-hml="data.firstName"></li>
		 * <li cb-repeat="people:PersonItemRenderer" cb-hml="data.firstName"></li>
		 * <person-item-renderer cb-repeat="people"></person-item-renderer>
		 */
		cbRepeat(el: HTMLElement, value: any, options: any, itemRendererClassName: string):void;

		/**
		 * Sets the properties of the element's dataset (it's `data-*` attributes)
		 * using the properties of the object being bound to it. Non-Object values
		 * will be disregarded. You'll need to use a polyfill for IE <= 10.
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-dataset="propertyName"></div>
		 */
		cbDataset(el: HTMLElement, value: any):void;

		/**
		 * When used with a standard DOM element, the properties of the element's
		 * `dataset` (it's `data-*` attributes) are set using the properties of the
		 * object being bound to it; you'll need to use a polyfill for IE <= 10
		 * When used with a Glimpse, the Glimpse's `data` property is set to
		 * the value of the bound property.
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-data="propertyName"></div>
		 */
		cbData(el: HTMLElement, value: any):void;

		/**
		 * Only includes the specified element in the layout when the View's `currentState`
		 * matches one of the states listed in the attribute's value; multiple states should
		 * be separated by spaces
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @param 		{Object} 		options - Options relating to this binding
		 * @returns		{void}
		 * @example
		 * <div cb-include-in="happy sad elated"></div>
		 */
		cbIncludeIn(el: HTMLElement, value: any, options: any):void;

		/**
		 * Removes the specified element from the layout when the View's `currentState`
		 * matches one of the states listed in the attribute's value; multiple states should
		 * be separated by spaces
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @param 		{Object} 		options - Options relating to this binding
		 * @returns		{void}
		 * @example
		 * <div cb-exclude-from="confused frightened"></div>
		 */
		cbExcludeFrom(el: HTMLElement, value: any, options: any):void;

		/**
		 * Completely removes an element from the DOM based on a bound property value,
		 * primarily intended to facilitate graceful degredation and removal of desktop
		 * features in mobile environments.
		 * @example		cb-remove="isMobile"
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-remove="propertyName"></div>
		 */
		cbRemove(el: HTMLElement, value: any):void;

		/**
		 * The opposite of `cbRemove`
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-keep="propertyName"></div>
		 */
		cbKeep(el: HTMLElement, value: any):void;

		/**
		 * Enables the use of cb-onbind attribute to handle the 'bind' event
		 * dispatched by the element after it has been bound by Conbo
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-onbind="functionName"></div>
		 */
		cbOnbind(el: HTMLElement, value: any):void;

		/**
		 * Uses JavaScript to open an anchor's HREF so that the link will open in
		 * an iOS WebView instead of Safari
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @returns		{void}
		 * @example
		 * <div cb-jshref="propertyName"></div>
		 */
		cbJshref(el: HTMLElement):void;

		/**
		 * Detects changes to the specified element and applies the CSS class
		 * cb-changed or cb-unchanged, depending on whether the contents have
		 * changed from their original value.
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{any} 			value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-detect-change></div>
		 */
		cbDetectChange(el: HTMLElement, value: any):void;

		/**
		 * Use a method or regex to validate a form element and apply a
		 * cb-valid or cb-invalid CSS class based on the outcome
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{Function} 		validator - The function referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-validate="functionName"></div>
		 */
		cbValidate(el: HTMLElement, validator: Function):void;

		/**
		 * Restricts text input to the specified characters
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{string} 		value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-restrict="propertyName"></div>
		 */
		cbRestrict(el: HTMLElement, value: string):void;

		/**
		 * Limits the number of characters that can be entered into
		 * input and other form fields
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{string} 		value - The value referenced by the attribute
		 * @returns		{void}
		 * @example
		 * <div cb-max-chars="propertyName"></div>
		 */
		cbMaxChars(el: HTMLElement, value: string):void;
		
		/**
		 * Sets the aria accessibility attributes on an element based on the value
		 * of the bound property, e.g. cb-aria="myProperty:label" to set aria-label 
		 * to the value of myProperty
		 * 
		 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
		 * @param 		{string}		value - The value referenced by the attribute
		 * @param 		{any} 			options
		 * @param 		{string} 		ariaName - The name of the aria value to set (without the aria- prefix)
		 * @returns		{void}
		 * 
		 * @example
		 * <div cb-class="ariaLabel:label"></div>
		 */
		cbAria(el: HTMLElement, value: string, options: any, ariaName: string):void;
	
	}

	/**
	 * Binding utilities class
	 * Used to bind properties of EventDispatcher class instances to DOM elements,
	 * other EventDispatcher class instances or setter functions
	 * @class		BindingUtils
	 * 
	 * @augments	conbo.Class
	 * @author 		Neil Rackett
	 */
	class BindingUtils extends Class {
		/**
		 * Should binding attributes, like "cb-bind", be removed after they've been processed?
		 * @type	{boolean}
		 */
		removeAttributeAfterBinding: boolean;

		/**
		 * Bind a property of a EventDispatcher class instance (e.g. Hash or View)
		 * to a DOM element's value/content, using ConboJS's best judgement to
		 * work out how the value should be bound to the element.
		 * This method of binding also allows for the use of a parse function,
		 * which can be used to manipulate bound data in real time
		 * @param 		{conbo.EventDispatcher}	source - Class instance which extends from conbo.EventDispatcher
		 * @param 		{string} 				propertyName - Property name to bind
		 * @param 		{HTMLElement} 			el - DOM element to bind value to (two-way bind on input/form elements)
		 * @param 		{Function}				[parseFunction] - Optional method used to parse values before outputting as HTML
		 * @returns		{any[]}					Array of bindings
		 */
		bindElement(source: EventDispatcher, propertyName: string, el: HTMLElement, parseFunction?: any):any;

		/**
		 * Unbinds the specified property of a bindable class from the specified DOM element
		 * @param 		{conbo.EventDispatcher}	source - Class instance which extends from conbo.EventDispatcher
		 * @param 		{string} 				propertyName - Property name to bind
		 * @param 		{HTMLElement} 			el - DOM element to unbind value from
		 * @returns		{conbo.BindingUtils}	A reference to this object
		 */
		unbindElement(source: EventDispatcher, propertyName: string, el: HTMLElement):BindingUtils;

		/**
		 * Bind a DOM element to the property of a EventDispatcher class instance,
		 * e.g. Hash or Model, using cb-* attributes to specify how the binding
		 * should be made.
		 * Two way bindings will automatically be applied where the attribute name
		 * matches a property on the target element, meaning your EventDispatcher object
		 * will automatically be updated when the property changes.
		 * @param 	{conbo.EventDispatcher}	source - Class instance which extends from conbo.EventDispatcher (e.g. Hash or Model)
		 * @param 	{string}				propertyName - Property name to bind
		 * @param 	{HTMLElement}			element - DOM element to bind value to (two-way bind on input/form elements)
		 * @param 	{string}				attributeName - The attribute to bind as it appears in HTML, e.g. "cb-prop-name"
		 * @param 	{Function} 				[parseFunction] - Method used to parse values before outputting as HTML
		 * @param	{Object}				[options] - Options related to this attribute binding
		 * @returns	{any[]}					Array of bindings
		 */
		bindAttribute(source: EventDispatcher, propertyName: string, element: any, attributeName: string, parseFunction?: any, options?: any):any;

		/**
		 * Applies the specified read-only Conbo or custom attribute to the specified element
		 * @param 	{HTMLElement}			element - DOM element to bind value to (two-way bind on input/form elements)
		 * @param 	{string}				attributeName - The attribute to bind as it appears in HTML, e.g. "cb-prop-name"
		 * @returns	{conbo.BindingUtils}	A reference to this object
		 * @example
		 * conbo.bindingUtils.applyAttribute(el, "my-custom-attr");
		 */
		applyAttribute(element: any, attributeName: string):BindingUtils;

		/**
		 * Does the specified Conbo or custom attribute exist?
		 * @param 	{string}				attributeName - The attribute name as it appears in HTML, e.g. "cb-prop-name"
		 * @returns	{Boolean}
		 */
		attributeExists(attributeName: string):any;

		/**
		 * Bind everything within the DOM scope of a View to properties of the View instance
		 * @param 	{conbo.View}			view - The View class controlling the element
		 * @returns	{conbo.BindingUtils}	A reference to this object
		 */
		bindView(view: View):BindingUtils;

		/**
		 * Removes all data binding from the specified View instance
		 * @param 	{conbo.View}			view
		 * @returns	{conbo.BindingUtils}	A reference to this object
		 */
		unbindView(view: View):BindingUtils;

		/**
		 * Applies View and Glimpse classes DOM elements based on their cb-view
		 * attribute or tag name
		 * @param	{HTMLElement} 			rootView - DOM element, View or Application class instance
		 * @param	{conbo.Namespace} 		namespace - The current namespace
		 * @param	{string} 				[type=view] - View type, 'view' or 'glimpse'
		 * @returns	{conbo.BindingUtils}	A reference to this object
		 */
		applyViews(rootView: any, namespace: Namespace, type?: string):BindingUtils;

		/**
		 * Bind the property of one EventDispatcher class instance (e.g. Hash or View) to another
		 * @param 	{conbo.EventDispatcher}	source - Class instance which extends conbo.EventDispatcher
		 * @param 	{string}				sourcePropertyName - Source property name
		 * @param 	{any}						destination - Object or class instance which extends conbo.EventDispatcher
		 * @param 	{string}				[destinationPropertyName] Defaults to same value as sourcePropertyName
		 * @param 	{Boolean}				[twoWay=false] - Apply 2-way binding
		 * @returns	{conbo.BindingUtils}	A reference to this object
		 */
		bindProperty(source: EventDispatcher, sourcePropertyName: string, destination: any, destinationPropertyName?: string, twoWay?: any):BindingUtils;

		/**
		 * Call a setter function when the specified property of a EventDispatcher
		 * class instance (e.g. Hash or Model) is changed
		 * @param 	{conbo.EventDispatcher}	source				Class instance which extends conbo.EventDispatcher
		 * @param 	{string}			propertyName
		 * @param 	{Function}			setterFunction
		 * @returns	{conbo.BindingUtils}	A reference to this object
		 */
		bindSetter(source: EventDispatcher, propertyName: string, setterFunction: any):BindingUtils;

		/**
		 * Default parse function
		 * @param	{any} 		value - The value to be parsed
		 * @returns	{any}			The parsed value
		 */
		defaultParseFunction(value: any):any;

		/**
		 * Attempt to convert string into a conbo.Class in the specified namespace
		 * @param 		{string} 			className - The name of the class
		 * @param 		{conbo.Namespace}	namespace - The namespace containing the class
		 * @returns		{any}
		 */
		getClass(className: string, namespace: Namespace):any;

		/**
		 * Register a custom attribute handler
		 * @param		{string}	name - camelCase version of the attribute name (must include a namespace prefix)
		 * @param		{Function}	handler - function that will handle the data bound to the element
		 * @param 		{boolean}	readOnly - Whether or not the attribute is read-only (default: false)
		 * @param 		{boolean}	[raw=false] - Whether or not parameters should be passed to the handler as a raw String instead of a bound value
		 * @returns		{conbo.BindingUtils}	A reference to this object
		 * @example
		 * // HTML: <div my-font-name="myProperty"></div>
		 * conbo.bindingUtils.registerAttribute('myFontName', function(el, value, options, param)
		 * {
		 * 	el.style.fontName = value;
		 * });
		 */
		registerAttribute(name: string, handler: any, readOnly: boolean, raw?: boolean):BindingUtils;

		/**
		 * Register one or more custom attribute handlers
		 * @see			#registerAttribute
		 * @param 		{Object}				handlers - Object containing one or more custom attribute handlers
		 * @param 		{boolean}				[readOnly=false] - Whether or not the attributes are read-only
		 * @returns		{conbo.BindingUtils}	A reference to this object
		 * @example
		 * conbo.bindingUtils.registerAttributes({myFoo:myFooFunction, myBar:myBarFunction});
		 */
		registerAttributes(handlers: any, readOnly?: boolean):BindingUtils;

	}

	/**
	 * Mutation Observer
	 * Simplified mutation observer dispatches ADD and REMOVE events following
	 * changes in the DOM, compatible with IE9+ and all modern browsers
	 * @class		MutationObserver
	 * 
	 * @augments	conbo.EventDispatcher
	 * @author 		Neil Rackett
	 * @param 		{Object} options - Object containing initialisation options
	 * @fires		conbo.ConboEvent#ADD
	 * @fires		conbo.ConboEvent#REMOVE
	 */
	class MutationObserver extends EventDispatcher 
	{
		observe(el:Element):MutationObserver;
		disconnect():MutationObserver;
	}

	/**
	 * Element Proxy
	 * Wraps an Element to add cross browser or simplified functionality;
	 * think of it as "jQuery nano"
	 * @param 		{Element} el - Element to be proxied
	 */
	class ElementProxy extends EventProxy 
	{
		constructor(el: HTMLElement);

		/**
		 * Returns object containing the value of all attributes on a DOM element
		 * @returns		{Object}
		 * @example
		 * ep.attributes; // results in something like {src:"foo/bar.jpg"}
		 */
		getAttributes():any;

		/**
		 * Sets the attributes on a DOM element from an Object, converting camelCase to kebab-case, if needed
		 * @param 		{Element}	obj - Object containing the attributes to set
		 * @returns		{conbo.ElementProxy}
		 * @example
		 * ep.setAttributes({foo:1, bar:"red"});
		 */
		setAttributes(obj: any):this;

		/**
		 * @see #getAttributes
		 */
		attributes:any;
		
		readonly cbAttributes:any;
		
		/**
		 * Add the specified CSS class(es) to the element
		 *  
		 * @param 		{string}	className - One or more CSS class names, separated by spaces
		 * @returns		{conbo.ElementProxy}
		 */
		addClass(className:string):this;
		
		/**
		 * Remove the specified CSS class(es) from the element
		 * 
		 * @param 		{string|function}		className - One or more CSS class names, separated by spaces, or a function extracts the classes to be removed from the existing className property
		 * @returns		{conbo.ElementProxy}
		 */
		removeClass(className:string|Function):this;
		
		/**
		 * Is this element using the specified CSS class?
		 *  
		 * @param 		{string}	className - CSS class name
		 * @returns		{boolean}
		 */
		hasClass(className:string):boolean;
		
		/**
		 * Finds the closest parent element matching the specified selector
		 *  
		 * @param 		{string}	selector - Query selector
		 * @returns		{Element}
		 */
		closest(selector:string):Element;
	}

	/**
	 * Glimpse
	 * A lightweight element wrapper that has no dependencies, no context and
	 * no data binding, but is able to apply a super-simple template.
	 * It's invisible to View, so it's great for creating components, and you
	 * can bind data to it using the `cb-data` attribute to set the data
	 * property of your Glimpse
	 */
	class Glimpse extends EventDispatcher 
	{
		/**
		 * Arbitrary data
		 * @type	{any}
		 */
		data: any;

		/**
		 * Template to apply to this Glimpse's element
		 * @type	{string}
		 */
		template: string;

		/**
		 * When a new instance of this class is created without specifying an element,
		 * it will use this tag name (the default is `div`)
		 * @type	{string}
		 */
		tagName: string;

		/**
		 * A reference to this class instance's element
		 * @type	{HTMLElement}
		 */
		el: HTMLElement;

	}

	/**
	 * View
	 * Creating a conbo.View creates its initial element outside of the DOM,
	 * if an existing element is not provided...
	 * @fires		conbo.ConboEvent#ADD
	 * @fires		conbo.ConboEvent#DETACH
	 * @fires		conbo.ConboEvent#REMOVE
	 * @fires		conbo.ConboEvent#BIND
	 * @fires		conbo.ConboEvent#UNBIND
	 * @fires		conbo.ConboEvent#TEMPLATE_COMPLETE
	 * @fires		conbo.ConboEvent#TEMPLATE_ERROR
	 * @fires		conbo.ConboEvent#PREINITIALIZE
	 * @fires		conbo.ConboEvent#INITIALIZE
	 * @fires		conbo.ConboEvent#INIT_COMPLETE
	 * @fires		conbo.ConboEvent#CREATION_COMPLETE
	 */
	class View extends Glimpse 
	{
		/**
		 * @param 		{Object}	[options] - Object containing optional initialisation options, including 'attributes', 'className', 'data', 'el', 'id', 'tagName', 'template', 'templateUrl'
		 */
		constructor(options?: any);

		/**
		 * Attributes to apply to the View's element
		 */
		attributes:any;

		/**
		 * CSS class name(s) to apply to the View's element
		 */
		className: string;

		/**
		 * Arbitrary data Object
		 */
		data:any;

		/**
		 * ID to apply to the View's element
		 */
		id: string;

		/**
		 * Object containing CSS styles to apply to this View's element
		 */
		style: any;

		/**
		 * The tag name to use for the View's element (if no element specified)
		 */
		tagName: string;

		/**
		 * Template to apply to the View's element
		 */
		template: string|Function;

		/**
		 * Template to load and apply to the View's element
		 */
		templateUrl: string;

		/**
		 * Whether or not the contents of templateUrl should be cached on first load for use with future instances of this View class (default: true)
		 */
		templateCacheEnabled: boolean;

		/**
		 * Whether or not the template should automatically be loaded and applied, rather than waiting for the user to call initTemplate (default: true)
		 */
		autoInitTemplate: boolean;

		/**
		 * This View's element
		 */
		el: HTMLElement;

		/**
		 * Has this view completed its life cycle phases?
		 */
		initialized: boolean;

		/**
		 * Returns a reference to the parent View of this View, based on this
		 * View element's position in the DOM
		 */
		parent: View;

		/**
		 * Returns a reference to the parent Application of this View, based on
		 * this View element's position in the DOM
		 */
		parentApp: Application;

		/**
		 * Does this view have a template?
		 */
		hasTemplate: boolean;

		/**
		 * The element into which HTML content should be placed; this is either the
		 * first DOM element with a `cb-content` or the root element of this view
		 */
		content: HTMLElement;

		/**
		 * Does this View support HTML content?
		 */
		hasContent: boolean;

		/**
		 * A View's body is the element to which content should be added:
		 * the View's content, if it exists, or the View's main element, if it doesn't
		 */
		body: HTMLElement;

		/**
		 * The context that will automatically be applied to children
		 * when binding or appending Views inside of this View
		 */
		subcontext: Context;

		/**
		 * The current view state
		 */
		currentState: string;

		/**
		 * Uses querySelector to find the first matching element contained within the
		 * current View's element, but not within the elements of child Views
		 * @param	{string}		selector - The selector to use
		 * @param	{boolean}		[deep=false] - Include elements in child Views?
		 * @returns	{HTMLElement}	The first matching element
		 */
		querySelector(selector:string, deep?:boolean):Element;

		/**
		 * Uses querySelectorAll to find all matching elements contained within the
		 * current View's element, but not within the elements of child Views
		 * @param	{string}		selector - The selector to use
		 * @param	{boolean}		[deep=false] - Include elements in child Views?
		 * @returns	{HTMLElement[]}	All elements matching the selector
		 */
		querySelectorAll(selector:string, deep?:boolean):Element[];

		/**
		 * Take the View's element element out of the DOM
		 * @returns	{this}
		 */
		detach():this;

		/**
		 * Remove and destroy this View by taking the element out of the DOM,
		 * unbinding it, removing all event listeners and removing the View from
		 * its Context.
		 * You should use a REMOVE event handler to destroy any event listeners,
		 * timers or other persistent code you may have added.
		 * @returns	{this}
		 */
		remove():this;

		/**
		 * Append this DOM element from one View class instance this class
		 * instance's DOM element
		 * @param 		{...conbo.View} views - The View instance(s) to append
		 * @returns		{this}
		 */
		appendView(...views: View[]):this;

		/**
		 * Append this DOM element from one View class instance this class
		 * instance's DOM element
		 * @param 		{...conbo.View} views - The View class(es) to append
		 * @returns		{this}
		 */
		appendView(...views: Function[]):this;

		/**
		 * Prepend this DOM element from one View class instance this class
		 * instance's DOM element
		 * @param 		{...conbo.View} views - The View instance(s) to prepend
		 * @returns		{this}
		 */
		prependView(...views: View[]):this;

		/**
		 * Prepend this DOM element from one View class instance this class
		 * instance's DOM element
		 * @param 		{...conbo.View} views - The View class(es) to prepend
		 * @returns		{this}
		 */
		prependView(...views: Function[]):this;

		/**
		 * Automatically bind elements to properties of this View
		 * @example	<div cb-bind="property|parseMethod" cb-hide="property">Hello!</div>
		 * @returns	{this}
		 */
		bindView():this;

		/**
		 * Unbind elements from class properties
		 * @returns	{this}
		 */
		unbindView():this;

		/**
		 * Initialize the View's template, either by loading the templateUrl
		 * or using the contents of the template property, if either exist
		 * @returns	{this}
		 */
		initTemplate():this;

		/**
		 * Load HTML template and use it to populate this View's element
		 * @param 	{string}	[url]	- The URL to which the request is sent
		 * @returns	{this}
		 */
		loadTemplate(url?: string):this;

	}

	interface IDataRenderer {

		/**
		 * Data to be rendered
		 */
		data:any;

		/**
		 * Index of the current item
		 */
		index: number;

		/**
		 * Is this the last item in the list?
		 */
		isLast: boolean;

		/**
		 * The list containing the data for this item
		 */
		list: List|any[];
	}

	/**
	 * A conbo.View class that implements the conbo.IDataRenderer interface
	 */
	class ItemRenderer extends View implements IDataRenderer {

		/**
		 * Data to be rendered
		 */
		data:any;

		/**
		 * Index of the current item
		 * @type	{number}
		 */
		index: number;

		/**
		 * Is this the last item in the list?
		 */
		isLast: boolean;

		/**
		 * The list containing the data for this item
		 */
		list: List|any[];
	}

	/**
	 * Base application class for client-side applications
	 * @fires		conbo.ConboEvent#ADD
	 * @fires		conbo.ConboEvent#DETACH
	 * @fires		conbo.ConboEvent#REMOVE
	 * @fires		conbo.ConboEvent#BIND
	 * @fires		conbo.ConboEvent#UNBIND
	 * @fires		conbo.ConboEvent#TEMPLATE_COMPLETE
	 * @fires		conbo.ConboEvent#TEMPLATE_ERROR
	 * @fires		conbo.ConboEvent#CREATION_COMPLETE
	 */
	class Application extends View 
	{
		/**
		 * Application namespace (required)
		 */
		namespace: Namespace;
		
		/**
		 * Default context class to use
		 * You'll normally want to override this with your own
		 */
		contextClass:Function;

		/**
		 * If true, the application will automatically apply Glimpse and View
		 * classes to elements when they're added to the DOM
		 */
		observeEnabled: boolean;

		/**
		 * If specified, this View will be appended immediately after the Application is intialized.
		 * If this property is set to a class, it will be instantiated automatically the first time
		 * this property is read.
		 */
		initialView:View|any;
	}

	/**
	 * conbo.Command
	 * Base class for commands to be registered in your Context
	 * using mapCommand(...)
	 * @class		Command
	 * 
	 * @augments	conbo.ConboClass
	 * @author		Neil Rackett
	 * @param 		{Object} options - Object containing optional initialisation options, including 'context' (Context)
	 */
	class Command extends ConboClass implements IInjectable {

		context: Context;
		event: Event;

		/**
		 * Execute: should be overridden
		 * When a Command is called in response to an event registered with the
		 * Context, the class is instantiated, this method is called then the
		 * class instance is destroyed
		 */
		execute():void;

	}

	/**
	 * HTTP Service
	 * Base class for HTTP data services, with default configuration designed
	 * for use with JSON REST APIs.
	 * For XML data sources, you will need to override decodeFunction to parse
	 * response data, change the contentType and implement encodeFunction if
	 * you're using RPC.
	 * @fires		conbo.ConboEvent#RESULT
	 * @fires		conbo.ConboEvent#FAULT
	 */
	class HttpService extends EventDispatcher 
	{
		/**
		 * @param 		{Object} options - Object containing optional initialisation options, including 'rootUrl', 'contentType', 'dataType', 'headers', 'encodeFunction', 'decodeFunction', 'resultClass','makeObjectsBindable'
		 */
		constructor(options?:any);
		
		/**
		 * The root URL of the web service
		 */
		rootUrl: string;
	
		contentType:string; 
		dataType:string;
		headers:any;
		decodeFunction:Function;
		resultClass:any;
		makeObjectsBindable:boolean;
		
		/**
		 * Call a method of the web service using the specified verb
		 * 
		 * @param	{string}	command - The name of the command
		 * @param	{Object}	[data] - Object containing the data to send to the web service
		 * @param	{string}	[method=GET] - GET, POST, etc (default: GET)
		 * @param	{Class}		[resultClass] - Optional
		 * @returns	{Promise}
		 */
		call(command:string, data?:any, method?:string, resultClass?:any):Promise<any>;
		
		/**
		 * Call a method of the web service using the POST verb
		 * 
		 * @param		{string}	command - The name of the command
		 * @param		{Object}	[data] - Object containing the data to send to the web service
		 * @param		{Class}		[resultClass] - Optional
		 * @returns		{Promise}
		 */
		post(command:string, data?:any, resultClass?:any):Promise<any>;
		
		/**
		 * Call a method of the web service using the GET verb
		 * 
		 * @param		{string}	command - The name of the command
		 * @param		{Object}	[data] - Object containing the data to send to the web service
		 * @param		{Class}		[resultClass] - Optional
		 * @returns		{Promise}
		 */
		get(command:string, data?:any, resultClass?:any):Promise<any>;
		
		/**
		 * Call a method of the web service using the PUT verb
		 * 
		 * @param		{string}	command - The name of the command
		 * @param		{Object}	[data] - Object containing the data to send to the web service
		 * @param		{Class}		[resultClass] - Optional
		 * @returns		{Promise}
		 */
		put(command:string, data?:any, resultClass?:any):Promise<any>;
		
		/**
		 * Call a method of the web service using the PATCH verb
		 * 
		 * @param		{string}	command - The name of the command
		 * @param		{Object}	[data] - Object containing the data to send to the web service
		 * @param		{Class}		[resultClass] - Optional
		 * @returns		{Promise}
		 */
		patch(command:string, data?:any, resultClass?:any):Promise<any>;
		
		/**
		 * Call a method of the web service using the DELETE verb
		 * 
		 * @param		{string}	command - The name of the command
		 * @param		{Object}	[data] - Object containing the data to send to the web service
		 * @param		{Class}		[resultClass] - Optional
		 * @returns		{Promise}
		 */
		delete(command:string, data?:any, resultClass?:any):Promise<any>;
		
		/**
		 * Add one or more remote commands as methods of this class instance
		 * @param	{string}	command - The name of the command
		 * @param	{string}	[method=GET] - GET, POST, etc (default: GET)
		 * @param	{Class}		[resultClass] - Optional
		 */
		addCommand(command:string, method?:string, resultClass?:any):this;
		
		/**
		 * Add multiple commands as methods of this class instance
		 * @param	{string[]}	commands
		 */
		addCommands(commands:string[]):this;
		
		/**
		 * Method that encodes data to be sent to the API
		 * 
		 * @param	{Object}	data - Object containing the data to be sent to the API
		 * @param	{string}	[method] - GET, POST, etc (default: GET)
		 */
		encodeFunction(data:any, method?:string):any;
		
		/**
		 * Splice data into URL and remove spliced properties from data object
		 */
		parseUrl(url:String, data?:any):string;
		
	}

	/**
	 * Default history manager used by Router, implemented using onhashchange 
	 * event and hash-bang URL fragments
	 * 
	 * @author 		Neil Rackett
	 * @fires		conbo.ConboEvent#CHANGE
	 * @fires		conbo.ConboEvent#FAULT
	 */
	class History extends EventDispatcher
	{
		start(options?:any):this;
		stop():this;
		addRoute(route:string, callback:Function):this;
		
		/**
		 * The current path
		 * @returns	{string}
		 */
		getPath():string;
		
		/**
		 * Set the current path
		 * 
		 * @param	{string}	path - The path
		 * @param	{string}	fragment
		 * @param	{any}		options
		 */
		setPath(fragment:string, options:any):this;
		
	}
	
	/**
	 * Router
	 * Routers map faux-URLs to actions, and fire events when routes are
	 * matched. Creating a new one sets its `routes` hash, if not set statically.
	 * Derived from the Backbone.js class of the same name
	 * @class		Router
	 * 
	 * @augments	conbo.EventDispatcher
	 * @author 		Neil Rackett
	 * @param 		{Object} options - Object containing initialisation options
	 * @fires		conbo.ConboEvent#CHANGE
	 * @fires		conbo.ConboEvent#FAULT
	 * @fires		conbo.ConboEvent#ROUTE
	 * @fires		conbo.ConboEvent#START
	 * @fires		conbo.ConboEvent#STOP
	 */
	class Router extends EventDispatcher {

		/**
		 * Object containing route:lab pairs describing the routes handled by this router
		 */
		routes:any;
		
		/**
		 * The History class to use with this router (defaults to conbo.History)
		 */  
		historyClass:any;
	
		/**
		 * Start the router
		 */
		start(options?:any):this;

		/**
		 * Stop the router
		 */
		stop():Router;

		/**
		 * Adds a named route
		 * @example
		 * 		this.addRoute('search/:query/p:num', 'search', function(query, num) {
		 * 			 ...
		 * 		});
		 */
		addRoute(route:string, name:string, callback:Function):void;

		/**
		 * Sets the current path, optionally replacing the current path or silently
		 * without triggering a route event
		 * @param	{string}	path - The path to navigate to
		 * @param	{Object}	[options] - Object containing options: trigger (default: true) and replace (default: false)
		 */
		setPath(path: string, options?: any):this;

		/**
		 * Get or set the current path using the default options
		 * @type	{string}
		 */
		path: string;

	}

	const VERSION:string;
	
	/**
	 * Constant for JSON content type
	 * @type		{string}
	 */
	const CONTENT_TYPE_JSON:string;

	/**
	 * Constant for form URL-encoded content type
	 * @type		{string}
	 */
	const CONTENT_TYPE_FORM:string;

	/**
	 * Constant for JSON data type
	 * @type		{string}
	 */
	const DATA_TYPE_JSON:string;

	/**
	 * Constant for script data type type
	 * @type		{string}
	 */
	const DATA_TYPE_SCRIPT:string;

	/**
	 * Constant for text data type type
	 * @type		{string}
	 */
	const DATA_TYPE_TEXT:string;
	
	const bindingUtils:BindingUtils;
	
	function toString():string;
	
	/**
	 * Initialize Applications in the DOM using the specified namespace
	 * 
	 * By default, Conbo scans the entire DOM, but you can limit the
	 * scope by specifying a root element
	 * 
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} [rootEl] - Top most element to scan
	 */
	function initDom(namespace:Namespace, rootEl?:Element):any;
	
	/**
	 * Watch the DOM for new Applications using the specified namespace
	 * 
	 * By default, Conbo watches the entire DOM, but you can limit the
	 * scope by specifying a root element
	 * 
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} [rootEl] - Top most element to observe
	 */
	function observeDom(namespace:Namespace, rootEl?:Element):any;
	
	/**
	 * Stop watching the DOM for new Applications
	 * 
	 * 
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} [rootEl] - Top most element to observe
	 */
	function unobserveDom(namespace:Namespace, rootEl?:Element):any;
	
	/**
	 * HTTP Request
	 * 
	 * Sends data to and/or loads data from a URL; advanced requests can be made 
	 * by passing a single options object, roughly analogous to the jQuery.ajax() 
	 * settings object plus `resultClass` and `makeObjectsBindable` properties;
	 * or by passing URL, data and method parameters.
	 * 
	 * @example		conbo.httpRequest({url:"http://www.foo.com/bar", data:{user:1}, method:"GET", headers:{'X-Token':'ABC123'}});
	 * 
	 * @see			http://api.jquery.com/jquery.ajax/
	 * @param 		{Object}		options - URL string or Object containing URL and other settings for the HTTP request
	 * @returns		{Promise}
	 */
	function httpRequest(options:any):Promise<any>;

	/**
	 * HTTP Request
	 * 
	 * Sends data to and/or loads data from a URL; advanced requests can be made 
	 * by passing a single options object, roughly analogous to the jQuery.ajax() 
	 * settings object plus `resultClass` and `makeObjectsBindable` properties;
	 * or by passing URL, data and method parameters.
	 * 
	 * @example		conbo.httpRequest("http://www.foo.com/bar", {user:1}, "GET");
	 * 
	 * 
	 * @param 		{string}	urlOrOptions - URL string or Object containing URL and other settings for the HTTP request
	 * @param 		{Object}	data - Data to be sent with request (ignored when using options object)
	 * @param 		{string}	method - HTTP method to use, e.g. "GET" or "POST" (ignored when using options object)
	 * @returns		{Promise}
	 */
	function httpRequest(url:string, data?:any, method?:string):Promise<any>;
	
	/**
	 * Handles objects, arrays, lists and raw objects using a for loop (because 
	 * tests show that a for loop can be twice as fast as a native forEach).
	 * 
	 * Return `false` to break the loop.
	 * 
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	iterator - Iterator function with parameters: item, index, list
	 * @param		{Object}	[scope] - The scope the iterator function should run in
	 * @returns		{void}
	 */
	 function forEach(obj:any, iterator:Function, scope?:any):void;
	
	/**
	 * Return the results of applying the iterator to each element.
	 * Delegates to native `map` if available.
	 * 
	 * 
	 * @deprecated	Use Array.prototype.map
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	iterator - Iterator function with parameters: item, index, list
	 * @param		{Object}	[scope] - The scope the iterator function should run in
	 * @returns		{any[]}
	 */
	function map(obj:any, iterator:Function, scope?:any):any[];
	
	/**
	 * Returns the index of the first instance of the specified item in the list
	 * 
	 * 
	 * @deprecated	Use Array.prototype.indexOf
	 * @param		{Object}	obj - The list to search
	 * @param		{Object}	item - The value to find the index of
	 * @returns		{number}
	 */
	function indexOf(obj:any, item:any):number;
	
	/**
	 * Returns the index of the last instance of the specified item in the list
	 * 
	 * 
	 * @deprecated	Use Array.prototype.lastIndexOf
	 * @param		{Object}	obj - The list to search
	 * @param		{Object}	item - The value to find the index of
	 * @returns		{number}
	 */
	function lastIndexOf(obj:any, item:any):number;
	
	/**
	 * Return the first value which passes a truth test
	 * 
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	predicate - Function that tests each value, returning true or false
	 * @param		{Object}	[scope] - The scope the predicate function should run in
	 * @returns		{any}
	 */
	function find(obj:any, predicate:Function, scope?:any):any;
	
	/**
	 * Return the index of the first value which passes a truth test
	 * 
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	predicate - Function that tests each value, returning true or false
	 * @param		{Object}	[scope] - The scope the predicate function should run in
	 * @returns		{number}
	 */
	function findIndex(obj:any, predicate:Function, scope?:any):number;
	
	/**
	 * Return all the elements that pass a truth test.
	 * Delegates to native `filter` if available.
	 * 
	 * 
	 * @deprecated	Use Array.prototype.filter
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	predicate - Function that tests each value, returning true or false
	 * @param		{Object}	[scope] - The scope the predicate function should run in
	 * @returns		{any[]}
	 */
	function filter(obj:any, predicate:Function, scope?:any):any[];

	/**
	 * Return all the elements for which a truth test fails.
	 * 
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	predicate - Function that tests each value, returning true or false
	 * @param		{Object}	[scope] - The scope the predicate function should run in
	 * @returns		{any[]}
	 */
	function reject(obj:any, predicate:Function, scope?:any):any[]; 
	
	/**
	 * Determine whether all of the elements match a truth test.
	 * Delegates to native `every` if available.
	 * 
	 * 
	 * @deprecated	Use Array.prototype.every
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	predicate - Function that tests each value, returning true or false
	 * @param		{Object}	[scope] - The scope the predicate function should run in
	 * @returns		{boolean}
	 */
	function every(obj:any, predicate:Function, scope?:any):boolean; 

	/**
	 * Determine if at least one element in the object matches a truth test.
	 * Delegates to native `some` if available.
	 * 
	 * 
	 * @deprecated	Use Array.prototype.some
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	predicate - Function that tests each value, returning true or false
	 * @param		{Object}	[scope] - The scope the predicate function should run in
	 * @returns		{any[]}
	 */
	function some(obj:any, predicate:Function, scope?:any):any[]; 
	
	/**
	 * Determine if the array or object contains a given value (using `===`).
	 * 
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	target - The value to match
	 * @returns		{boolean}
	 */
	function contains(obj:any, target:any):boolean; 

	/**
	 * Invoke a method (with arguments) on every item in a collection.
	 * 
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	method - Function to invoke on every item
	 * @returns		{any[]}
	 */
	function invoke(obj:any, method:Function):any[]; 
	
	/**
	 * Convenience version of a common use case of `map`: fetching a property.
	 * 
	 * 
	 * @param		{Object}	obj - Array obj Objects
	 * @param		{...string}	key - Property name
	 * @returns		{any[]}
	 */
	function pluck(obj:any, ...key:string[]):any[];

	/**
	 * Return the maximum element or (element-based computation).
	 * Can't optimize arrays of integers longer than 65,535 elements.
	 * 
	 * @see https://bugs.webkit.org/show_bug.cgi?id=80797
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	[iterator] - Function that tests each value
	 * @param		{Object}	[scope] - The scope the iterator function should run in
	 * @returns		{Object}
	 */
	function max(obj:any, iterator?:Function, scope?:any):any;

	/**
	 * Return the minimum element (or element-based computation).
	 * 
	 * 
	 * @param		{Object}	obj - The list to iterate
	 * @param		{Function}	[iterator] - Function that tests each value
	 * @param		{Object}	[scope] - The scope the iterator function should run in
	 * @returns		{Object}
	 */
	function min(obj:any, iterator?:Function, scope?:any):any; 

	/**
	 * Shuffle an array, using the modern version of the Fisher-Yates shuffle
	 * @see http://en.wikipedia.org/wiki/Fisher–Yates_shuffle
	 * 
	 * 
	 * @param		{Object}	obj - The list to shuffle
	 * @returns		{any[]}
	 */
	function shuffle(obj:any):any[];

	/**
	 * Convert anything iterable into an Array
	 * 
	 * 
	 * @param		{Object}	obj - The object to convert into an Array 
	 * @returns		{any[]}
	 */
	function toArray(obj:any):any[];
	
	/**
	 * Return the number of elements in an object.
	 * 
	 * 
	 * @param		{Object}	obj - The object to count the keys of
	 * @returns		{number}
	 */
	function size(obj:any):number;
	
	/**
	 * Get the last element of an array. Passing n will return the last N
	 * values in the array. The guard check allows it to work with `conbo.map`.
	 * 
	 * 
	 * @param		{any[]}		array - The array to slice
	 * @param		{Function}	[n] - The number of elements to return (default: 1)
	 * @param		{Object}	[guard] - Optional
	 * @returns		{Object}
	 */
	function last(array:any[], n?:number, guard?:any):any|any[];

	/**
	 * Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	 * Especially useful on the arguments object. Passing an n will return
	 * the rest N values in the array. The guard
	 * check allows it to work with `conbo.map`.
	 * 
	 * 
	 * @param		{any[]}		array - The array to slice
	 * @param		{Function}	[n] - The number of elements to return (default: 1)
	 * @param		{Object}	[guard] - Optional
	 * @returns		{any[]}
	 */
	function rest(array:any[], n?:number, guard?:any):any[]; 

	/**
	 * Trim out all falsy values from an array.
	 * 
	 * 
	 * @param		{any[]}		array - The array to trim
	 * @returns		{any[]}
	 */
	function compact(array:any[]):any[]; 

	/**
	 * Flatten out an array, either recursively (by default), or just one level.
	 * 
	 * 
	 * @param		{any[]}		array - The array to flatten
	 * @param		{boolean}	[shallow]
	 * @returns		{any[]}
	 */
	function flatten(array:any[], shallow?:boolean):any[]; 

	/**
	 * Return a version of the array that does not contain the specified value(s).
	 * 
	 * 
	 * @param		{any[]}		array - The array to remove the specified values from
	 * @param		{...any}	Items to remove from the array
	 * @returns		{any[]}
	 */
	function without(array:any[], ...items:any[]):any[];

	/**
	 * Split an array into two arrays: one whose elements all satisfy the given
	 * predicate, and one whose elements all do not satisfy the predicate.
	 * 
	 * 
	 * @param		{any[]}		array - The array to split
	 * @param		{Function}	predicate - Function to determine a match, returning true or false
	 * @returns		{any[]}
	 */
	function partition(array:any[], predicate:Function):any[];

	/**
	 * Produce a duplicate-free version of the array. If the array has already
	 * been sorted, you have the option of using a faster algorithm.
	 * 
	 * 
	 * @param		{any[]}		array - The array to filter
	 * @param		{boolean}	[isSorted] - Should the returned array be sorted?
	 * @param		{Object}	[iterator] - Iterator function
	 * @param		{Object}	[scope] - The scope the iterator function should run in
	 * @returns		{any[]}
	 */
	function uniq(array:any[], isSorted?:boolean, iterator?:Function, scope?:any):any[]; 

	/**
	 * Produce an array that contains the union: each distinct element from all of
	 * the passed-in arrays.
	 * 
	 * 
	 * @param		{...array}	array - Arrays to merge
	 * @returns		{any[]}
	 */
	function union(...array:any[]):any[];

	/**
	 * Produce an array that contains every item shared between all the
	 * passed-in arrays.
	 * 
	 * 
	 * @param		{...Array}	array - Arrays of values
	 * @returns		{any[]}
	 */
	function intersection(...array:any[]):any[]; 

	/**
	 * Take the difference between one array and a number of other arrays.
	 * Only the elements present in just the first array will remain.
	 * 
	 * @param		{...array}	array - Arrays of compare
	 * @returns		{any[]}
	 */
	function difference(...array:any[]):any[];

	/**
	 * Converts lists into objects. Pass either a single array of `[key, value]`
	 * pairs, or two parallel arrays of the same length -- one of keys, and one of
	 * the corresponding values.
	 * 
	 * @param		{Object}	list - List of keys
	 * @param		{Object}	values - List of values
	 * @returns		{any[]}
	 */
	function object(list:any, values:any):any[]; 
	
	/**
	 * Generate an integer Array containing an arithmetic progression. A port of
	 * the native Python `range()` function.
	 * 
	 * @see 		http://docs.python.org/library/functions.html#range
	 * 
	 * @param		{number}	start - Start
	 * @param		{number}	stop - Stop
	 * @param		{number}	stop - Step
	 * @returns		{number[]}
	 */
	function range(start:number, stop:number, step:number):number[]; 

	/**
	 * Bind one or more of an object's methods to that object. Remaining arguments
	 * are the method names to be bound. If no additional arguments are passed,
	 * all of the objects methods that are not native or accessors are bound to it.
	 * 
	 * 
	 * @param		{Object}	obj - Object to bind methods to
	 * @returns		{any}
	 */
	function bindAll(obj:any):any;

	/**
	 * Partially apply a function by creating a version that has had some of its
	 * arguments pre-filled, without changing its dynamic `this` scope.
	 * 
	 * @param		{Function}	func - Method to partially pre-fill
	 * @param		{...any}		args - Arguments to pass to specified method
	 * @returns		{Function}
	 */
	function partial(func:Function):Function;
	
	/**
	 * Calls the specified function as soon as the DOM is ready, if it is not already,
	 * otherwise call it at the end of the current callstack
	 * 
	 * @param		{Function}	func - The function to call
	 * @param		{Object}	[scope] - The scope in which to run the specified function
	 * @returns		{conbo}
	 */
	function ready(func:Function, scope?:any):any;
	
	/**
	 * Defers a function, scheduling it to run after the current call stack has
	 * cleared.
	 * 
	 * @param		{Function}	func - Function to call
	 * @param		{Object}	[scope] - The scope in which to call the function
	 * @returns		{number}	ID that can be used with clearInterval
	 */
	function defer(func:Function, scope?:any, ...args:any[]):number;
	
	/**
	 * Calls a function at the start of the next animation frame, useful when 
	 * updating multiple elements in the DOM
	 * 
	 * @param		{Function}	func - Function to call
	 * @param		{Object}	[scope] - The scope in which to call the function
	 * @returns		{conbo}
	 */
	function callLater(func:Function, scope?:any, ...args:any[]):any;
	
	/**
	 * Returns a function that will be executed at most one time, no matter how
	 * often you call it. Useful for lazy initialization.
	 * 
	 * @param		{Function}	func - Function to call
	 * @returns		{Function}
	 */
	function once(func:Function):Function; 

	/**
	 * Returns the first function passed as an argument to the second,
	 * allowing you to adjust arguments, run code before and after, and
	 * conditionally execute the original function.
	 * 
	 * @param		{Function}	func - Function to wrap
	 * @param		{Function}	wrapper - Function to call
	 * @returns		{Function}
	 */
	function wrap(func:Function, wrapper:Function):Function; 
	
	// Object Functions
	// ----------------

	/**
	 * Extends Object.keys to retrieve the names of an object's 
	 * enumerable properties
	 * 
	 * @param		{Object}	obj - Object to get keys from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @returns		{any[]}
	 */
	function keys(obj:any, deep?:boolean):any[];
	
	/**
	 * Extends Object.keys to retrieve the names of an object's 
	 * enumerable functions
	 * 
	 * @see			#keys
	 * @param		{Object}	obj - Object to get keys from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @param		{boolean}	[includeAccessors] - Whether or not to include accessors that contain functions (default: false)
	 * @returns		{any[]}
	 */
	function functions(obj:any, deep?:boolean, includeAccessors?:boolean):any[];
	
	/**
	 * Extends Object.keys to retrieve the names of an object's enumerable 
	 * variables
	 * 
	 * @see			#keys
	 * @param		{Object}	obj - Object to get keys from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @returns		{any[]}
	 */
	function variables(obj:any, deep?:boolean):any[];
	
	/**
	 * Extends Object.getOwnPropertyNames to retrieve the names of every 
	 * property of an object, regardless of whether it's enumerable or 
	 * unenumerable
	 * 
	 * @param		{Object}	obj - Object to get keys from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @returns		{any[]}
	 */
	function getPropertyNames(obj:any, deep?:boolean):any[];
	
	/**
	 * Extends Object.getOwnPropertyNames to retrieves the names of every 
	 * function of an object, regardless of whether it's enumerable or 
	 * unenumerable
	 * 
	 * @see			#getPropertyNames
	 * @param		{Object}	obj - Object to get keys from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @param		{boolean}	[includeAccessors] - Whether or not to include accessors that contain functions (default: false)
	 * @returns		{any[]}
	 */
	function getFunctionNames(obj:any, deep?:boolean, includeAccessors?:boolean):any[];
	
	/**
	 * Extends Object.getOwnPropertyNames to retrieves the names of every 
	 * variable of an object, regardless of whether it's enumerable or 
	 * unenumerable
	 * 
	 * @see			#getPropertyNames
	 * @param		{Object}	obj - Object to get keys from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @returns		{any[]}
	 */
	function getVariableNames(obj:any, deep?:boolean):any[];

	/**
	 * Extends Object.getOwnPropertyNames to retrieves the names of every 
	 * public variable of an object, regardless of whether it's enumerable or 
	 * unenumerable
	 * 
	 * @memberof	conbo
	 * @see			#getPropertyNames
	 * @param		{Object}	obj - Object to get keys from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @returns		{Array}
	 */
	function getPublicVariableNames(obj:any, deep?:boolean):any[];
	
	/**
	 * Extends Object.getOwnPropertyDescriptor to return a property descriptor 
	 * for a property of a given object, regardless of where it is in the 
	 * prototype chain
	 * 
	 * @param		{Object}	obj - Object containing the property
	 * @param		{string}	propName - Name of the property
	 * @returns		{Object}
	 */
	function getPropertyDescriptor(obj:any, propName:string):any;
	
	/**
	 * Retrieve the values of an object's enumerable properties, optionally 
	 * including values further up the prototype chain
	 * 
	 * @param		{Object}	obj - Object to get values from
	 * @param		{boolean}	[deep] - Retrieve keys from further up the prototype chain?
	 * @returns		{any[]}
	 */
	function values(obj:any, deep?:boolean):any[]; 

	/**
	 * Define the values of the given object by cloning all of the properties 
	 * of the passed-in object(s), destroying and overwriting the target's 
	 * property descriptors and values in the process
	 * 
	 * @param		{Object}	obj - Object to define properties on
	 * @param		{...any}		source - Objects containing properties to define 
	 * @returns		{Object}
	 * @see			conbo.setValues
	 */
	function defineValues(target:any, ...source:any[]):any;
	
	/**
	 * Define bindable values on the given object using the property names and
	 * of the passed-in object(s), destroying and overwriting the target's 
	 * property descriptors and values in the process
	 * 
	 * @param		{Object}	obj - Object to define properties on
	 * @param		{...any}	source - Objects containing properties to defined
	 * @returns		{Object}
	 */
	function defineBindableValues(target:any, ...source:any[]):any; 
	
	/**
	 * Return a copy of the object only containing the whitelisted properties.
	 * 
	 * @param		{Object}	obj - Objects to copy properties from
	 * @param		{...string}	propName - Property names to copy 
	 * @returns		{Object}
	 */
	function pick(obj:any, ...propNames:string[]):any; 
	
	/**
	 * Return a copy of the object without the blacklisted properties.
	 * 
	 * @param		{Object}	obj - Object to copy
	 * @param		{...string}	propNames - Names of properties to omit
	 * @returns		{Object}
	 */
	function omit(obj:any, ...propNames:string[]):any;

	/**
	 * Fill in an object's missing properties by cloning the properties of the 
	 * source object(s) onto the target object, overwriting the target's
	 * property descriptors
	 * 
	 * @param		{Object}	obj - Object to populate
	 * @param		{...Object}	obj - Objects containing default values
	 * @returns		{Object}
	 * @see			conbo.setDefaults
	 */
	function defineDefaults(target:any, ...sources:any[]):any;
	
	/**
	 * Fill in missing values on an object by setting the property values on 
	 * the target object, without affecting the target's property descriptors
	 * 
	 * @param		{Object}	target - Object to populate
	 * @param		{...Object}	sources - Objects containging default values
	 * @returns		{Object}
	 */
	function setDefaults(target:any, ...sources:any[]):any; 
	
	/**
	 * Create a (shallow-cloned) duplicate of an object.
	 * 
	 * @param		{Object}	obj - Object to clone
	 * @returns		{Object}
	 */
	function clone(obj:any):any; 

	/**
	 * Perform a deep comparison to check if two objects are equal.
	 * 
	 * @param		{Object}	a - Object to compare
	 * @param		{Object}	b - Object to compare
	 * @returns		{boolean}
	 */
	function isEqual(a:any, b:any):boolean; 

	/**
	 * Is the value empty?
	 * Based on PHP's `empty()` method
	 * 
	 * @param		{any}		value - Value that might be empty
	 * @returns		{boolean}
	 */
	function isEmpty(value:any):boolean;
	
	/**
	 * Can the value be iterated using a for loop? For example an Array, Arguments, ElementsList, etc.
	 * 
	 * @param		{any}		obj - Object that might be iterable 
	 * @returns		{boolean}
	 */
	function isIterable(obj:any):boolean;
	
	/**
	 * Is a given value a DOM element?
	 * 
	 * @param		{Object}	obj - Value that might be a DOM element
	 * @returns		{boolean}
	 */
	function isElement(obj:any):boolean;
	
	/**
	 * Is a given value an array?
	 * Delegates to ECMA5's native Array.isArray
	 * 
	 * @deprecated	Use Array.isArray
	 * @param		{Object}	obj - Value that might be an Array
	 * @returns		{boolean}
	 */
	function isArray(obj:any):boolean;

	/**
	 * Is a given variable an object?
	 * 
	 * @param		{Object}	obj - Value that might be an Object
	 * @returns		{boolean}
	 */
	function isObject(obj:any):boolean;

	/**
	 * Is the specified object Arguments?
	 * 
	 * @param		{Object}	obj - The object to test
	 * @returns		{boolean}
	 */
	function isArguments(obj:any):boolean;
	 
	/**
	 * Is the specified object a Function?
	 * 
	 * @param		{Object}	obj - The object to test
	 * @returns		{boolean}
	 */
	function isFunction(obj:any):boolean;
	
	/**
	 * Is the specified object a String?
	 * 
	 * @param		{Object}	obj - The object to test
	 * @returns		{boolean}
	 */
	function isString(obj:any):boolean;
	
	/**
	 * Is the specified object a Number?
	 * 
	 * @param		{Object}	obj - The object to test
	 * @returns		{boolean}
	 */
	function isNumber(obj:any):boolean;
	
	/**
	 * Is the specified object a Date?
	 * 
	 * @param		{Object}	obj - The object to test
	 * @returns		{boolean}
	 */
	function isDate(obj:any):boolean;
	
	/**
	 * Is the specified object a RegExp (regular expression)?
	 * 
	 * @param		{Object}	obj - The object to test
	 * @returns		{boolean}
	 */
	function isRegExp(obj:any):boolean;
	
	/**
	 * Detects whether the specified property was defined as a function, meaning
	 * accessors containing functions are excluded
	 * 
	 * @see			#isFunction
	 * @param		{Object}	obj - Object containing the property
	 * @param		{string}	propName - The name of the property
	 * @returns		{boolean}	true if it's a function
	 */
	function isFunc(obj:any, propName:string):boolean;
	
	/**
	 * Is a given object a finite number?
	 * 
	 * @param		{Object}	obj - Value that might be finite
	 * @returns		{boolean}
	 */
	function isFinite(obj:any):boolean;

	/**
	 * Is the given value `NaN`? (NaN is the only number which does not equal itself).
	 * 
	 * @param		{Object}	obj - Value that might be NaN
	 * @returns		{boolean}
	 */
	function isNaN(obj:any):boolean;

	/**
	 * Is a given value a boolean?
	 * 
	 * @param		{Object}	obj - Value that might be a Boolean
	 * @returns		{boolean}
	 */
	function isBoolean(obj:any):boolean;

	/**
	 * Is a given value equal to null?
	 * 
	 * @param		{Object}	obj - Value that might be null
	 * @returns		{boolean}
	 */
	function isNull(obj:any):boolean;

	/**
	 * Is a given variable undefined?
	 * 
	 * @param		{Object}	obj - Value that might be undefined
	 * @returns		{boolean}
	 */
	function isUndefined(obj:any):boolean;

	/**
	 * Is the given value numeric? i.e. a number of a string that can be coerced into a number
	 * 
	 * @param		{any}		value - Value that might be numeric
	 * @returns		{boolean}
	 */
	function isNumeric(value:any):boolean;

	/**
	 * Shortcut function for checking if an object has a given property directly
	 * on itself (in other words, not on a prototype).
	 * 
	 * @deprecated	Use Object.prototype.hasOwnProperty
	 * @param		{Object}	obj - Object
	 * @param		{string}	key - Property name
	 * @returns		{boolean}
	 */
	function has(obj:any, key:string):boolean;

	/**
	 * Keep the identity function around for default iterators.
	 * 
	 * @param		{any}		obj - Value to return
	 * @returns		{any}
	 */
	function identity(value:any):any;
	
	/**
	 * Get the property value
	 * 
	 * @param		{string}	key - Property name
	 * @returns		{Function}
	 */
	function property(key:string):Function;

	/**
	 * Returns a predicate for checking whether an object has a given set of `key:value` pairs.
	 * 
	 * @param		{Object}	attrs - Object containing key:value pairs to compare
	 * @returns		{Function}
	 */
	function matches(attrs:any):Function
	
	/**
	 * Return a random integer between min and max (inclusive).
	 * 
	 * @param		{number}	min - Minimum number
	 * @param		{number}	max - Maximum number
	 * @returns		{number}
	 */
	function random(min:number, max:number):number;

	/**
	 * Generate a unique integer id (unique within the entire client session).
	 * Useful for temporary DOM ids.
	 * 
	 * @param		{string}	[prefix] - String to prefix unique ID with
	 * @returns		{string}
	 */
	function uniqueId(prefix?:string):string; 
	
	/**
	 * Generates a version 4 RFC4122 UUID
	 * @returns		{string}
	 */
	function guid():string; 
	
	/**
	 * Is Conbo supported by the current browser?
	 * @type		{boolean}
	 */
	const isSupported:boolean;
	
	/**
	 * Is this script being run using Node.js?
	 * @type		{boolean}
	 */
	const isNodeJS:boolean;
	
	/**
	 * A function that does nothing
	 */
	const noop:Function; 
	
	/**
	 * Default function to assign to the methods of pseudo-interfaces
	 * @example	IExample = { myMethod:conbo.notImplemented };
	 */
	const notImplemented:Function; 
	
	/**
	 * Convert dash-or_underscore separated words into camelCaseWords
	 * 
	 * @param		{string}	string - underscore_case_string to convertToCamelCase
	 * @param		{boolean}	[initCap=false] - Should the first letter be a CapitalLetter? (default: false)
	 * @returns		{string}
	 */
	function toCamelCase(string:string, initCap?:boolean):string;
	
	/**
	 * Convert camelCaseWords into underscore_case_words (or another user defined separator)
	 * 
	 * @param		{string}	string - camelCase string to convert to underscore_case
	 * @param		{string}	[separator=_] - Default: "_"
	 * @returns		{string}
	 */
	function toUnderscoreCasefunction(string:string, separator?:string):string;
	
	/**
	 * Convert camelCaseWords into kebab-case-words
	 * 
	 * @param		{string}	string - camelCase string to convert to underscore_case
	 * @returns		{string}
	 */
	function toKebabCase(string:string):string;
	
	/**
	 * Pads a string with the specified character to the specified length
	 * 
	 * @param		{number|string}	value - String to pad
	 * @param		{number}		[minLength=2] - Minimum length of the padded string
	 * @param		{number|string}	[padChar= ] - The character to use to pad the string
	 * @returns		{string}
	 */
	function padLeft(value:number|string, minLength?:number, padChar?:number|string):string;
	
	/**
	 * Add a leading zero to the specified number and return it as a string
	 * 
	 * @param		{number}	number - The number to add a leading zero to
	 * @param		{number}	[minLength=2] - the minumum length of the returned string (default: 2)
	 * @returns		{string}
	 */
	function addLeadingZero(number:number, minLength?:number):string;
	
	/**
	 * Format a number using the selected number of decimals, using the 
	 * provided decimal point, thousands separator 
	 * 
	 * @see 		http://phpjs.org/functions/number_format/
	 * @param 		number
	 * @param 		decimals				default: 0
	 * @param 		decimalPoint			default: '.'
	 * @param 		thousandsSeparator		default: ','
	 * @returns		{string}				Formatted number
	 */
	function formatNumber(number:number, decimals?:number, decimalPoint?:string, thousandsSeparator?:string):string; 
	
	/**
	 * Format a number as a currency
	 * 
	 * @param 		{number}	number
	 * @param 		{string}	[symbol]
	 * @param 		{boolean}	[suffixed]
	 * @param 		{number}	[decimals]
	 * @param 		{string}	[decimalPoint]
	 * @param 		{string}	[thousandsSeparator]
	 * @returns		{string}
	 */
	function formatCurrency(number:number, symbol?:string, suffixed?:boolean, decimals?:number, decimalPoint?:string, thousandsSeparator?:string):string;
	
	/**
	 * Encodes all of the special characters contained in a string into HTML 
	 * entities, making it safe for use in an HTML document
	 * 
	 * @param 		{string}	string - String to encode
	 * @returns		{string}
	 */
	function encodeEntities(string:string):string;
	
	/**
	 * Decodes all of the HTML entities contained in an string, replacing them with
	 * special characters, making it safe for use in plain text documents
	 * 
	 * @param 		{string}	string - String to dencode
	 * @returns		{string}
	 */
	function decodeEntities(string:string):string;
	
	/**
	 * Copies all of the enumerable values from one or more objects and sets
	 * them to another, without affecting the target object's property
	 * descriptors. Unlike Object.assign(), the properties copied are not
	 * limited to own properties.
	 * 
	 * Unlike conbo.defineValues, assign only sets the values on the target 
	 * object and does not destroy and redifine them.
	 * 
	 * @param		{Object}	target - Object to copy properties to
	 * @param		{...Object}	source - Object to copy properties from
	 * @returns		{Object}
	 * 
	 * @example	
	 * conbo.assign({id:1}, {get name() { return 'Arthur'; }}, {get age() { return 42; }});
	 * => {id:1, name:'Arthur', age:42}
	 */
	function assign(target:any, ...sources:any[]):any;
	
	/**
	 * Copies all of the enumerable values from one or more objects and sets
	 * them to another, without affecting the target object's property
	 * descriptors. Unlike Object.assign(), the properties copied are not
	 * limited to own properties.
	 * 
	 * Unlike conbo.defineValues, setValues only sets the values on the target 
	 * object and does not destroy and redifine them.
	 * 
	 * @param		{Object}	target - Object to copy properties to
	 * @param		{...Object}	source - Object to copy properties from
	 * @returns		{Object}
	 * @deprecated	Use conbo.assign
	 * 
	 * @example	
	 * conbo.setValues({id:1}, {get name() { return 'Arthur'; }}, {get age() { return 42; }});
	 * => {id:1, name:'Arthur', age:42}
	 */
	function setValues(target:any, ...sources:any[]):any;
	
	/**
	 * Is the value a Conbo class?
	 * 
	 * @param		{any}		value - Value that might be a class
	 * @param		{class}		[classReference] - The Conbo class that the value must match or be an extension of 
	 * @returns		{boolean}
	 */
	function isClass(value:any, classReference?:any):boolean;
	
	/**
	 * Copies a property, including defined properties and accessors, 
	 * from one object to another
	 * 
	 * @param		{Object}	source - Source object
	 * @param		{string}	sourceName - Name of the property on the source
	 * @param		{Object}	target - Target object
	 * @param		{string} 	[targetName] - Name of the property on the target (default: sourceName)
	 * @returns		{conbo}
	 */
	function cloneProperty(source:any, sourceName:string, target:any, targetName?:string):any;
	
	/**
	 * Sorts the items in an array according to one or more fields in the array. 
	 * The array should have the following characteristics:
	 * 
	 * <ul>
	 * <li>The array is an indexed array, not an associative array.</li>
	 * <li>Each element of the array holds an object with one or more properties.</li>
	 * <li>All of the objects have at least one property in common, the values of which can be used to sort the array. Such a property is called a field.</li>
	 * </ul>
	 * 
	 * @param		{any[]}		array - The Array to sort
	 * @param		{string}	fieldName - The field/property name to sort on
	 * @param		{Object}	[options] - Optional sort criteria: `descending` (Boolean), `caseInsensitive` (Boolean)
	 * @returns		{any[]}
	 */
	function sortOn(array:any[], fieldName:string, options?:any):any[];
	
	/**
	 * Performs a comparison of an object against a class, returning true if 
	 * the object is an an instance of the specified class.
	 * 
	 * Unlike the native instanceof, however, this method works with both 
	 * native and user defined classes.
	 * 
	 * @param		{Object}				obj - The class instance
	 * @param		{conbo.Class|function}	clazz - The class to compare against
	 * @example								var b = conbo.instanceOf(69, String);
	 * @example								var b = conbo.instanceOf(user, UserClass);
	 * @returns		{boolean}
	 */
	function instanceOf(obj:any, clazz:any):boolean;
	
	/**
	 * Performs a comparison of an object against a class or interface, returning 
	 * true if the object is an an instance of the specified class or an 
	 * implementation of the specified interface
	 * 
	 * @param		{Object}				obj - The object to compare
	 * @param		{conbo.Class|object}	classOrInterface - The class or pseudo-interface to compare against
	 * @param		{boolean}				strict - Perform a strict interface comparison (default: true)
	 * @example								var b = conbo.is(user, UserClass);
	 * @example								var b = conbo.is(user, IUser);
	 * @example								var b = conbo.is(user, partial, false);
	 * @returns		{boolean}
	 */
	function is(obj:any, classOrInterface:any, strict?:boolean):boolean;
	
	/**
	 * Loads a CSS file and applies it to the DOM
	 * 
	 * 
	 * @param 		{string}	url		The CSS file's URL
	 * @param 		{string}	[media]	The media attribute (defaults to 'all')
	 * @returns		{Promise}
	 */
	function loadCss(url:string, media?:string):Promise<any>;
	
	/**
	 * Load a JavaScript file and executes it
	 * 
	 * @param 		{string}	url - The JavaScript file's URL
	 * @param 		{Object}	[scope] - The scope in which to run the loaded script
	 * @returns		{Promise}
	 */
	function loadScript(url:string, scope?:any):Promise<any>;
	
	/**
	 * Makes the specified properties of an object bindable; if no property 
	 * names are passed, all variables will be made bindable
	 * 
	 * 
	 * @see 		#makeAllBindable
	 * 
	 * @param		{Object}		obj
	 * @param		{string[]}		[propNames]
	 * @returns		{conbo}
	 */
	function makeBindable(obj:any, propNames?:string[]):any;
	
	/**
	 * Makes all existing properties of the specified object bindable, and 
	 * optionally creates additional bindable properties for each of the property 
	 * names in the propNames array
	 * 
	 * @see 		#makeBindable
	 * @param		{string}		obj
	 * @param		{string[]}		[propNames]
	 * @returns		{conbo}
	 */
	function makeAllBindable(obj:any, propNames?:string[]):any;
	
	/**
	 * Is the specified property an accessor (defined using a getter and/or setter)?
	 * 
	 * 
	 * @param		{Object}	Object containing the property
	 * @param		{string}	The name of the property
	 * @returns		{boolean}
	 */
	function isAccessor(obj:any, propName:string):boolean;
	
	/**
	 * Is the specified function native?
	 * 
	 * @param		{Function}	func - The function that might be native
	 * @returns		{boolean}	true if it's native, false if it's user defined
	 */
	function isNative(value:any):boolean; 
	
	/**
	 * Parse a template
	 * 
	 * @param		{string}	template - A string containing property names in {{moustache}} or ${ES2015} format to be replaced with property values
	 * @param		{Object}	[data] - An object containing the data to be used to populate the template 
	 * @returns		{string}	The populated template
	 */
	function parseTemplate(template:string, data?:any):string;
	
	/**
	 * Converts a template string into a pre-populated templating method that can 
	 * be evaluated for rendering.
	 * 
	 * @param		{string}	template - A string containing property names in {{moustache}} or ${ES2015} format to be replaced with property values
	 * @param		{Object}	[defaults] - An object containing default values to use when populating the template
	 * @returns		{Function}	A function that can be called with a data object, returning the populated template
	 */
	function compileTemplate(template:string, defaults?:any):Function;
	
	/**
	 * Serialise an Object as a query string  suitable for appending to a URL 
	 * as GET parameters, e.g. foo=1&bar=2
	 * 
	 * @param		{Object}	obj	- The Object to encode
	 * @returns		{string}	The URL encoded string 
	 */
	function toQueryString(obj:any):string;
	
	/**
	 * Returns the value of the property matching the specified name, optionally
	 * searching for a case insensitive match. This is useful when extracting 
	 * response headers, where the case of properties such as "Content-Type" 
	 * cannot always be predicted
	 * 
	 * @param		{Object}	obj - The object containing the property
	 * @param		{string}	propName - The property name
	 * @param		{boolean}	[caseSensitive=true] - Whether to search for a case-insensitive match (default: true)
	 * @returns		{any}		The value of the specified property
	 */
	function getValue(obj:any, propName:string, caseSensitive?:boolean):any;
	
	/**
	 * Prepare data for submission to web services.
	 * 
	 * If no toJSON method is present on the specified Object, this method 
	 * returns a version of the object that can easily be converted into JSON, 
	 * made up of its own properties with all functions, unenumerable and 
	 * private properties removed.
	 * 
	 * This method can be assigned to an Object or Array as the toJSON method 
	 * for use with JSON.stringify().
	 * 
	 * @param		{any}			obj - Object to convert
	 * @param		{boolean}		[deep=false] - Retrieve keys from further up the prototype chain?
	 * @returns		{any}			JSON ready version of the object
	 * 
	 * @example
	 * conbo.jsonify(myObj); // Defers to myObj.toJSON() if it exists
	 * conbo.jsonify.call(myObj); // Ignores myObj.toJSON(), even if it exists
	 * myObj.toJSON = conbo.jsonify; // Assign this method to your Object
	 */
	function jsonify(obj:any, deep?:boolean):any;
	
	/**
	 * Should Conbo output data to the console when calls are made to loggin methods?
	 * @type		{boolean}
	 * @example
	 * conbo.logEnabled = false;
	 * conbo.log('Blah!'); // Nothing will be displayed in the console
	 */
	let logEnabled:boolean;
	
	/**
	 * Add a log message to the console
	 * @param		{...any}		values - Values to display in the console	
	 * @returns		{void}
	 */
	function log(...values:any[]):void;
	
	/**
	 * Add a warning message to the console
	 * @param		{...any}		values - Values to display in the console	
	 * @returns		{void}
	 */
	function warn(...values:any[]):void;
	
	/**
	 * Add information to the console
	 * @param		{...any}		values - Values to display in the console	
	 * @returns		{void}
	 */
	function info(...values:any[]):void;
	
	/**
	 * Add an error log message to the console
	 * @param		{...any}		values - Values to display in the console	
	 * @returns		{void}
	 */
	function error(...values:any[]):void;
	

	// Decorators

	/**
	 * Decorator for adding Application, View and Glimpse classes a ConboJS namespace to enable auto instantiation
	 * @param	{string}	namespace - The name of the target namespace
	 * @param	{string}	[name] - The name to use for this object in the target namespace (useful if you target ES5 and minify your code)
	 * @returns	{Function}	TypeScript decorator
	 */
	function Viewable(namespace:string, name?:string):Function; 
	
	/**
	 * Decorator to make a property bindable
	 * @param	{any}		target - The target object
	 * @param	{string}	key - The name of the property
	 */
	function Bindable(target:any, key:string):void;

	/**
	 * Decorator to prepare a property for injection
	 * @param	{any}		target - The target object
	 * @param	{string}	key - The name of the property
	 */
	function Inject(target:any, key:string):void;


	// Polyfills

	interface Thenable <R> 
	{
		then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>):Thenable<U>;
		then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void):Thenable<U>;
	}
	
	class Promise<R> implements Thenable<R>
	{
		/**
		 * If you call resolve in the body of the callback passed to the constructor,
		 * your promise is fulfilled with result object passed to resolve.
		 * If you call reject your promise is rejected with the object passed to resolve.
		 * For consistency and debugging (eg stack traces), obj should be an instanceof Error.
		 * Any errors thrown in the constructor callback will be implicitly passed to reject().
		 */
		constructor(callback:(resolve : (value?: R | Thenable<R>) => void, reject:(error?: any) => void) => void);
	
		/**
		 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
		 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
		 * Both callbacks have a single parameter , the fulfillment value or rejection reason.
		 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
		 * If an error is thrown in the callback, the returned promise rejects with that error.
		 *
		 * @param onFulfilled called when/if "promise" resolves
		 * @param onRejected called when/if "promise" rejects
		 */
		then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>):Promise<U>;
		then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void):Promise<U>;
	
		/**
		 * Sugar for promise.then(undefined, onRejected)
		 *
		 * @param onRejected called when/if "promise" rejects
		 */
		catch<U>(onRejected?: (error: any) => U | Thenable<U>):Promise<U>;
	
		/**
		 * onSettled is invoked when/if the "promise" settles (either rejects or fulfills);
		 *
		 * @param onFinally called when/if "promise" settles
		 */
		finally<U>(onFinally?: (callback: any) => U | Thenable<U>):Promise<U>;
	
		/**
		 * Make a new promise from the thenable.
		 * A thenable is promise-like in as far as it has a "then" method.
		 */
		static resolve():Promise<void>;
		static resolve<R>(value: R | Thenable<R>):Promise<R>;
	
		/**
		 * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
		 */
		static reject<R>(error: any):Promise<R>;
	
		/**
		 * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects.
		 * the array passed to all can be a mixture of promise-like objects and other objects.
		 * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
		 */
		static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>, T9 | Thenable<T9>, T10 | Thenable<T10>]):Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
		static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>, T9 | Thenable<T9>]):Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
		static all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>]):Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
		static all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>]):Promise<[T1, T2, T3, T4, T5, T6, T7]>;
		static all<T1, T2, T3, T4, T5, T6>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>]):Promise<[T1, T2, T3, T4, T5, T6]>;
		static all<T1, T2, T3, T4, T5>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>]):Promise<[T1, T2, T3, T4, T5]>;
		static all<T1, T2, T3, T4>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>]):Promise<[T1, T2, T3, T4]>;
		static all<T1, T2, T3>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>]):Promise<[T1, T2, T3]>;
		static all<T1, T2>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>]):Promise<[T1, T2]>;
		static all<T1>(values: [T1 | Thenable<T1>]):Promise<[T1]>;
		static all<TAll>(values: Array<TAll | Thenable<TAll>>):Promise<TAll[]>;
	
		/**
		 * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
		 */
		static race<R>(promises: (R | Thenable<R>)[]):Promise<R>;
	}

}
