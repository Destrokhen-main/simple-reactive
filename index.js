const setupDrawSReact = (Core, listFunction) => {
  const mainTag = document.getElementById("app");
  if (mainTag !== null) {
    const listTags = mainTag.querySelectorAll("*");
    
    for (let i = 0; i !== listTags.length; i++) {
      if (listTags[i].getAttribute("tag") !== null) {
        const prop = listTags[i].getAttribute("tag");
        
        let text = "";
        if (typeof Core[prop] === "object") {
          text = JSON.stringify(Core[prop])
        } else {
          text = Core[prop];
        }
        
        if (listTags[i].getAttribute("tmode") !== null) {
          let name = listTags[i].getAttribute("tmode");
          
          const isFunc = name.indexOf(/[()]/) !== -1;
          name = name.replace(/[()]/, "");
          
          if (isFunc) {
            if (name in listFunction) {
              listTags[i].innerHTML = text + listFunction[name](text);
            } else {
              console.error(`can't find name of function`);
              return false;
            }
          } else {
            listTags[i].innerHTML = text + name;
          }
        } else {
          listTags[i].innerHTML = text
        }
      }
    }
  } else {
    console.error("Can't find parent block");
    return false;
  }
  
  return true;
}

const createForElements = (i, Core) => {
  const chunk = document.querySelectorAll(`*[for="${i}"]`);
  
  if(chunk.length > 0) {
    for (let y = 0; y !== chunk.length; y++) {
      const parent = chunk[y].parentNode
      const itemTagName = chunk[y].nodeName;
      let item = chunk[y];
      
      let selectedValue = "";
      if (parent.getAttribute("model") !== null) {
        const node = parent.getAttribute("model");
        selectedValue = Core[node];
      }
      
      if(Array.isArray(Core[i])) {
        const array = Core[i];
        let object;
        
        for (let m = 0; m !== array.length; m++) {
          if (m === 0) {
            object = item;
            object.innerHTML = typeof array[m] === "object" ? array[m].inner : array[m];
          } else {
            object = document.createElement(itemTagName);
            object.innerHTML = typeof array[m] === "object" ? array[m].inner : array[m];
            item.insertAdjacentElement('afterend', object);
          }
          
          if (selectedValue.toString() === array[m].toString()) {
            object.selected = true;
          }
          
          if (typeof array[m] === "object") {
            for (let k in array[m]) {
              if (k !== "inner") object.setAttribute(k, array[m][k]);
            }
          }
          
          item = object;
        }
      } else {
        console.error("for only be used for an array!")
      }
    }
  }
}

const createForBlocks = (i, Core) => {
  const chunk = document.querySelectorAll(`*[for-block="${i}"]`);
  
  if(chunk.length > 0) {
    for (let y = 0; y !== chunk.length; y++) {
      let item = chunk[y];
      
      if(Array.isArray(Core[i])) {
        const array = Core[i];
        let object;
        
        for (let m = 0; m !== array.length; m++) {
          if (m === 0) {
            object = item;
          } else {
            object = item.cloneNode(true);
          }
          
          for (let k in array[m]) {
            const innerElems = object.querySelectorAll(`[fb-${k}]`);
            for (let elem of innerElems) {
              elem.innerHTML = array[m][k];
            }
          }
          
          item.insertAdjacentElement('afterend', object);
          item = object;
        }
      } else {
        console.error("for only be used for an array!")
      }
    }
  }
}

const parentNode = (Core) => {
  for (const i in Core) {
    createForElements(i, Core);
    createForBlocks(i, Core);
    
    const inputBlocks = document.querySelectorAll(`input[model="${i}"]`);
    const selectBlock = document.querySelectorAll(`select[model="${i}"]`);
    if (inputBlocks.length > 0) {
      for (let y = 0; y !== inputBlocks.length; y++) {
        const callback = (e) => {
          if (e.target.getAttribute("type") !== null) {
            const typeInput = e.target.getAttribute("type");
            switch (typeInput) {
              case "number":
                Core[i] = e.target.value === "" ? 0 : e.target.value;
                break;
              default:
                Core[i] = e.target.value;
                break;
            }
          } else {
            Core[i] = e.target.value;
          }
        }
        
        inputBlocks[y].addEventListener("keyup", callback);
        inputBlocks[y].addEventListener("change", callback);
      }
    }
    
    if (selectBlock.length > 0) {
      for (let y = 0 ; y !== selectBlock.length; y++) {
        selectBlock[y].addEventListener("change", (e) => {
          Core[i] = e.target.value;
        })
      }
    }
  }
  return true;
}

const sReact = (objectData) => {
  const listFunction = objectData["functions"] !== undefined ? objectData["functions"] : null;
  const data = objectData["data"] !== undefined ? objectData["data"] : null;
  
  if (data === null) {
    console.error("! Can't create reactive object. Need a data object");
    return;
  }
  let Core = new Proxy(data, {
    set(target, prop, n) {
      if (prop in target) {
        if (target[prop] !== n) {
          const allTag = document.querySelectorAll(`*[tag='${prop}']`);
          
          for (let i = 0; i !== allTag.length; i++) {
            if (allTag[i].getAttribute("tmode") !== null) {
              let tMode = allTag[i].getAttribute("tmode");
              const isFunc = tMode.indexOf(/[()]/) !== -1;
              tMode = tMode.replace(/[()]/, "");
              
              if (isFunc) {
                if (tMode in listFunction) {
                  allTag[i].innerHTML = n + listFunction[tMode](text);
                } else {
                  console.error(`can't find name of function`);
                  return false;
                }
              } else {
                allTag[i].innerHTML = n + tMode;
              }
            } else {
              if (typeof n === "object") {
                allTag[i].innerHTML = JSON.stringify(n);
              } else {
                allTag[i].innerHTML = n;
              }
            }
          }
        }
      }
    },
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
    }
  });
  
  const prerender = setupDrawSReact(Core, listFunction);
  const parent = parentNode(Core);
  if (prerender && parent) {
    return Core;
  } else {
    Core = null;
    console.error("Can't create sReact");
  }
}
