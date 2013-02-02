# Templee

Templee is a small API to quickly create data-driven HTML content with a syntax similar to jQuery. Templee doesn't have any dependencies and it should work in [any modern browser that supports ECMAScript5](http://kangax.github.com/es5-compat-table/).

Demo featuring usage of Templee with JSON: http://jsbin.com/owazaw/1/edit (ctrl + enter to refresh just in case)

## How to:

Creating templates with Templee is very easy. All you need to do is create an array with your data and pass it into `templee`:

```javascript
var movies = templee([
  { 
    title: 'Spiderman', 
    score: 7, 
    gross: 90e6,
    tags: ['Action', 'Superhero']
  },
  { 
    title: 'Aliens vs Predators', 
    score: 5, 
    gross: 50e6,
    tags: ['Action', 'Fantasy']
  },
  { 
    title: 'American Beauty', 
    score: 9.5, 
    gross: 140e6,
    tags: ['Drama', 'Crime']
  },
  { 
    title: '500 Days of Summer', 
    score: 8.5, 
    gross: 75e6,
    tags: ['Drama', 'Comedy']
  },
  { 
    title: 'Drive', 
    score: 7.5, 
    gross: 120e6,
    tags: ['Drama', 'Action', 'Crime']
  },
  { 
    title: '127 Hours', 
    score: 9,
    gross: 78e6,
    tags: ['Drama', 'Adventure']
  }
]);
```  

Then you can use any of the methods available to filter your data and create an HTML string based on a template ready to be inserted into the DOM:

```javascript

var template = [
  '<div class="movie">',
    '<h2>#{title}</h2>',
    '<h3>Score: #{score}, Gross: $#{gross}</h3>',
    '<h4>Tags:</h4>',
    '<ul>@{<li class="tag">={tags}</li>}</ul>',
  '</div>'
];

$('body').append(movies.where('score').is('>=8').and('title').is(/^\d/).html(template));
```

The above appends the following markup:

```html
<div class="movie">
  <h2>500 Days of Summer</h2>
  <h3>Score: 8.5, Gross: $75000000</h3>
  <h4>Tags:</h4>
  <ul>
    <li class="tag">Drama</li>
    <li class="tag">Comedy</li>
  </ul>
</div>

<div class="movie">
  <h2>127 Hours</h2>
  <h2>Score: 9, Gross: $78000000</h2>
  <h4>Tags:</h4>
  <ul>
    <li class="tag">Drama</li>
    <li class="tag">Adventure</li>
  </ul>
</div>
```

## Methods:

### where(prop), and(prop)

Filter the collection my the given property.

### is(number|string)

Filter elements where the current property matches the given string or number.

```javascript
movies.where('title').is('Spiderman');
movies.where('score').is(9.5);
```

### is(expression)

Filter elements where the current property matches the given expression. The expression must be in this format `exprNumber` where `expr` can be `>,>=,<,<=,%`:

```javascript
movies.where('gross').is('>=10000000')
```

### is(regex)

Filter elements where the current property matches the given regular expression:

```javascript
movies.where('title').is(/^[A-Z]/);
```

### get()

Get the data array.

```javascript
movies.where('score').is('>=9').get();
//^ [
//    { title: '127 Hours', score: 9, gross: 78e6 },
//    { title: 'American Beauty', score: 9.5, gross: 140e6 }
//  ]
```

### get(prop)

Get an array with the given prop of each object.

```javascript
movies.where('score').is(9).get('title'); //=> ['127 Hours']
```

### add(data)

Append more data to the current collection.

```javascript
movies.add([{ title: 'JCVD', score: 8, gross: 30e6, tags: ['Drama', 'Action'] }]);
```

### slice(start, end)

Works like the native array method.

```javascript
movies.slice(0,1).get('title'); //=> ["Spiderman"] 
```

### each(fn)

Loop the current data collection.

```javascript
movies.each(function(movie, index) {
  console.log(this.title); // 'this' is 'movie'
  if (index >= 3) return; // simply 'return;' to exit the loop
});
```

### sort(fn)

Sort data collection by the given function

```javascript
movies.sort(function(a, b) {
  return a.title > b.title;
});
```

### eq(index)

Reduce data collection to the element in position `index`.

### html(template, wrap)

Get an HTML string from data collection given the `template`. You can also wrap the result in the given tag.

```javascript
movies.html(template, '<div class="container">');
```

## Template format:

### `#{key}`
A single variable

### `@{<tag>={key}</tag>}`
`@{}` is the loop and inside you print the key `={key}`. This works for arrays an objects.

### `@={key}`
Access and object's key directly.

**Limitations:** Don't nest more than twice, it won't work. This is just to keep it simple. If you feel like you need more nesting consider prefixing your keys.

**Enjoy :)**
