class IClosableWidget {
	/** @type {HTMLElement} */
	node;

	close() {}
}

/** @type {IClosableWidget[]} */
const ClosableWidgets = [];

self.addEventListener(
	"click",
	/** @param {MouseEvent} event */
	(event) => {
		for (const widget of ClosableWidgets) {
			if (!widget.node.contains(event.target)) {
				widget.close();
			}
		}
	},
);
