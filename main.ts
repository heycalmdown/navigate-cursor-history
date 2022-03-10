import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	backward: number[] = [];
	forward: number[] = [];
	cur = 0;

	restoreState() {
		this.backward = []
		this.forward = []
		this.cur = 0
	}

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			this.app.workspace.on('file-open', (file) => this.restoreState()),
		);

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'cursor-position-backward',
			name: 'Go back',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				if (this.backward.length < 1) return;
				const prev = this.backward.pop()
				this.forward.push(this.cur)
				this.cur = prev
				editor.setSelection({ line: prev, ch: 0 });
				console.log(this.backward, this.cur, this.forward)
			}
		});
		this.addCommand({
			id: 'cursor-position-forward',
			name: 'Go forward',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				if (this.forward.length < 1) return;
				const prev = this.forward.pop()
				this.backward.push(this.cur)
				this.cur = prev
				editor.setSelection({ line: prev, ch: 0 });
				console.log(this.backward, this.cur, this.forward)
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerInterval(window.setInterval(() => {
			// const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor
			if (editor) {
				// const from = editor.getCursor("anchor");
				const to = editor.getCursor("head");
				if (to.line === this.cur) return;
				this.backward.push(this.cur)
				this.cur = to.line
				this.backward = this.backward.slice(-20)
				this.forward = []
				console.log(this.backward, this.cur, this.forward)
			}
		}, 1 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
