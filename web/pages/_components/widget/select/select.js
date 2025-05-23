class SelectWidget extends IClosableWidget {
	syncWith = URLQuery;

	/** @type {HTMLElement} */
	node;
	/** @type {Object.<string, HTMLElement>} */
	tree;

	/** @param {HTMLElement} node  */
	constructor(node) {
		super();

		this.node = node;
		this.tree = {
			footer: node.querySelector("footer"),
			button: node.querySelector(".js-button"),
			selected: node.querySelector(".js-button")?.querySelector("span"),
		};
		this._load();

		this.tree.button.addEventListener("click", () => {
			if (this.toggled) {
				this.close();
			} else {
				this.open();
			}
		});

		for (let i = 0; i < this.tree.footer.children.length; i++) {
			const child = this.tree.footer.children[i];
			child.addEventListener("click", () => {
				this.deselect(Number(this.node.dataset.index));
				this.select(i);
				this.close();

				this.syncWith.onsync(this.node.dataset.id, this.node.dataset.value);
			});
		}

		this.syncWith.syncTo(this.node.dataset.id, (value) => {
			this.deselect(Number(this.node.dataset.index));
			this.select(this.find(value[0]));
		});
		ClosableWidgets.push(this);
	}

	_load() {
		for (let i = 0; i < this.tree.footer.children.length; i++) {
			this.deselect(i);
		}
		this.select(0);
	}

	open() {
		this.node.classList.add("--open");
		this.node.blur();
		this.tree.footer.children[Number(this.node.dataset.index)].focus();
		this.toggled = true;
	}

	close() {
		this.node.classList.remove("--open");
		this.toggled = false;
	}

	/** @param {number} index  */
	deselect(index) {
		const child = this.tree.footer.children[index];
		child.querySelector(".js-checked").style.setProperty("display", "none");
		child.querySelector(".js-unchecked").style.removeProperty("display");
	}

	/** @param {number} index  */
	select(index) {
		const child = this.tree.footer.children[index];
		this.tree.selected.innerHTML = child.querySelector("span").innerHTML.trim();

		child.querySelector(".js-unchecked").style.setProperty("display", "none");
		child.querySelector(".js-checked").style.removeProperty("display");
		this.node.dataset.index = String(index);
		this.node.dataset.value = child.dataset.value;
	}

	/**
	 * @param {string} value
	 * @returns {number}
	 */
	find(value) {
		for (let i = 0; i < this.tree.footer.children.length; i++) {
			const child = this.tree.footer.children[i];
			if (child.dataset.value === value) {
				return i;
			}
		}

		return 0;
	}
}
