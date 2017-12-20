/**
 * Lightweight Promise polyfill based on promiscuous
 */
if (!window.Promise)
{
	(function(func, obj)
	{
		function is(type, item) { return (typeof item)[0] == type; }

		function Promise(callback, handler) 
		{
			handler = function pendingHandler(resolved, rejected, value, queue, then, i) 
			{
				queue = pendingHandler.q;

				if (resolved != is) 
				{
					return Promise(function(resolve, reject) {
						queue.push({ p: this, r: resolve, j: reject, 1: resolved, 0: rejected });
					});
				}

				if (value && (is(func, value) | is(obj, value))) 
				{
					try { then = value.then; }
					catch (reason) { rejected = 0; value = reason; }
				}

				if (is(func, then)) 
				{
					try { then.call(value, transferState(1), rejected = transferState(0)); }
					catch (reason) { rejected(reason); }
				}
				else 
				{
					handler = function(Resolved, Rejected) 
					{
						if (!is(func, (Resolved = rejected ? Resolved : Rejected))) return callback;
						return Promise(function(resolve, reject) { finalize(this, resolve, reject, value, Resolved); });
					};
					i = 0;
					while (i < queue.length) 
					{
						then = queue[i++];
						if (!is(func, resolved = then[rejected])) (rejected ? then.r : then.j)(value);
						else finalize(then.p, then.r, then.j, value, resolved);
					}
				}

				function transferState(resolved) 
				{
					return function(value) { then && (then = 0, pendingHandler(is, resolved, value)); };
				}
			};
			
			handler.q = [];

			callback.call(callback = 
				{
					then: function(resolved, rejected)
					{
						return handler(resolved, rejected); 
					},
					"catch": function(rejected)
					{
						return handler(0, rejected); 
					} 
				},
				function(value)
				{
					handler(is, 1,	value); 
				},
				function(reason)
				{
					handler(is, 0, reason);
				}
			);

			return callback;
		}

		function finalize(promise, resolve, reject, value, transform) 
		{
			setImmediate(function() 
			{
				try 
				{
					value = transform(value);
					transform = value && (is(obj, value) | is(func, value)) && value.then;
					if (!is(func, transform)) resolve(value);
					else if (value == promise) reject(TypeError());
					else transform.call(value, resolve, reject);
				}
				catch (error)
				{
					reject(error);
				}
			});
		}

		Promise.resolve = ResolvedPromise;
		
		function ResolvedPromise(value)
		{
			return Promise(function(resolve) { resolve(value); });
		}

		Promise.reject = function(reason)
		{
			return Promise(function(resolve, reject) { reject(reason); }); 
		};

		Promise.all = function(promises) 
		{
			return Promise(function(resolve, reject, count, values) 
			{
				values = [];
				count = promises.length || resolve(values);
				promises.map(function(promise, index) {
					ResolvedPromise(promise).then(
						function(value) 
						{
							values[index] = value;
							--count || resolve(values);
						},
						reject);
				});
			});
		};

		Promise.race = function(promises) 
		{
			return Promise(function(resolve, reject) 
			{
				promises.map(function(promise) {
					ResolvedPromise(promise).then(resolve, reject);
				});
			});
		};

		window.Promise = Promise;

	})('f', 'o');
}

conbo.Promise = window.Promise;
