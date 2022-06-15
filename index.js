const setupDrawSReact = (Core, listFunction) => {
  const mainTag = document.getElementById("app");
  if (mainTag !== null) {
    const listTags = mainTag.querySelectorAll("*");

    for (let i = 0; i != listTags.length; i++) {
      if (listTags[i].getAttribute("tag") !== null) {
        const prop = listTags[i].getAttribute("tag");

        let text = "";
        if (typeof Core[prop] === "object") {
          text = JSON.stringify(Core[prop])
        } else {
          text = Core[prop];
        }

        if (listTags[i].getAttribute("addModif") !== null) {
          let name = listTags[i].getAttribute("addModif");

          const isFunc = name.indexOf(/[()]/) !== -1 ? true: false;
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

const parentNode = (Core) => {
  for (const i in Core) {
    const chunk = document.querySelectorAll(`*[for="${i}"]`);

    if(chunk.length > 0) {
      for (let y = 0; y != chunk.length; y++) {
        const parent = chunk[y].parentNode
        const item = chunk[y].nodeName;

        let selectedValue = "";
        if (parent.getAttribute("model") !== null) {
          const node = parent.getAttribute("model");
          selectedValue = Core[node];
        }

        if(Array.isArray(Core[i])) {
          const array = Core[i];
          for (let m = 0; m != array.length; m++) {
            const object = document.createElement(item);
            object.innerHTML = array[m];
            if (selectedValue.toString() === array[m].toString()) {
              object.selected = true;
            }
            parent.appendChild(object);
          }
        } else {
          console.error("for only be used for an array!")
        }
      }
    }

    const inputBlocks = document.querySelectorAll(`input[model="${i}"]`);
    const selectBlock = document.querySelectorAll(`select[model="${i}"]`);
    if (inputBlocks.length > 0) {
      for (let y = 0; y != inputBlocks.length; y++) {
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
      for (let y = 0 ; y != selectBlock.length; y++) {
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

          for (let i = 0;i != allTag.length; i++) {
            if (allTag[i].getAttribute("addModif") !== null) {
              let modif = allTag[i].getAttribute("addModif");
              const isFunc = modif.indexOf(/[()]/) !== -1 ? true: false;
              modif = modif.replace(/[()]/, "");

              if (isFunc) {
                if (modif in listFunction) {
                  allTag[i].innerHTML = n + listFunction[modif](text);
                } else {
                  console.error(`can't find name of function`);
                  return false;
                }
              } else {
                allTag[i].innerHTML = n + modif;
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
