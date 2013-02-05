/*jslint es5:true expr:true boss:true */
/* Templee is a small API to create HTML content with a syntax similar to jQuery.
 * Author: Cedric Ruiz
 * License: MIT
 */
//---------------------------------------------------------------------
// Templee:
//---------------------------------------------------------------------

(function(win) {
  'use strict';

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
    return arr.map(_curry(fn)).join('');
  }

  function _findProp(obj, prop) {
    var props = prop.split('.'), tmp = obj;
    return props.map(function(p) { return tmp = tmp[p]; }).pop() || [];
  }

  // Fill HTML templates from an array of objects
  // Example:
  //   var people = [{name: 'John', days: [1,10] }, {name: 'Mike', days: [4,8] }]
  //   var html = _template(people, ['<p>#{name} @{<span>={days}</span>}</p>'])
  function _template(data, html) {

    var props = /#\{([^{}]+)\}/g,
        loops = /@\{([^{}]+)=\{([^{}]+)\}([^{}]+)\}/g,
        objs = /@\[(.+)\]\{(.+)\}/g;

    return _mapAndJoin(data, function(obj) {

      return html.replace(props, function(_, prop) {
        return _findProp(obj, prop);
      })

      .replace(loops, function(_, open, prop, close) {
        return _mapAndJoin(_findProp(obj, prop), function(key) {
          return open + key + close;
        });
      })

      .replace(objs, function(_, match, keys) {
        return keys.replace(/=\{([^{}]+)\}/g, function(_, key) {
          return _findProp(_findProp(obj, match), key);
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
      this.data = result.map(function(o) { return _extend(o, {}); });
      this.length = this.data.length;
      return this;
    },

    // Filter the current data property with a function.
    // The property is passed as parameter into the 'fn' callback
    _filter: function(fn) {
      return this._new(this.data.filter(function(obj, i) {
        return fn.call(this, _findProp(obj, this.prop), i);
      }.bind(this)));
    },

    // Public:

    // Get an array with a specific prop from each object
    // or return the data collection otherwise
    get: function(prop) {
      if (prop) return this.data.map(function(o) { return o[prop]; });
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
      this.data.push(data);
      return this._new([].concat.apply([], this.data));
    },

    slice: function(start, end) {
      return this._new(this.data.slice(start, end));
    },

    each: function(fn) {
      return this.data.some(_curry(fn)), this;
    },

    map: function(fn) {
      return this._new(this.data.map(_curry(fn)));
    },

    sort: function(fn) {
      return this._new(this.data.sort(_curry(fn)));
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

  win.templee = templee; // expose constructor to user

}(window));
