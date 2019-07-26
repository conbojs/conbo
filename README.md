![ConboJS Conbine](https://raw.githubusercontent.com/mesmotronic/conbo/master/img/conbo.png)

ConboJS Conbine ("Conbine") is a subset of ConboJS for use in combination with your preferred view framework, including [React](https://github.com/mesmotronic/conbo-example-react), or server-side applications using Node.js.

The library enables developers to add features including dependency injection, event bus and command pattern, supported by an easy to use event model and optional ES2015/TypeScript decorators, while only adding around 11KB (minified and gzipped) to your project.

Browser support
---------------

Conbine supports all modern browsers, including Firefox, Chrome (desktop and Android), Safari (desktop and iOS) and Edge... and Internet Explorer 11.

Supports ES2015 & TypeScript
----------------------------

Conbine supports ES2015 and TypeScript `import` syntax and decorators:

```javascript
import { LocalHash } from 'conbine';

class MyStorage extends LocalHash
{
	@Bindable public name:string;
}

```

Installation
------------

You can add Conbine to your project using NPM:

```
npm i --save conbine
```

Dependency injection
--------------------

Conbine can be used to defined and inject singletons and constants into class instances:

```javascript
import context from '../context';

// ES2015
class MyClass
{
	constructor()
	{
		this.myModel = undefined;
		this.myService = undefined;

		context.inject(this);
	}
}

// TypeScript
class MyView extends View
{
	@Inject public myModel:MyModel;
	@Inject public myService:MyService;

	constructor()
	{
		context.inject(this);
	}
}

// Arbitrary access
const { myModel, myService } = context.inject({}, 'myModel', 'myService');
```


Pseudo-interfaces
-----------------

It's easy to test whether an object conforms to an interface.

Developers can perform a strict comparison against an interface by creating an object that specifies the class of each property, or `undefined` for any:

```javascript
var IPerson = { name: String, age: Number };
var person = { name: "Foo", age: 69 };

conbo.is(person, IPerson); // true
```

Consistent, scoped events
-------------------------

With ConboJS you don't have to remember how many arguments each event handler should have or the order they're supposed to be in, because there's a single, consistent DOM-like event model that offers predictable results, even enabling you to set the value to use as `this` when the callback is executed.

All events fired by the framework are `conbo.ConboEvent` event objects, and you can easily create events of your own by using or extending the `conbo.Event` class, for example:

```javascript
foo.addEventListener("myEvent", this.myFunction, this);
foo.dispatchEvent(new conbo.Event("myEvent"));
```

Decorators
----------

Conbine provides a number of class (ES2015 and TypeScript) and property (TypeScript only) decorators to resolve transpilation issues, simplify, enhance or simply provide syntactical sugar while developing applications:

```javascript
import { Bindable, Inject } from 'conbine';

class MyClass
{
	// Mark a property as injectable so you don't have to set it to undefined in declarations (TypeScript only)
	@Inject
	public myService:MyService;
	
	// Mark a property as bindable so you don't have to set it in declarations (TypeScript only)
	@Bindable
	public myValue:string = 'Hello, World!';
}
```

Naming conventions
------------------

The naming conventions used by ConboJS should be familiar to anyone who uses JavaScript or ActionScript on a regular basis:

* `ClassNames` are camel case with an initial capital letter
* `IInterfaceNames` are camel case with an initial capital letter, prefixed with a capital I
* `publicPropertyAndMethodNames` are camel case, starting with a lower case letter
* `_privatePropertyAndMethodNames` are user defined properties and methods used within the current class only, prefixed with an underscore
* `__internalPropertyAndMethodNames` are prefixed with a double underscore to indicate that they are for internal use by the framework only
* `CONSTANT_VALUES` are all upper case, with words separated using an underscore
* `@Decorators` are camel case with an initial capital letter, following the naming convention used for similar metadata and annotations in other languages

Wherever possible, file names should match their contents, for example `ClassName.js`, `methodName.js` or `IInterfaceName.ts`.

Builds
------

**conbine.js** (11KB minified+gzipped): Includes everything you need to add ConboJS features to yout next JavaScript application.

Builds are created using Grunt, which requires Node.js; all required modules can be installed by running `npm install` from the command line in the project folder.

You can create a new build from the CLI using `grunt`. Use `grunt watch`, or run `watch.cmd` (Windows) or `./watch.sh` (Mac, Linux) to auto-build as you edit.

License
-------

Conbine is released under MIT license.

**GitHub** https://github.com/mesmotronic/conbo

**Docs** https://conbo.mesmotronic.com/

Make a donation
---------------

If you find this project useful, why not buy us a coffee (or as many as you think it's worth)?

[![Make a donation](https://www.paypalobjects.com/en_US/GB/i/btn/btn_donateCC_LG.gif)](http://bit.ly/2GHiK2T)
