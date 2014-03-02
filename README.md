Conbo.js
========

Conbo.js is a lightweight MVC application framework for JavaScript featuring extendible classes, event bus, dependency injection, data binding, context and encapsulation, command pattern and an event model which enables consistent, scoped event handling.

Conbo.js enables JavaScript developers a take a structured, decoupled, class based approach to application development, in a way that should be be familiar to anyone with experience of languages like ActionScript or Java.

Development of Conbo.js is currently focussed on its use in client side apps, including single page applications (SPA) and self-contained modules like widgets and media players, where it can be used stand-alone or as an AMD module.

While Conbo.js offers a great base for server-side Node.js applications, and we've created a specific ServerApplication class for this purpose, this is not a core development focus at present.

Brief History
-------------

Conbo started life as a [con]text and [con]troller add-on for Back[bo]ne.js, but as more of Backbone.js was removed, replaced or updated, the project took on a life of its own and what remained of Backbone.js was merged in, and Conbo.js was born.

With the exception of the base Class, the Core release of Conbo.js now contains very little code derived from Backbone.js, although method names have largely been retained for consistency and to ease the transition.

Extendible classes
------------------

There's no messing about with prototypes in Conbo.js, instead all of your classes extend from another, for example:

```javascript
var MyClass = conbo.Class.extend
({
	initialize: function()
	{
		console.log('Welcome to my class!');
	}
});
```

Decoupling & data binding
-------------------------

One of Conbo.js's core aims is to enable developers to create highly decoupled, testable code.

To this end, the framework's ever expanding data binding features enable you to separate your HTML from your JavaScript, removing the need for direct references between the them by using `cb-*` attributes to automatically bind properties and events in the DOM to your View classes, for example:

**In your View class**

```javascript
example.MyView = conbo.View.extend
({
	myButtonLabel: 'Click me!',
	
	myClickHandler: function(event)
	{
		alert('You clicked a button!');
	}
});
```

**In your HTML**

```html
<div cb-view="MyView">
	<button cb-onclick="myClickHandler" cb-html="myButtonLabel"></button>
</div>
```

Consistent event model
----------------------

You don't have to remember how many arguments each event handler should have, or in which order their in, because Conbo.js has a single, consistent event model that offers predictable results.

All events fired by the framework are `conbo.ConboEvent` event objects, and you can easily create events of your own by using or extending the `conbo.Event` class in the same way you would extend any other.

Dependencies
------------

**Client-side**: jQuery 1.7+, Lo-Dash or Underscore.js 1.4+

**Server-side**: Lo-Dash or Underscore.js 1.4+

We generally recommend Lo-Dash over Underscore.js because it supports AMD out of the box.

Builds
------

**Core** (38KB uncompressed, 4KB minified+gzipped): Core framework for applications that don't require web service functionality baked in.

**Complete** (83KB uncompressed, 9KB minified+gzipped): Complete framework, including syncable Collection, Model, History and Router derived from Backbone.js classes of the same name.

Builds are created using Grunt, which requires Node.js; all required modules can be installed by running "npm install" from the command line in the project folder.

The builds listed above can be created using the command "grunt". Use "grunt watch", or run watch.cmd (Windows) or ./watch.sh (Mac, Linux) to auto-build as you edit.
