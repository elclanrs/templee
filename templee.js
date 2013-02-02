/*jshint expr:true */
/* Templee is a small API to create HTML content with a syntax similar to jQuery.
 * Author: Cedric Ruiz
 * License: MIT
 */
//---------------------------------------------------------------------
// Templee:
//---------------------------------------------------------------------

(function(win) {

  // Constructor
  function Templee(data) {
    this.data = data;
    this.length = this.data.length;
  }

  // Shortcut to create new instances of Templee
  function templee(data) {
    return new Templee(data);
  }

  function _curry(fn, that) {
    return function() {
      return fn.apply(that || arguments[0], [].slice.call(arguments));
    };
  }

  function _extend(obj, target) {
    for (var o in obj) target[o] = obj[o];
    return target;
  }

  function _mapAndJoin(arr, fn) {
    if (!arr) return;
    return arr.map(_curry(fn)).join('');
  }

  // Fill HTML templates from an array of objects
  // Example:
  //   var people = [{name: 'John', days: [1,10] }, {name: 'Mike', days: [4,8] }]
  //   var html = _template(people, ['<p>#{name} @{<span>={days}</span>}</p>'])
  function _template(arr, html) {

    var single = /#\{(\w+)\}/g,
        list = /@\{([^{}]+)=\{(.+)\}([^{}]+)\}/g,
        item = /(@=\{.+\})/g;

    return _mapAndJoin(arr, function(obj) {
      return _mapAndJoin(html, function(htm) {

        // Single
        return htm.replace(single, function(_, match) {
          return obj[match];
        })

        // Remap item to use list
        .replace(item, function(_, match) {
          return match.replace('@=', '@{ =') +' }';
        })

        // List
        .replace(list, function(_, open, match, close) {
          var key = match.match(/^\w+/)[0],
              ob = match.gmatch(/\.(\w+)/g);

          // Process object or array
          return _mapAndJoin(ob.length ? ob : obj[key], function(val) {
            return open + (ob.length ? obj[key][val] : val) + close;
          });
        });
      });
    });
  }

  Templee.prototype = {

    // Private:

    // Update data and return a new instance.
    // We need to clone the objects otherwise
    // they would be passed as reference
    _new: function(result) {
      result = result.map(function(o) { return _extend(o, {}); });
      this.length = this.data.length;
      return templee(result);
    },

    // Filter the current data property with a function.
    // The property is passed as parameter into the 'fn' callback
    _filter: function(fn) {
      return this._new(this.data.filter(function(user, i) {
        // Extra prop and subprop
        var props = /(.+)\.(.+)/.exec(this.prop) || [0,null,null],
            prop = props[1], sub = props[2];

        return fn.call(this, sub ? user[prop][sub] : user[prop], i);
      }.bind(this)));
    },

    // Public:

    // Get an array with a specific prop from each object
    // or return the data collection otherwise
    get: function(prop) {
      if (prop) return this.map(function() { return this[prop]; });
      return this.data;
    },

    // Set the property to filter or compare to
    where: function(prop) {
      return this.prop = prop, this;
    },

    // A shortcut for semantics
    and: function(prop) { return this.where(prop); },

    // Compare the current property to a given condition
    is: function(condition) {
      // Filter by regular expression or string/number
      var regex = condition instanceof RegExp ? condition :
        new RegExp('^'+ condition +'$');

      // Extracts the symbol in cases like '>50' and '<=10'.
      // 'null' and '0' are given as default symbol and number
      // when no matches are found
      var symbol = (/^([<>=%]+)([\d.]+)/.exec(condition) || [0,null,0]);

      if (symbol[1]) return this[symbol[1]](+symbol[2]);

      return this._filter(function(prop) {
        return regex.test(prop);
      });
    },

    '>': function(v) {
      return this._filter(function(p) { return p > v; });
    },

    '>=': function(v) {
      return this._filter(function(p) { return p >= v; });
    },

    '<': function(v) {
      return this._filter(function(p) { return p < v; });
    },

    '<=': function(v) {
      return this._filter(function(p) { return p <= v; });
    },

    '%': function(v) {
      return this._filter(function(p) { return p % v === 0; });
    },

    add: function(data) {
      return this._new(this.data.concat[data]);
    },

    slice: function(start, end) {
      return this._new(this.get().slice(start, end));
    },

    each: function(fn) {
      return this.get().some(_curry(fn)), this;
    },

    map: function(fn) {
      return this._new(this.data.map(_curry(fn)));
    },

    sort: function(fn) {
      return this._new(this.data.sort(function(a, b) {
        return fn ? fn.apply(this, a, b) : a > b;
      }.bind(this)));
    },

    eq: function(index) {
      return this._new(this.data[index]);
    },

    html: function(template, wrap) {
      var tag = (/^<(\w+)/.exec(wrap) || [0,null])[1],
          tmpl = _template(this.data, template);
      return tag ? wrap + tmpl +'</'+ tag +'>' : tmpl;
    }

  };

  String.prototype.gmatch = function(regex) {
    var result = [];
    this.replace(regex, function() {
      // extract matches by removing arguments we don't need
      var matches = [].slice.call(arguments, 1).slice(0,-2);
      result.push.apply(result, matches);
    });
    return result;
  };

  win.templee = templee; // expose constructor to user

}(window));

