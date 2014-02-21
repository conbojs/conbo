Conbo.js
========

Conbo.js is a lightweight MVC application framework for JavaScript featuring extendible classes, event bus, dependency injection, data binding, context and encapsulation, command pattern and an event model which enables consistent, scoped event handling.

Conbo.js enables JavaScript developers a take a structured, decoupled, class based approach to application development, in a way that should be be familiar to anyone with experience of languages like ActionScript or Java.

Development of Conbo.js is currently focussed on its use in client side apps, including single page applications (SPA) and self-contained modules like widgets and media players, where it can be used stand-alone or as an AMD module. However, it can also be used with Node.js on the server (NPM installer coming soon).

Brief History
-------------

Conbo started life as a [con]text and [con]troller add-on for Back[bo]ne.js, but as more of Backbone.js was removed, replaced or updated, the project took on a life of its own and what remained of Backbone.js was merged in, and Conbo.js was born.

With the exception of the base Class and parts of View, the Core release of Conbo.js contains now very little code derived from Backbone.js, although we have largely retained method syntax for consistency.

Dependencies
------------

**Client-side**: jQuery 1.7+, Lo-Dash or Underscore.js 1.4+

**Server-side**: Lo-Dash or Underscore.js 1.4+

Unless you have a good reason for using Underscore.js, we recommend using Lo-Dash as we've found it's more consistent between releases (updates are generally drop-in replacements, Underscore.js not so much) and it supports AMD out of the box.

In the future, dependencies will most likely be reduced to the point where they're either optional or only minimal custom builds are required.

Builds
------

**Core** (38KB uncompressed, 4KB minified+gzipped): Core framework for applications that don't require web service functionality baked in.

**Complete** (83KB uncompressed, 9KB minified+gzipped): Complete framework, including syncable Collection, Model, History and Router derived from Backbone.js classes of the same name.

Builds are created using Grunt, which requires Node.js; all required modules can be installed by running "npm install" from the command line in the project folder.

The builds listed above can be created using the command "grunt". Use "grunt watch", or run watch.cmd, to auto-build as you edit.
