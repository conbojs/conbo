/**
 * Binding utility class
 * 
 * Used to bind properties of Bindable class instances to DOM elements, 
 * other Bindable class instances or setter functions
 * 
 * @author Neil Rackett
 */
conbo.BindingUtils = conbo.Class.extend({},
{
	/**
	 * Bind a property of a Bindable class instance  (e.g. Map or Model) 
	 * to a DOM element's value/content 
	 * 
	 * @param source			Class instance which extends from conbo.Bindable (e.g. Map or Model)
	 * @param property			Property name to bind
	 * @param element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param parseFunction		Optional method used to parse values before outputting as HTML
	 */
	bindElement: function(source, propertyName, element, parseFunction)
	{
		if (!(source instanceof conbo.Bindable)) throw new Error('Source is not Bindable');
		
		parseFunction = parseFunction || function(value)
			{ return typeof(value) == 'undefined' ? '' : String(value); };
		
		$(element).each(function(index, el)
		{
			var $el = $(el);
			var tagName = $el[0].tagName;
			
			switch (tagName)
			{
				case 'INPUT':
				case 'SELECT':
				case 'TEXTAREA':
				{	
					var type = ($el.attr('type') || tagName).toLowerCase();
					
					switch (type)
					{
						case 'checkbox':
						{
							$el.prop('checked', Boolean(source.get(propertyName)));
							
							source.on('change:'+propertyName, function(event)
							{
								$el.prop('checked', Boolean(event.value));
							});
							
							$el.on('input change', function(event)
							{	
								source.set(propertyName, $el.is(':checked'));
							});
							
							return;
						}
						
						case 'radio':
						{
							if ($el.val() == source.get(propertyName)) $el.prop('checked', true);
							
							source.on('change:'+propertyName, function(event)
							{
								if ($el.val() != event.value) return; 
								$el.prop('checked', true);
							});
							
							break;
						}
						
						default:
						{
							$el.val(source.get(propertyName));
						
							source.on('change:'+propertyName, function(event)
							{
								if ($el.val() == event.value) return;
								$el.val(event.value);
							});
							
							break;
						}
					}
					
					$el.on('input change', function(event)
					{	
						source.set(propertyName, $el.val() || $el.html());
					});
					
					break;
				}
				
				default:
				{
					$el.html(parseFunction(source.get(propertyName)));
					
					source.on('change:'+propertyName, function(event) 
					{
						var html = parseFunction(event.value);
						$el.html(html);
					});
					
					break;
				}
			}
			
		});
		
		return this;
	},
	
	/**
	 * Bind the property of one Bindable class instance (e.g. Map or Model) to another
	 * 
	 * @param source					Class instance which extends from conbo.Bindable
	 * @param sourcePropertyName		String
	 * @param destination				Class instance which extends from conbo.Bindable
	 * @param destinationPropertyName	String (default: sourcePropertyName)
	 * @param twoWay					Boolean (default: false)
	 */
	bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
	{
		if (!(source instanceof conbo.Bindable)) throw new Error('Source is not Bindable');
		
		destinationPropertyName = destinationPropertyName || sourcePropertyName;
		
		source.on('change:'+sourcePropertyName, function(event)
		{
			if (destination.get(destinationPropertyName) === event.value) return;
			destination.set(destinationPropertyName, event.value);
		});
		
		if (twoWay) this.bindProperty(destination, destinationPropertyName, source, sourcePropertyName);
		
		return this;
	},
	
	/**
	 * Call a setter function when the specified property of a Bindable 
	 * class instance (e.g. Map or Model) is changed
	 * 
	 * @param source			Class instance which extends from conbo.Bindable
	 * @param propertyName
	 * @param setterFunction
	 */
	bindSetter: function(source, propertyName, setterFunction)
	{
		if (!(source instanceof conbo.Bindable)) throw new Error('Source is not Bindable');
		
		source.on('change:'+propertyName, function(event)
		{
			setterFunction(event.value);
		});
		
		return this;
	}
	
});
