import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";

const copyButtonId = "pysssss.CopyButton"

// Displays input text on a node
app.registerExtension({
	name: "pysssss.ShowText",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "ShowText|pysssss") {
			function populate(text) {
				if (this.widgets) {
					for (let i = 1; i < this.widgets.length; i++) {
						this.widgets[i].onRemove?.();
					}
					this.widgets.length = 1;
				}

				const v = [...text];
				if (!v[0]) {
					v.shift();
				}
				if (v[1] === copyButtonId && v.length === 2)
					v.pop();

				for (const list of v) {
					const w = ComfyWidgets["STRING"](this, "text", ["STRING", { multiline: true }], app).widget;
					w.inputEl.readOnly = true;
					w.inputEl.style.opacity = 0.6;
					w.value = list;

					if (v.length === 1) {
						addCopyButton(this, w);
					}
				}

				requestAnimationFrame(() => {
					const sz = this.computeSize();
					if (sz[0] < this.size[0]) {
						sz[0] = this.size[0];
					}
					if (sz[1] < this.size[1]) {
						sz[1] = this.size[1];
					}
					this.onResize?.(sz);
					app.graph.setDirtyCanvas(true, false);
				});
			}

			function addCopyButton(widget, w) {
				const originalSize = [widget.size[0], widget.size[1]];
				widget.addWidget("button", "Copy", copyButtonId, () => {
					navigator.clipboard.writeText(w.value);
				}, { serialize: false });
				widget.size[0] = originalSize[0];
				widget.size[1] = originalSize[1];
			}

			// When the node is executed we will be sent the input text, display this in the widget
			const onExecuted = nodeType.prototype.onExecuted;
			nodeType.prototype.onExecuted = function (message) {
				onExecuted?.apply(this, arguments);
				populate.call(this, message.text);
			};

			const onConfigure = nodeType.prototype.onConfigure;
			nodeType.prototype.onConfigure = function () {
				onConfigure?.apply(this, arguments);
				if (this.widgets_values?.length) {
					populate.call(this, this.widgets_values);
				}
			};
		}
	},
});
