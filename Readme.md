### Script for simple-reactive v1.0.0

### 1. install
Download the index.js file.
` <script src="index.js"></script>`

### 2. setup sReact
To create an object, use this construct
```
const sReact = sReact({
    data: { Variables to be used },
    functions: { Functions for text modification. }
});
```

`Example:`
```
const sreact = sReact({
    data: { 
      text: "some text",
    },
    functions: { 
      modification: (text) => {
        if (text.length > 10) 
          return text + " ->"
        else
          return text + " <-"
      }
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

To match object content to tags, you need to use `tag`.

`example:`
```
<div id="app">
    <p tag="text"> <The text from the object will be inserted here> </p>
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

### 3.2.1 To create multiple identical elements, add the "for" attribute to the element

`example:`
```
<div id="app">
  <p for="lst"></p>
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

### 3.3 Displaying blocks with a for loop
To create multiple identical blocks, add the "for-blocks" attribute to the element

`example:`
```
<div for-block="lst3" style="padding: 10px; border: 1px solid cadetblue">
    <p fb-title></p>
    <p fb-description></p>
</div>
```

And describe inner tags in data

`example:`
```
const sr = sReact({
  data: {
    lst3: [
      {
        title: "title 1",
        description: "descr 1",
      },
      {
        title: "title 2",
        description: "descr 2",
      },
      {
        title: "title 3",
        description: "descr 3",
      },
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


