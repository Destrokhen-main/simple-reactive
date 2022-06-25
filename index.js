const setupSReactProperty = (Core, prop, tag, value) => {
  if (Core.sReactProperty[prop] === undefined) {
    Core.sReactProperty[prop] = {};
  }

  Core.sReactProperty[prop]["value"] = value;
  if (Core.sReactProperty[prop]["child"] !== undefined) {
    Core.sReactProperty[prop]["child"].push(tag);
  } else {
    Core.sReactProperty[prop]["child"] = [tag];
  }
  
  if (tag.getAttribute("if") !== null) {
    const elemComment = document.createComment(`if="${prop}"`);
    
    if (Core.sReactProperty[prop]["comment"] !== undefined) {
      Core.sReactProperty[prop]["comment"].push(elemComment);
    } else {
      Core.sReactProperty[prop]["comment"] = [elemComment];
    }
  }
}

const setupSReactPropertyFor = (Core, prop, tag) => {
  const tagWithoutAttr = document.createElement(tag.tagName);
  tagWithoutAttr.innerHTML = tag.innerHTML;
  tagWithoutAttr.setAttribute("child", prop);
  
  if (Core.sReactProperty[prop] === undefined) {
    Core.sReactProperty[prop] = {
      value: [],
      child: [],
    };
  }
  
  Core.sReactProperty[prop].value = Core[prop];
  Core.sReactProperty[prop].child = [...Core.sReactProperty[prop].child, tagWithoutAttr];
}

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

        setupSReactProperty(Core, prop, listTags[i], text);

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

      if (listTags[i].getAttribute("show") !== null) {
        const show = listTags[i].getAttribute("show");

        const value = Core[show];

        setupSReactProperty(Core, show, listTags[i], value);

        if (value) {
          listTags[i].style.display = "";
        } else {
          listTags[i].style.display = "none";
        }
      }
      
      if (listTags[i].getAttribute("if") !== null) {
        const name = listTags[i].getAttribute("if");
        const value = Core[name];
        setupSReactProperty(Core, name, listTags[i], value);
        createIfElement(name, Core);
      }

      if (listTags[i].getAttribute("for-block") !== null) {
        const name = listTags[i].getAttribute("for-block");
        setupSReactPropertyFor(Core, name, listTags[i]);
        createForBlocks(name, Core, listTags[i]);
      }

      if (listTags[i].getAttribute("for") !== null) {
        const name = listTags[i].getAttribute("for");
        console.log(listTags[i])
        setupSReactPropertyFor(Core, name, listTags[i]);
        createForElements(name, Core);
      }
    }
  } else {
    console.error("Can't find parent block");
    return false;
  }

  return true;
}

const createIfElement = (i, Core) => {
  const elemProps = Core.sReactProperty[i];
  const elemChild = elemProps.child;
  const elemComments = elemProps.comment;
  
  for (let y = 0; y !== elemChild.length; y++) {
    if (!Core.sReactProperty[i].value) {
      elemChild[y].parentNode.insertBefore(elemComments[y], elemChild[y]);
      elemChild[y].remove();
    } else if (elemComments[y].parentNode !== null) {
      elemComments[y].parentNode.insertBefore(elemChild[y], elemComments[y]);
      elemComments[y].remove();
    }
  }
}

const createForElements = (i, Core) => {
  const chunk = document.querySelectorAll(`*[for="${i}"]`);
  const childrenElem = document.querySelectorAll(`[child="${i}"]`);
  childrenElem.forEach(item => item.remove());

  for (let y = 0; y !== chunk.length; y++) {
      const parent = chunk[y].parentNode;
      let item = chunk[y];

      let selectedValue = "";
      if (parent.getAttribute("model") !== null) {
        const node = parent.getAttribute("model");
        selectedValue = Core[node];
      }

      if(Array.isArray(Core.sReactProperty[i].value)) {
        const arrayValue = Core.sReactProperty[i].value;
        const arrayChild = Core.sReactProperty[i].child;
        let object;

        for (let m = 0; m !== arrayValue.length; m++) {
          if (m === 0) {
            object = item;
            object.innerHTML = typeof arrayValue[m] === "object" ? arrayValue[m].inner : arrayValue[m];
          } else {
            object = arrayChild[y].cloneNode(true);
            object.innerHTML = typeof arrayValue[m] === "object" ? arrayValue[m].inner : arrayValue[m];
            item.insertAdjacentElement('afterend', object);
          }
          
          if (selectedValue.toString() === arrayValue[m].toString()) {
            object.selected = true;
          }

          if (typeof arrayValue[m] === "object") {
            for (let k in arrayValue[m]) {
              if (k !== "inner") object.setAttribute(k, arrayValue[m][k]);
            }
          }

          item = object;
        }
      } else {
        console.error("for only be used for an array!")
      }
    }
}

const createForBlocks = (i, Core) => {
  const chunk = document.querySelectorAll(`*[for-block="${i}"]`);
  const childrenElem = document.querySelectorAll(`[child="${i}"]`);
  childrenElem.forEach(item => item.remove());
  
  for (let y = 0; y !== chunk.length; y++) {
      let item = chunk[y];

      if(Array.isArray(Core.sReactProperty[i].value)) {
        const arrayValue = Core.sReactProperty[i].value;
        const arrayChild = Core.sReactProperty[i].child;

        let object;

        for (let m = 0; m !== arrayValue.length; m++) {
          if (m === 0) {
            object = item;
          } else {
            object = arrayChild[y].cloneNode(true);
          }


          for (let k in arrayValue[m]) {
            const innerElems = object.querySelectorAll(`[fb-${k}]`);
            for (let elem of innerElems) {
              elem.innerHTML = arrayValue[m][k];
            }
          }
          item.insertAdjacentElement('afterend', object);
          item = object;
        }
      }
    }
}

const parentNode = (Core) => {
  for (const i in Core) {
    const inputBlocks = document.querySelectorAll(`input[model="${i}"]`);
    const selectBlock = document.querySelectorAll(`select[model="${i}"]`);

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
    
    for (let y = 0 ; y !== selectBlock.length; y++) {
      selectBlock[y].addEventListener("change", (e) => {
        Core[i] = e.target.value;
      })
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

  if ("sReactProperty" in data) {
    console.error("! sReactProperty const value");
    return;
  }

  data["sReactProperty"] = {};

  let Core = new Proxy(data, {
    set(target, prop, n) {
      if (prop === "sReactProperty") {
        target[prop] = n;
        return true;
      }
      if (prop in target) {
        if (target[prop] !== n) {
          target[prop] = n;
          target.sReactProperty[prop].value = n;
          
          // вот чтоб вот это не делать можно теоретически в sReactProperty подставить type объектам
          const allTag = document.querySelectorAll(`*[tag='${prop}']`);
          const forBlockTags = document.querySelectorAll(`[for-block="${prop}"]`);
          const forElemsTags = document.querySelectorAll(`[for="${prop}"]`);
          const showTags = document.querySelectorAll(`*[show='${prop}']`);
          
          if (forBlockTags.length !== 0) {
            createForBlocks(prop, target);
          }
          
          if (forElemsTags.length !== 0) {
            createForElements(prop, target);
          }
          
          if (target.sReactProperty[prop].comment !== undefined) {
            createIfElement(prop, target);
          }
          
          for (let i = 0; i !== showTags.length; i++) {
            if (n) {
              showTags[i].style.display = "block";
            } else {
              showTags[i].style.display = "none";
            }
          }


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
        return true;
      }
      return false;
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
