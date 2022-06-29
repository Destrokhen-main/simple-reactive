### Script for simple-reactive v1.5.0

### 1. install
Download the index.js file.

`<script src="index.js"></script>`

### 2. setup sReact
To create an object, use this construct
```
const sreact = sReact({
  data: { Variables to be used },
});
```

`Example:`
```
const sreact = sReact({
  data: { 
    text: "some text",
  }
});
```

### 3. Usage in html
Requires a `div` element to work

`example:`
```
<div id="app">
  some html here!
</div>
```

If you want to use sReact for multiple blocks. Write the selector to the object

`example:`
```
<div id="app1"></div>

<div id="app2"></div>

const sr1 = sReact({
  body: "#app1",
  data: {
    data...
  }
})

const sr2 = sReact({
  body: "#app2",
  data: {
    data...
  }
})
```

If you don't specify `body` then by default it will look for `htmlTag` with `id = "app"`

To match object content to tags, you need to use `tag`.

`example:`
```
<div id="app">
  <p tag="text"> <-- The text from the object will be inserted here --> </p>
</div>
```

Optionally you can add a simple string or a string with HTML as object content

`example:`
```
const sr = sReact({
  data: {
    selectData: "",
    html: `<div style="color:red">test</div>`
  },
});
```

### 3.1 Creating a relationship between `input` and `tag`

To create a link between input fields and all tags where `tag` is present, you need to add the `model` attribute to the `input` field. 

`example:`
```
<div id="app">
  <p tag="text"></p>
  <input type="text" model="text" />
</div>
```

You can also link between "select" and "tag"

`example:`
```
<select model="text">
  <option value='1'>---1---</option>
</select>

<p tag="text"></p>

```

### 3.2 Displaying elements with a for loop

### 3.2.1 To create multiple identical elements, add the "s-for" attribute to the element

`example:`
```
<div id="app">
  <p s-for="lst"></p>
</div>
```

And add an array of elements (with the same name) to data in the sReact constructor

`example:`
```
const sr = sReact({
  data: {
    lst: ["some text", "some text", "some text"],
  },
});

```

### 3.2.2 If you need to append attributes to your elements, you can describe it as array of objects, where key is the name of the attribute and value is the value of that attribute. `inner` is responsible for text content of the element as it was with simple string list (see 3.2.1).

`example:`
```
const sr = sReact({
  data: {
    lst1: [
      {
        inner: "some tex1t",
        value: "opt1",
      },
      {
        inner: "som3e text",
        value: "opt2",
      }
    ],
  },
});
```

### 4. attribute `show`
You can show your `div` or any other element by condition

use `show` attribute

`example:`
add in data object boolean variable
```
{
  ...
  show: true,
}
```

in `html`:
```
<div show="show">
  some text
</div>
```

now the data tag will turn on and off on its own

p.s.
on the `html tag` will add css style : `display: '' | none`

!be careful!

### 4.1. attribute `if`

You can use boolean variables to draw blocks

add attribute `if` to your htmlTag.

`example:`
```
--html--
<div if="block">
  Some text here
</div>

--js--
const sreact = sReact({
  block: true
})
```
! for attribute `if` you can use only boolean variables;

p.s: This attribute removes code from html. Be careful with "AddEventListener"

### 4.2. attribute `if-text`

If you need to display different text when a boolean variable is true or false.
You can use "if-text"

`example:`
```
<button id="but" if-text="block" s-true="Hide" s-false="Show"></button>
```
attribute `s-true` and `s-false` important

### 5. Change `data` from code

You can also change reactive variables from code

`example:`
```
const sreact = sReact({
  data: { 
    text: "some text",
  }
});

sreact['text'] = "asd";

OR

sreact.text = "asd";
```

### 5.1 Change `array` in `data`

Unfortunately you can't write code like this.

```
const sreact = sReact({
  data: { 
    text: [1,2,3],
  }
});

sreact.text.push(1);
```
In this case, the array gets populated, but reactivity doesn't work. To work correctly with reactivity, it’s enough just to get this array before work

`GOOD`
```
const ar = sreact.text;

some code...

sreact.text = ar;
```

In this case, everything will work as it should.