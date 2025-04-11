/*
 * the /browse page
 */

/**
 * @param {HTMLButtonElement} node
 * @param {string} toggled - The class name of the toggled filter
 * @param {string} opposing - The class name of the opposing filter
 */
function _toggleFilter(node, toggled, opposing) {
    node.blur();
    const container = node.parentElement;

    if (container.classList.contains(toggled)) {
        container.classList.remove(toggled);
        return;
    }

    if (container.classList.contains(opposing)) {
        container.classList.remove(opposing);
    }

    container.classList.add(toggled);
}

/** @param {HTMLButtonElement} node  */
function toggleFilterInclude(node) {
    _toggleFilter(node, "type-selected", "type-filtered");
}

/** @param {HTMLButtonElement} node  */
function toggleFilterExclude(node) {
    _toggleFilter(node, "type-filtered", "type-selected");
}

/** @type {SelectWidget[]} */
const SELECT_WIDGETS = [];

class SelectWidget {
    /** @type {HTMLDivElement} */
    node;
    /** @type {HTMLTemplateElement} */
    templateNode;
    /** @type {HTMLSelectElement} */
    selectNode;
    /** @type {HTMLElement} */
    footerNode;
    /** @type {HTMLSpanElement} */
    selectedNode;
    /** @type {number} */
    index;

    /** @param {HTMLDivElement} */
    constructor(node) {
        this.node = node;

        this.templateNode = node.querySelector("template");
        if (this.templateNode == null) {
            console.error("<.w-select> can't query the <template> node");
            return;
        }

        this.selectNode = node.querySelector("select");
        if (this.selectNode == null) {
            console.error("<.w-select> can't query the <select> node");
            return;
        }

        this.footerNode = node.querySelector(".js-options");
        if (this.footerNode == null) {
            console.error("<.w-select> can't query the <.js-options> node");
            return;
        }

        this.selectedNode = node.querySelector(".js-selected");
        if (this.selectedNode == null) {
            console.error("<.w-select> can't query the <.js-selected> node");
            return;
        }
    }

    /** Synchronizes the hidden <select> element with the custom one */
    sync() {
        /** @type {HTMLElement} */
        const templateItem = this.templateNode.content.querySelector("button");
        let maxWidth = 0;

        for (let i = 0; i < this.selectNode.children.length; i++) {
            const child = this.selectNode.children[i];

            /** @type {HTMLElement} */
            const item = templateItem.cloneNode(true);
            item.querySelector("span").innerHTML = child.innerText;
            item.dataset.id = child.id;

            if (i == 0) {
                this.selectedNode.innerHTML = child.innerText;
                this.selectOption(item, i);
            }

            this.footerNode.appendChild(item);
            item.addEventListener("click", (_) => this.choose(i));
            if (item.clientWidth > maxWidth) {
                maxWidth = item.clientWidth;
            }
        }

        this.node.style.setProperty("min-width", `${maxWidth + 48}px`);
    }

    toggle() {
        if (this.node.classList.contains("is-open")) {
            this.close();
            return;
        } else {
            this.open();
        }
    }

    close() {
        this.node.classList.remove("is-open");
        this.footerNode.style.setProperty("visibility", "hidden");
    }

    open() {
        if (self.mobileCheck()) {
            if ("showPicker" in HTMLSelectElement.prototype) {
                this.selectNode.showPicker();
            } else {
                const event = new MouseEvent("mousedown", {
                    bubbles: true,
                    cancelable: true,
                    view: self,
                });
                this.selectNode.dispatchEvent(event);
            }
            return;
        }
        this.node.classList.add("is-open");
        this.footerNode.style.removeProperty("visibility");
    }

    /** @param {number} index */
    choose(index) {
        const chosen = this.footerNode.children[index];
        this.deselectOption(this.footerNode.children[this.index]);
        this.selectOption(chosen, index);
        this.selectedNode.innerHTML = chosen.innerText;
        this.close();
    }

    /**
     * @param {HTMLButtonElement} option
     * @param {number} index
     */
    selectOption(option, index) {
        option.querySelector(".js-unchecked").style.setProperty(
            "display",
            "none",
        );
        option.querySelector(".js-checked").style.removeProperty(
            "display",
        );
        this.index = index;
        this.node.dataset.selected = this.selectNode.children[index].value;
    }

    /** @param {HTMLButtonElement} option  */
    deselectOption(option) {
        option.querySelector(".js-checked").style.setProperty(
            "display",
            "none",
        );
        option.querySelector(".js-unchecked").style.removeProperty(
            "display",
        );
    }

    onWindowResized() {
        const viewportHeight = Math.max(
            document.documentElement.clientHeight || 0,
            self.innerHeight || 0,
        );
        const height = 32 * this.footerNode.children.length + 4;

        if (!this.node.classList.contains("is-reversed")) {
            const diff = viewportHeight -
                (this.node.getBoundingClientRect().bottom + height) - 16;

            if (diff < 0) {
                this.footerNode.style.setProperty(
                    "height",
                    `${Math.round(height + diff)}px`,
                );
            }

            if (this.footerNode.getBoundingClientRect().height < 128) {
                this.node.classList.add("is-reversed");
                this.footerNode.style.removeProperty("height");
            }
        }
    }

    /** @param {HTMLSelectElement} node */
    set(node) {
        this.selectedNode.innerHTML =
            node.children[node.selectedIndex].innerText;

        const chosen = this.footerNode.children[node.selectedIndex];
        this.deselectOption(this.footerNode.children[this.index]);
        this.selectOption(chosen, node.selectedIndex);
    }
}

/** @param {HTMLDivElement} node  */
function loadSelectWidget(node) {
    const widget = new SelectWidget(node);
    widget.sync();
    node.dataset.index = SELECT_WIDGETS.length;
    SELECT_WIDGETS.push(widget);
}

/** @param {number} index  */
function toggleSelectWidget(index) {
    if (index == null) {
        console.error("<.w-select> doesn't have a valid index");
        return;
    }

    SELECT_WIDGETS[index].toggle();
}

/** @param {HTMLSelectElement} node  */
function changeSelectWidget(node) {
    SELECT_WIDGETS[node.parentElement.dataset.index].set(node);
}

function documentLoaded() {
    self.addEventListener(
        "click",
        /** @param {MouseEvent} event */
        (event) => {
            for (const widget of SELECT_WIDGETS) {
                if (!widget.node.contains(event.target)) {
                    widget.close();
                }
            }
        },
    );

    const whenSelectWidgetsResized = (_) => {
        for (const widget of SELECT_WIDGETS) {
            widget.onWindowResized();
        }
    };
    self.addEventListener("resize", whenSelectWidgetsResized);
    self.addEventListener("scroll", whenSelectWidgetsResized);
    whenSelectWidgetsResized();
}

// Holy shit wtf is this? does it even work? IS IT ALL REGEX? always has been. It probably works™
self.mobileCheck = function () {
    if (document.body.dataset.mobile == "true") {
        return true;
    }
    let check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
                .test(a) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
                .test(a.substr(0, 4))
        ) check = true;
    })(navigator.userAgent || navigator.vendor || self.opera);
    return check;
};
