import { TFile, Editor, MarkdownView, Plugin } from 'obsidian';

interface History {
	file: TFile;
	line: number;
}

// function historyToString(history: History) {
// 	return `${history.file.path}@${history.line}`
// }
function logHistory(backward: History[], cur: History, forward: History[]) {
	// console.log(backward.map(historyToString), historyToString(cur), forward.map(historyToString))
}

export default class NavigateCursorHistory extends Plugin {
	backward: History[] = [];
	forward: History[] = [];
	cur: History;

	async onload() {
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {
				if (!this.cur) {
					this.cur = { file, line: 0 };
				}
				if (this.cur.file !== file) {
					this.saveHistory(file, 0);
				}
			}),
		);

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'cursor-position-backward',
			name: 'Go back',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (this.backward.length < 1) return;
				const cur = this.cur
				const prev = this.backward.pop()
				this.forward.push(cur)
				if (cur.file !== prev.file) {
					await this.app.workspace.getMostRecentLeaf().openFile(prev.file)
				}
				this.cur = prev
				editor.setSelection({ line: prev.line, ch: 0 });
				logHistory(this.backward, this.cur, this.forward)
			}
		});
		this.addCommand({
			id: 'cursor-position-forward',
			name: 'Go forward',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (this.forward.length < 1) return;
				const cur = this.cur
				const prev = this.forward.pop()
				this.backward.push(this.cur)
				this.cur = prev
				if (cur.file !== prev.file) {
					await this.app.workspace.getMostRecentLeaf().openFile(prev.file)
				}
				editor.setSelection({ line: prev.line, ch: 0 });
				logHistory(this.backward, this.cur, this.forward)
			}
		});

		this.registerInterval(window.setInterval(() => {
			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor
			if (editor) {
				const cursor = editor.getCursor("head");
				this.saveHistory(this.cur.file, cursor.line);
			}
		}, 1 * 1000));
	}

	onunload() {

	}

	saveHistory(file: TFile, line: number) {
		if (file === this.cur.file && line === this.cur.line) return;
		this.backward.push(this.cur)
		this.cur = { file, line }
		this.backward = this.backward.slice(-50)
		this.forward = []
		logHistory(this.backward, this.cur, this.forward)
	}
}
