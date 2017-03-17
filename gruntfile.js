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
					// conbo-lite.js
					
					'lib/conbo-lite.js':
					[
					 	'src/conbo/header.txt',
					 	'src/conbo/conbo.js',
					 	'src/conbo/utils/internal.js',
					 	'src/conbo/utils/utils.js',
					 	'src/conbo/core/Class.js',
					 	'src/conbo/core/ConboClass.js',
					 	'src/conbo/core/Namespace.js',
						'src/conbo/core/ServerApplication.js',
						'src/conbo/events/Event.js',
						'src/conbo/events/ConboEvent.js',
						'src/conbo/events/EventDispatcher.js',
						'src/conbo/data/Hash.js',
						'src/conbo/data/LocalHash.js',
					 	'src/conbo/utils/Promise.js',
						'src/conbo/view/Glimpse.js',
						'src/conbo/footer.txt'
					],
					
					// conbo.js
					
					'lib/conbo.js':
					[
						'src/conbo/header.txt',
					 	'src/conbo/conbo.js',
					 	'src/conbo/utils/internal.js',
					 	'src/conbo/utils/utils.js',
					 	'src/conbo/utils/dom.js',
					 	'src/conbo/utils/css.js',
					 	'src/conbo/core/Class.js',
					 	'src/conbo/core/ConboClass.js',
					 	'src/conbo/core/Namespace.js',
					 	'src/conbo/core/IInjectable.js',
					 	'src/conbo/core/IPreinitialize.js',
						'src/conbo/events/Event.js',
						'src/conbo/events/ConboEvent.js',
						'src/conbo/events/EventDispatcher.js',
						'src/conbo/events/EventProxy.js',
						'src/conbo/core/Context.js',
						'src/conbo/data/Hash.js',
						'src/conbo/data/LocalHash.js',
						'src/conbo/collections/List.js',
						'src/conbo/collections/LocalList.js',
						'src/conbo/binding/AttributeBindings.js',
						'src/conbo/binding/BindingUtils.js',
						'src/conbo/utils/MutationObserver.js',
					 	'src/conbo/utils/Promise.js',
					 	'src/conbo/view/ElementProxy.js',
					 	'src/conbo/view/IDataRenderer.js',
						'src/conbo/view/Glimpse.js',
						'src/conbo/view/View.js',
						'src/conbo/view/ItemRenderer.js',
						'src/conbo/core/Application.js',
						'src/conbo/core/Command.js',
						'src/conbo/net/httpRequest.js',
						'src/conbo/net/HttpService.js',
						'src/conbo/net/ISyncable.js',
						'src/conbo/data/RemoteHash.js',
						'src/conbo/collections/RemoteList.js',
						'src/conbo/net/History.js',
						'src/conbo/net/Router.js',
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
					screw_ie8: true,
					toplevel: true
				},
				
				compress:
				{
					screw_ie8: true,
					negate_iife: true
				}
			},
			
			lite: 
			{
				src: 'lib/conbo-lite.js',
				dest: 'lib/conbo-lite.min.js'
			},
			
			complete:
			{
				src: 'lib/conbo.js',
				dest: 'lib/conbo.min.js',
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
				src: ['lib/conbo.js'],
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
					'lib/conbo.js': 'lib/conbo.js',
					'lib/conbo-lite.js': 'lib/conbo-lite.js',
					'bower.json': 'bower.json'
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
						}
					]
				}
			}
		},
		
	});
	
//	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-string-replace');
	
	grunt.registerTask('default', ['concat','string-replace','uglify']);//,'jsdoc']);
};
