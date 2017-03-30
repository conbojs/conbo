/**
 * ConboJS utility method tests
 */

var assert = chai.assert;

var id1 = {id:1};
var id2 = {id:2};
var id3 = {id:3};
var objects = [id1, id2, id3];
var mixed = [0, 1, "2", "three", id1, id2, true, false, null, undefined, objects];
var same = [true, true, false, false, 1, 1, 2, 2];

describe('Utility methods', function() {
	// TODO forEach
	// TODO map
	describe('find()', function() {
		it('should find an Object with id=3', function() {
			var predicate = function(obj) { return obj.id == 3; };
			assert.equal(3, conbo.find(objects, predicate).id);
		});
	});
	describe('findIndex()', function() {
		it('should find an object at index 2', function() {
			var predicate = function(obj) { return obj.id == 3; };
			assert.equal(2, conbo.findIndex(objects, predicate));
		});
	});
	describe('filter()', function() {
		it('should leave 2 objects', function() {
			var predicate = function(obj) { return !!(obj.id%2); };
			assert.equal(2, conbo.filter(objects, predicate).length);
		});
	});
	describe('reject()', function() {
		it('should reject 1 objects', function() {
			var predicate = function(obj) { return !!(obj.id%2); };
			assert.equal(1, conbo.reject(objects, predicate).length);
		});
	});
	describe('every()', function() {
		it('should find that none of the objects have id=0', function() {
			var predicate = function(obj) { return obj.id != 0; };
			assert.equal(true, conbo.every(objects, predicate));
		});
	});
	describe('max()', function() {
		it('should find that maximum is {id:3}', function() {
			var iterator = function(obj) { return obj.id; };
			assert.equal(3, conbo.max(objects, iterator).id);
		});
	});
	describe('min()', function() {
		it('should find that minimum is {id:1}', function() {
			var iterator = function(obj) { return obj.id; };
			assert.equal(1, conbo.min(objects, iterator).id);
		});
	});
	describe('shuffle()', function() {
		it('Array should be shuffled', function() {
			assert.notDeepEqual(mixed, conbo.shuffle(mixed));
		});
	});
	describe('toArray()', function() {
		it('Arguments object is not an Array', function() {
			assert.notTypeOf(arguments, 'array');
		});
		it('Arguments object has been converted into an Array', function() {
			assert.typeOf(conbo.toArray(arguments), 'array');
		});
	});
	describe('size()', function() {
		it('{id:1} has 1 element', function() {
			assert.equal(1, conbo.size(id1));
		});
	});
	describe('last()', function() {
		it('the last element should be {id:3}', function() {
			assert.equal(3, conbo.last(objects).id);
		});
	});
	describe('rest()', function() {
		it('should return 2 items', function() {
			assert.equal(2, conbo.rest(objects).length);
		});
	});
	describe('compact()', function() {
		it('should return 7 items', function() {
			assert.equal(7, conbo.compact(mixed).length);
		});
	});
	describe('flatten()', function() {
		it('flattened Array should contain 13 items', function() {
			assert.equal(13, conbo.flatten(mixed).length);
		});
	});
	describe('without()', function() {
		it('An Array of 3 items should have 2 items when one is removed', function() {
			assert.equal(2, conbo.without(objects, id1).length);
		});
	});
	describe('partition()', function() {
		it('Array should be partitioned into an Arrays of length 2 and 1', function() {
			var predicate = function(obj) { return !!(obj.id%2); };
			assert.equal(2, conbo.partition(objects, predicate)[0].length);
		});
	});
	describe('uniq()', function() {
		it('there should be 4 unique items', function() {
			var predicate = function(obj) { return !!(obj.id%2); };
			assert.equal(4, conbo.uniq(same).length);
		});
	});
	
	// TODO all the other utility methods...
});
