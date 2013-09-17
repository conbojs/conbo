Conbo.js
========

Conbo.js is a lightweight MVC application framework for JavaScript featuring extendible classes, dependency injection, data binding, context and encapsulation, command pattern and an event model which enables consistent, scoped event handling.

Development of Conbo.js is currently focussed on its use in client side apps, including single page applications (SPA) and self-contained modules like widgets and media players, where it can be used either stand-alone or as an AMD module, but it can also be used as a Node.js module on the server (NPM installer coming soon).

Dependencies
------------

Client-side: jQuery 1.7.0+, Lo-Dash or Underscore.js 1.4+

Server-side: Lo-Dash or Underscore.js 1.4+

Over time, we're hoping to reduce dependencies to the point where they're either optional or only a minimal custom build is required.

History
-------

Conbo started life as a context and controller add-on for Backbone.js, but as more of Backbone.js was removed, replaced or otherwise hacked into, the project took on a life of its own, what remained of Backbone.js was merged in and Conbo.js was born. 

Builds
------

Core (38KB uncompressed, 4KB minified+gzipped): Core framework for applications that don't require web service functionality baked in.

Complete (83KB uncompressed, 9KB minified+gzipped): Complete framework, including syncable Collection, Model, History and Router derived from Backbone.js classes of the same name.

Windows build script requires Microsoft Ajax Minifier: http://ajaxmin.codeplex.com/.
