module.exports = function (grunt) 
{
	grunt.initConfig
	({
		pkg: grunt.file.readJSON('package.json'),
		
		concat:
		{
			all:
			{
				files:
				{
					'lib/conbine.js':
					[
						'src/conbo/header.txt',
						'src/conbo/conbo.js',
					 	'src/conbo/polyfills/Promise.js',
					 	'src/conbo/utils/constants.js',
					 	'src/conbo/utils/internal.js',
					 	'src/conbo/utils/utils.js',
						'src/conbo/utils/decorators.js',
					 	'src/conbo/core/Class.js',
					 	'src/conbo/core/ConboClass.js',
					 	'src/conbo/core/Namespace.js',
					 	'src/conbo/core/IInjectable.js',
					 	'src/conbo/core/IPreinitialize.js',
						'src/conbo/events/Event.js',
						'src/conbo/events/DataEvent.js',
						'src/conbo/events/ConboEvent.js',
						'src/conbo/events/EventDispatcher.js',
						'src/conbo/core/HeadlessApplication.js',
						'src/conbo/core/Context.js',
						'src/conbo/data/Hash.js',
						'src/conbo/data/LocalHash.js',
						'src/conbo/collections/List.js',
						'src/conbo/collections/LocalList.js',
						'src/conbo/core/Command.js',
						'src/conbo/net/httpRequest.js',
						'src/conbo/net/HttpService.js',
						'src/conbo/net/ISyncable.js',
						'src/conbo/data/RemoteHash.js',
						'src/conbo/collections/RemoteList.js',
						'src/conbo/footer.txt'
					]
				}
			}
		},
		
		uglify: 
		{
			options:
			{
				mangle:
				{
					toplevel: true
				},
				
				compress:
				{
					negate_iife: true
				}
			},
			
			conbine:
			{
				src: 'lib/conbine.js',
				dest: 'lib/conbine.min.js',
				mangle: true
			}
		},
		
		watch: 
		{
			js: 
			{
				files: ['src/conbo/**/*.js', 'src/conbo/*.txt'],
				tasks: ['concat','string-replace','uglify']
			}
		},
		
		jsdoc:
		{
			dist: 
			{
				src: ['lib/conbine.js'],
				options: 
				{
					configure: 'jsdoc.json',
					destination: 'docs',
					readme: 'README.md',
					package: 'package.json',
					access: 'public'
				}
			}
		},
		
		'string-replace': 
		{
			version: 
			{
				files: 
				{
					'lib/conbine.js': 'lib/conbine.js',
					'index.html': 'index.html',
					'docs/': 'docs/conbine/**/index.html'
				},
				
				options: 
				{
					replacements: 
					[
						// JS
						{
							pattern: /{{VERSION}}/g,
							replacement: '<%= pkg.version %>'
						},
						// JSON
						{
							pattern: /\"version\": \"\d+.\d+.\d+\"/,
							replacement: '"version": "<%= pkg.version %>"'
						},
						// HTML
						{
							pattern: /docs\/conbine\/\d+.\d+.\d+\//,
							replacement: 'docs/conbine/<%= pkg.version %>/'
						},
						// Docs
						{
							pattern: /<title>JSDoc: Home<\/title>/,
							replacement: '<title>ConboJS Conbine 4 Documentation | Lightweight headless application framework for JavaScript | Made by Mesmotronic</title>'
						},							
						{
							pattern: /<h1 class=\"page-title\">Home<\/h1>/,
							replacement: '<h1 class="page-title">ConboJS Conbine 4</h1>'
						},
						{
							pattern: /<h3>conbine \d+.\d+.\d+<\/h3>/,
							replacement: ''
						}
					]
				}
			}
		},
		
	});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-string-replace');
	
	grunt.registerTask('default', ['concat','string-replace','uglify']);
	grunt.registerTask('build-watch', ['default','watch']);

};
