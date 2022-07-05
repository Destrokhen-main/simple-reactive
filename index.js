const sReact = (setup) => {
  class sReactError extends Error {
    constructor(message) {
      super(message);
      this.name = "sReact";
    }
  }
  
  const modifySetupData = (data) => {
    const objectNew = {};
    
    if (app !== null) {
      for (let prop in data) {
        const newProp =  {};
        
        newProp.value = data[prop];
        newProp.child = [];
        
        const child = [];
        
        /* ! work with `tag`  */
        const tags = app.querySelectorAll(`*[tag='${prop}']`);
        if (tags.length !== 0) {
          tags.forEach((tag) => {
            child.push({
              type: "tag",
              parent: tag,
            });
          });
        }
        
        /* ! work with `for-block` */
        const forBlocks = app.querySelectorAll(`*[for-block='${prop}']`);
        if (forBlocks.length !== 0) {
          forBlocks.forEach((forBlock) => {
            child.push({
              type: "for-block",
              parent: forBlock,
              child: []
            });
          });
        }
        
        /* ! work with `s-for` */
        const forElements = app.querySelectorAll(`*[s-for='${prop}']`);
        if (forElements.length !== 0) {
          if (Array.isArray(data[prop])) {
            
            let checkArray = true;
            
            data[prop].forEach((item) => {
              if (typeof item === "object" && item["inner"] === undefined) {
                checkArray = false;
              }
            });
            
            if (checkArray) {
              forElements.forEach((forElement) => {
                child.push({
                  type: "s-for",
                  parent: forElement,
                  child: [],
                });
              });
            } else {
              throw new sReactError("If you want to use object in `s-for`. All object in array need have 1 key `inner`")
            }
          } else {
            throw new sReactError("for `s-for` need use only array");
          }
        }
        
        /* ! work with `if` */
        const ifElements = app.querySelectorAll(`*[if='${prop}']`);
        if (ifElements.length !== 0) {
          if (typeof data[prop] === "boolean") {
            ifElements.forEach((ifElement) => {
              const sIf = document.createElement("sIf");
              sIf.setAttribute("if", prop);
              
              child.push({
                type: "if",
                parent: ifElement,
                plug: sIf,
              });
            });
          } else {
            throw new sReactError("for 'if' need use only boolean value")
          }
        }
        
        /* ! work with `show` */
        const shows = app.querySelectorAll(`*[show='${prop}']`);
        if (shows.length !== 0) {
          if (typeof data[prop] === "boolean") {
            shows.forEach((show) => {
              child.push({
                type: "show",
                parent: show,
              });
            });
          } else {
            throw new sReactError("for 'show' need use only boolean value")
          }
        }
        
        /* ! work with `if-text` */
        const ifDraws = app.querySelectorAll(`*[if-text='${prop}']`);
        if (ifDraws.length !== 0) {
          if (typeof data[prop] === "boolean") {
            ifDraws.forEach((ifDraw) => {
              const trueText = ifDraw.getAttribute("s-true");
              const falseText = ifDraw.getAttribute("s-false");
              
              if (trueText !== null && falseText !== null) {
                child.push({
                  type: "if-text",
                  parent: ifDraw,
                  trueText: trueText,
                  falseText: falseText,
                });
              } else {
                throw new sReactError("miss `s-true` or `s-false`")
              }
            });
          } else {
            throw new sReactError("for 'if-text' need use only boolean value")
          }
        }
        
        newProp.child = child;
        objectNew[prop] = newProp;
      }
    } else {
      throw new sReactError("can't find htmlElement with id `app`");
    }
    
    return objectNew;
  }
  
  const clearAllAttr = (block) => {
    const needAttr = [];
    while(block.attributes.length > 0) {
      switch (block.attributes[0].name) {
        case "class":
        case "rel":
        case "href":
        case "target":
        case "src":
        case "alt":
        case "style":
        case "title":
          needAttr.push({
            name: block.attributes[0].name,
            value: block.attributes[0].value,
          })
          break;
      }
      block.removeAttribute(block.attributes[0].name);
    }
    
    if (needAttr.length > 0) {
      needAttr.forEach((item) => {
        block.setAttribute(item.name, item.value);
      });
    }
  }
  
  const firstDraw = () => {
    for (let prop in Core) {
      const object = Core["__" + prop];
      if (object.child.length) {
        object.child.forEach((child) => {
          if (child.type === "tag") {
            const value = typeof object.value === "object" ? JSON.stringify(object.value) : object.value;
            const tModeValue = child.parent.getAttribute("tmode");
            
            if (tModeValue !== null) {
              if (functions !== null && functions[tModeValue] !== undefined) {
                const modifyTextFunc = functions[tModeValue];
                child.parent.innerHTML = modifyTextFunc(value);
              } else {
                console.log(functions)
                console.log(`Функции ${tModeValue} нет в functions`)
              }
            } else {
              child.parent.innerHTML = value;
            }
          } else if (child.type === "if") {
            if (!object.value) {
              child.parent.insertAdjacentElement('afterend', child.plug);
              child.parent.remove();
            }
          } else if (child.type === "show") {
            if (!object.value) {
              child.parent.style.display = "none";
            }
          } else if (child.type === "if-text") {
            if (object.value) {
              child.parent.innerText = child.trueText;
            } else {
              child.parent.innerText = child.falseText;
            }
          } else if (child.type === "s-for") {
            object.value.forEach((arrayItem, index) => {
              if (index === 0) {
                if (typeof arrayItem === "object") {
                  child.parent.innerHTML = arrayItem.inner;
                  Object.keys(arrayItem).forEach((e) => {
                    if (e !== "inner") {
                      child.parent.setAttribute(e, arrayItem[e]);
                    }
                  })
                } else {
                  child.parent.innerHTML = arrayItem;
                }
              } else {
                const cloneNode = child.parent.cloneNode(1);
                clearAllAttr(cloneNode);
                if (typeof arrayItem === "object") {
                  cloneNode.innerHTML = arrayItem.inner;
                  Object.keys(arrayItem).forEach((e) => {
                    if (e !== "inner") {
                      cloneNode.setAttribute(e, arrayItem[e]);
                    }
                  })
                } else {
                  cloneNode.innerHTML = arrayItem;
                }
                if (child.child.length === 0) {
                  child.parent.insertAdjacentElement("afterend", cloneNode);
                  child.child.push(cloneNode);
                } else {
                  child.child[child.child.length - 1].insertAdjacentElement("afterend", cloneNode);
                  child.child.push(cloneNode);
                }
              }
            });
          }
        });
      }
    }
  }
  
  const modelParent = () => {
    if (app !== null) {
      const listener = (e) => {
        const prop = e.target.getAttribute("model");
        Core[prop] = e.target.value;
      }
      
      for (let prop in Core) {
        const value = Core[prop];
        
        /* model with input */
        const inputs = app.querySelectorAll(`input[model='${prop}']`);
        if (inputs.length !== 0) {
          inputs.forEach((input) => {
            if (value !== "")
              input.value = value;
            input.addEventListener("input", listener)
          })
        }
        
        /* model with select */
        const selects = app.querySelectorAll(`select[model='${prop}']`);
        if (selects.length !== 0) {
          selects.forEach((select) => {
            select.addEventListener("change", listener);
            if (value !== "") {
              select.value = value;
            }
          })
        }
      }
    }
  }
  
  const functions = setup["functions"] !== undefined ? setup["functions"] : null;
  const data = setup["data"] !== undefined ? setup["data"] : null;
  const body = setup["body"] !== undefined ? setup["body"] : "#app";
  
  const app = document.querySelector(body);
  if (app === null) {
    throw new sReactError(`can't find '${body}' htmlTag `);
  }
  
  if (data === null) {
    throw new sReactError("object `data` is undefined");
  }
  
  const modifiedData = modifySetupData(data, functions);
  const Core = new Proxy(modifiedData, {
    async set(target, prop, value) {
      if (prop in target) {
        const oldValue = await JSON.stringify(target[prop].value)
        const newValue = await JSON.stringify(value);
        if (oldValue !== newValue) {
          const object = target[prop];
          if (object.child !== undefined && object.child.length !== 0) {
            object.child.forEach((child) => {
              if (child.type === "s-for") {
                if (object.value.length > value.length) {
                  // delete
                  object.value.forEach((item, index) => {
                    if (typeof item === "object") {
                      const oldValue = JSON.stringify(item);
                      const newValue = JSON.stringify(value[index]);
                      
                      if (oldValue !== newValue) {
                        if (index === 0) {
                          child.parent.innerHTML = value[index].inner || "";
                          Object.keys(value[index]).forEach((e) => {
                            if (e !== "inner")
                              child.parent.setAttribute(e, value[index][e] || "");
                          });
                        } else {
                          if (value[index] === undefined) {
                            child.child[index - 1].remove();
                            child.child[index - 1] = undefined;
                          } else {
                            child.child[index - 1].innerHTML = value[index].inner;
                            Object.keys(value[index]).forEach((e) => {
                              if (e !== "inner")
                                child.child[index - 1].setAttribute(e, value[index][e] || "");
                            });
                          }
                        }
                      }
                    } else if (item !== value[index]) {
                      if (index === 0) {
                        child.parent.innerHTML = value[index] || "";
                      } else {
                        if (value[index] === undefined) {
                          child.child[index - 1].remove();
                          child.child[index - 1] = undefined;
                        } else {
                          child.child[index - 1].innerHTML = value[index];
                        }
                      }
                    }
                  });
                  child.child = child.child.filter(v => v !== undefined);
                } else if (object.value.length < value.length) {
                  // add
                  object.value.forEach((item, index) => {
                    if (typeof item === "object") {
                      const oldValue = JSON.stringify(item);
                      const newValue = JSON.stringify(value[index]);
                      if (oldValue !== newValue) {
                        if (index === 0) {
                          child.parent.innerHTML = value[index].inner;
                          Object.keys(value[index]).forEach((e) => {
                            if (e !== "inner")
                              child.parent.setAttribute(e, value[index][e]);
                          });
                        } else {
                          child.child[index - 1].innerHTML = value[index].inner;
                          
                          Object.keys(value[index]).forEach((e) => {
                            if (e !== "inner")
                              child.child[index - 1].setAttribute(e, value[index][e]);
                          });
                        }
                      }
                    } else if (item !== value[index]) {
                      if (index === 0) {
                        child.parent.innerHTML = value[index];
                      } else {
                        child.child[index - 1].innerHTML = value[index];
                      }
                    }
                  });
                  for (let z = object.value.length; z !== value.length; z++) {
                    if (z === 0) {
                      child.parent.innerHTML = value[z];
                    } else {
                      const cloneNode = child.parent.cloneNode(1);
                      
                      clearAllAttr(cloneNode);
                      
                      if (typeof value[z] === "object") {
                        cloneNode.innerHTML = value[z].inner;
                        Object.keys(value[z]).forEach((e) => {
                          if (e !== "inner")
                            cloneNode.setAttribute(e, value[z][e]);
                        });
                      } else {
                        cloneNode.innerHTML = value[z];
                      }
                      
                      if (child.child.length === 0) {
                        child.parent.insertAdjacentElement("afterend", cloneNode);
                      } else {
                        child.child[child.child.length - 1].insertAdjacentElement("afterend", cloneNode);
                      }
                      child.child.push(cloneNode);
                    }
                  }
                } else if (object.value.length === value.length) {
                  // mb some edit
                  object.value.forEach((item, index) => {
                    if (typeof item === "object") {
                      const oldValue = JSON.stringify(item);
                      const newValue = JSON.stringify(value[index]);
                      
                      if (oldValue !== newValue) {
                        if (index === 0) {
                          child.parent.innerHTML = value[index].inner;
                          Object.keys(value[index]).forEach((e) => {
                            if (e !== "inner")
                              cloneNode.setAttribute(e, value[index][e]);
                          });
                        } else {
                          child.child[index - 1].innerHTML = value[index].inner;
                          Object.keys(value[index]).forEach((e) => {
                            if (e !== "inner")
                              child.child[index - 1].setAttribute(e, value[index][e]);
                          });
                        }
                      }
                    } else if (item !== value[index]) {
                      if (index === 0) {
                        child.parent.innerHTML = value[index];
                      } else {
                        child.child[index - 1].innerHTML = value[index];
                      }
                    }
                  });
                }
              }
              
              if (child.type === "if") {
                if (value) {
                  child.plug.insertAdjacentElement('afterend', child.parent);
                  child.plug.remove();
                } else {
                  child.parent.insertAdjacentElement('afterend', child.plug);
                  child.parent.remove();
                }
              }
              
              if (child.type === "show") {
                if (value) {
                  child.parent.style.display = "";
                } else {
                  child.parent.style.display = "none";
                }
              }
              
              if (child.type === "if-text") {
                if (value) {
                  child.parent.innerText = child.trueText;
                } else {
                  child.parent.innerText = child.falseText;
                }
              }
              
              if (child.type === "tag") {
                const newValue = typeof value === "object" ? JSON.stringify(value) : value;
                const tModeValue = child.parent.getAttribute("tmode");
                
                if (tModeValue !== null) {
                  if (functions !== null && functions[tModeValue] !== undefined) {
                    const modifyTextFunc = functions[tModeValue];
                    child.parent.innerHTML = modifyTextFunc(newValue);
                  } else {
                    console.log(`Функции ${tModeValue} нет в functions`)
                  }
                } else {
                  child.parent.innerHTML = newValue;
                }
              }
            });
          }
          target[prop].value = value;
          return true;
        }
      }
      return false;
    },
    get(target, prop) {
      if (prop.startsWith('__')) {
        const editProp = prop.replace("__","");
        return target[editProp];
      } else {
        if (prop in target) {
          if (typeof target[prop].value === "object")
            return JSON.parse(JSON.stringify(target[prop].value));
          
          return target[prop].value;
        } else {
          return undefined;
        }
      }
    }
  });
  firstDraw();
  modelParent();
  
  return Core;
}
