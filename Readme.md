### Script for simple-reactive

#### 1. install
Download the index.js file.
` <script src="index.js"></script>`

##### ! The script is now available to you. !

#### 2. setup sReact
To create an object, use this construct
```
  const sReact = sReact({
    data: { Variables to be used },
    functions: { Functions for text modification. }
  });
```

Example:
```
  const sReact = sReact({
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

#### 3. Usage in html
Requires a `div` element to work

example:
```
  <div id="app">
    some html here!
  </div>
```

To match object content to tags, you need to use `tag`.

example:
```
  <div id="app">
    <p tag="text"> <The text from the object will be inserted here> </p>
  </div>
```

#### 3.1 Creating a relationship between "input" and "tag"
To create a link between input fields and all tags where `tag` is present, you need to add the `model` attribute to the `input` field

example: 
```
  <div id="app">
    <p tag="text"></p>
    <input type="text" model="text" />
  </div>
```



