/* 	
	Privacy Glasses plugin for Obsidian
	Copyright 2021 Jill Alberts
	Licensed under the MIT License (http://opensource.org/licenses/MIT) 
*/

import { App, Plugin, PluginSettingTab, Setting, addIcon, Notice, MarkdownFileInfo, View} from 'obsidian';

function isMarkdownFileInfoView(x: unknown):x is MarkdownFileInfo {
	const anyX = x as any;
	return !!Object.getOwnPropertyDescriptor(anyX, 'file')
}

function viewOnBeforeStateChange(view: View, onBeforeStateChange: () => void) {
	const anyView = view as any;

	const original = anyView.__proto__.setState;

	function wrapper() {
		onBeforeStateChange();
		return original.apply(this, arguments);
	}

	anyView.setState = wrapper.bind(view);

	return anyView;
}

type Level = 'hide-all' | 'hide-private' | 'reveal-all'

export default class PrivacyGlassesPlugin extends Plugin {

	settings: PrivacyGlassesSettings;
	statusBar: HTMLElement;
	noticeMsg: Notice;
	blurLevelStyleEl: HTMLElement;
	lastEventTime: number | undefined;
	currentLevel: Level;

	async onload() {
        		
		this.statusBar = this.addStatusBarItem();

		await this.loadSettings();

		this.addSettingTab(new privacyGlassesSettingTab(this.app, this));

		addIcon('eye', eyeIcon);
		addIcon('eye-closed', eyeClosedIcon);
		addIcon('eye-slash', eyeSlashIcon);

		this.addRibbonIcon('eye-closed', 'Hide all', () => {
			this.currentLevel = 'hide-all';
			this.updateLeavesAndGlobalReveals();
		});
		this.addRibbonIcon('eye-slash', 'Reveal non-private', () => {
			this.currentLevel = 'hide-private';
			this.updateLeavesAndGlobalReveals();
		});
		this.addRibbonIcon('eye', 'Reveal all', () => {
			this.currentLevel = 'reveal-all';
			this.updateLeavesAndGlobalReveals();
		});


		this.addCommand({
			id: 'privacy-glasses-hide-all', 
			name: 'Privacy Glasses - hide all',
			callback: () => {
				this.currentLevel = 'hide-all';
				this.updateLeavesAndGlobalReveals();
			}
		});

		this.addCommand({
			id: 'privacy-glasses-hide-private', 
			name: 'Privacy Glasses - hide files in folders marked as private',
			callback: () => {
				this.currentLevel = 'hide-private';
				this.updateLeavesAndGlobalReveals();
			}
		});

		this.addCommand({
			id: 'privacy-glasses-reveal-all', 
			name: 'Privacy Glasses - do not hide anything',
			callback: () => {
				this.currentLevel = 'reveal-all';
				this.updateLeavesAndGlobalReveals();
			}
		});

		this.registerInterval(window.setInterval(() => {
			this.checkIdleTimeout();
		}, 1000));

		this.registerEvent(this.app.workspace.on('active-leaf-change', (e) => {
			// hack the view state change, because all API events are triggered after the view is already shown,
			// in which case we are risking to show sensitive content briefly until the event is triggered
			viewOnBeforeStateChange(e.view, () => {
				this.revealed.forEach(r => {
					r.removeClass('privacy-glasses-reveal');
				});
				this.revealed = [];
			});
			// some panels update using the same event, so it is important to update leaves after they are ready
			setTimeout(() => this.updateLeafsStyle(), 200);
		}));

		this.app.workspace.onLayoutReady(() => {
			this.registerDomActivityEvents(this.app.workspace.rootSplit.win);
			this.currentLevel = this.settings.blurOnStartup ?  'hide-all' : 'hide-private';
			this.updateLeavesAndGlobalReveals();
	
		});

		this.registerEvent(this.app.workspace.on('window-open', (win) => {
			this.registerDomActivityEvents(win.win);
		}));

		this.lastEventTime = performance.now();
	}


	registerDomActivityEvents(win: Window) {
		this.registerDomEvent(win, "mousedown", e => {
			this.lastEventTime = e.timeStamp;
		});
		this.registerDomEvent(win, "keydown", e => {
			this.lastEventTime = e.timeStamp;
		});
		this.addBlurLevelEl(win.document);
	}

	checkIdleTimeout() {
		if (this.settings.blurOnIdleTimeoutSeconds < 0) {
			return;
		}

		if (this.currentLevel === 'hide-all') {
			return;
		}

		if (!this.lastEventTime){
			return;
		}

		const now = performance.now();

		if ((now - this.lastEventTime) / 1000 >= this.settings.blurOnIdleTimeoutSeconds) {
			this.currentLevel = 'hide-all';
			this.updateLeavesAndGlobalReveals();
		}
	}

	async onunload() {
		this.statusBar.remove();
		await this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	shouldRevealLeaf(view: View) {
		if (this.currentLevel === 'reveal-all') {
			return true;
		}

		if (this.currentLevel === 'hide-all') { 
			return false;
		}

		if (!isMarkdownFileInfoView(view)) {
			return true;
		}

		if (view.file && !this.settings.privateDirs.contains(view.file.parent.path)){
			return true;
		}

		return false;
	}

	revealed: HTMLElement[] = [];

	updateLeafViewStyle(view: View) {
		const shouldReveal = this.shouldRevealLeaf(view);
		if (shouldReveal) {
			view.containerEl.addClass('privacy-glasses-reveal');
			this.revealed.push(view.containerEl);
		} else {
			view.containerEl.removeClass('privacy-glasses-reveal')
		}
	}

	updateLeavesAndGlobalReveals() {
		this.updateLeafsStyle();
		this.updateGlobalRevealStyle();
	}

	updateLeafsStyle() {
		this.app.workspace.iterateAllLeaves(e => {
			this.updateLeafViewStyle(e.view);
		})
	}

	updateGlobalRevealStyle() {
		document.body.removeClass(	'privacy-glasses-blur',
									'privacy-glasses-reveal-on-hover'
		);
		if (this.currentLevel === 'hide-all') {
			document.body.classList.add('privacy-glasses-blur');
		}
		if (this.settings.hoverToReveal) {
			document.body.classList.add('privacy-glasses-reveal-on-hover');
		}
	}

	addBlurLevelEl(doc: Document) {
		this.blurLevelStyleEl = doc.createElement('style');
		this.blurLevelStyleEl.id = 'privacyGlassesBlurLevel';
		doc.head.appendChild(this.blurLevelStyleEl);
		this.updateBlurLevelEl();
	}

	updateBlurLevelEl() {
		if (!this.blurLevelStyleEl) {
			return;
		}
		this.blurLevelStyleEl.textContent = `body {--blurLevel:${this.settings.blurLevel}em};`;
	}
}

interface PrivacyGlassesSettings {
	blurOnStartup: Level;
	privacyGlasses: boolean;
	blurLevel: number;
	blurOnIdleTimeoutSeconds: number;
	hoverToReveal: boolean;
	privateDirs: string;
}

const DEFAULT_SETTINGS: PrivacyGlassesSettings = {
	blurOnStartup: 'hide-private',
	privacyGlasses: false,
	blurLevel: 0.3,
	blurOnIdleTimeoutSeconds: -1,
	hoverToReveal: true,
	privateDirs: ''
}

class privacyGlassesSettingTab extends PluginSettingTab {

	plugin: PrivacyGlassesPlugin;
		constructor(app: App, plugin: PrivacyGlassesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
  
	display(): void {

		let {containerEl} = this;
	
		containerEl.empty();
		containerEl.createEl('h3', {text: 'Privacy Glasses v' + this.plugin.manifest.version});
		containerEl.createEl('a', {text: 'https://github.com/jillalberts/privacy-glasses', href:"https://github.com/jillalberts/privacy-glasses"});
		containerEl.createEl('span', {text: ': documentation, report issues, contact info'});
		containerEl.createEl('br');
		containerEl.createEl('a', {text: 'https://www.buymeacoffee.com/jillalberts', href:"https://www.buymeacoffee.com/jillalberts"});
		containerEl.createEl('span', {text: ': tip jar'});
		containerEl.createEl('p', {text: 'To activate/deactivate Privacy Glasses, click the glasses icon on the left-hand ribbon or run "Privacy Glasses" commands in the Command Palette (Ctrl-P). The command can also be bound to a keyboard shortcut if you wish.'});	

		new Setting(containerEl)
			.setName('Activate Privacy Glasses on startup')
			.setDesc('Indicates whether or not the pluigin will be automatically activated when starting obsidian.')
			.addDropdown((toggle) => {
				toggle.addOptions({
					"hide-all": "Hide all",
					"hide-private": "Hide private (default)",
					"reveal-all": "Reveal all"
				})
				toggle.setValue(this.plugin.settings.blurOnStartup);
				toggle.onChange(async (value) => {
					this.plugin.settings.blurOnStartup = value as Level;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Hide all after user inactivity')
			.setDesc('Inactivity time after which Privacy Glasses will hide all. -1 to disable auto-hiding.')
			.addText((textfield) => {
				textfield.setPlaceholder("-1");
				textfield.inputEl.type = "number";
				textfield.inputEl.min = "-1";
				textfield.setValue(String(this.plugin.settings.blurOnIdleTimeoutSeconds));
				textfield.onChange(async (value) => {
					let parsed = parseFloat(value);
					if (isNaN(parsed)){
						parsed = -1;
					}
					this.plugin.settings.blurOnIdleTimeoutSeconds = parsed;
					await this.plugin.saveSettings();
				});
			  });

		new Setting(containerEl)
			.setName('Hover To Reveal')
			.setDesc('Indicates whether or not to reveal content when hovering the cursor over it.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.hoverToReveal);
				toggle.onChange(async (value) => {
					this.plugin.settings.hoverToReveal = value;
					await this.plugin.updateLeavesAndGlobalReveals();
					await this.plugin.saveSettings();
				});
			});
     

		var sliderEl = new Setting(containerEl);
		let sliderElDesc = 'Higher is blurrier. Default=60, current=';
		sliderEl 
			.setName('Blur Level (only affects elements for which "Blurry Text" is selected below)')
			.setDesc(sliderElDesc + Math.round(this.plugin.settings.blurLevel*100)) 
									// ^ need rounding to not show values like '55.00000000000001'
			.addSlider(slider => slider
				.setLimits(0.1, 1.5, 0.05)
				.setValue(this.plugin.settings.blurLevel)
				.onChange(async (value) => {
					this.plugin.settings.blurLevel = value;
					sliderEl.setDesc(sliderElDesc + Math.round(this.plugin.settings.blurLevel*100));
					await this.plugin.updateBlurLevelEl();
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Private directories')
			.setDesc('Comma-separated list of directories, files in which are considered private')
			.addText(text => text
				.setPlaceholder('finance,therapy')
				.setValue(this.plugin.settings.privateDirs)
				.onChange(async (value) => {
				this.plugin.settings.privateDirs = value;
				await this.plugin.saveSettings();
				})
			);
	}
  }

const eyeSlashIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M53.9 34.6a8 8 0 0 0-11.8 10.8l19.2 21.1C25 88.8 9.4 123.2 8.7 124.8a8.2 8.2 0 0 0 0 6.5c.3.7 8.8 19.5 27.6 38.4c25.1 25 56.8 38.3 91.7 38.3a128.6 128.6 0 0 0 52.1-10.8l22 24.2a8 8 0 0 0 5.9 2.6a8.2 8.2 0 0 0 5.4-2.1a7.9 7.9 0 0 0 .5-11.3Zm47.3 75.9l41.7 45.8A31.6 31.6 0 0 1 128 160a32 32 0 0 1-26.8-49.5ZM128 192c-30.8 0-57.7-11.2-79.9-33.3A128.3 128.3 0 0 1 25 128c4.7-8.8 19.8-33.5 47.3-49.4l18 19.8a48 48 0 0 0 63.6 70l14.7 16.2A112.1 112.1 0 0 1 128 192Zm119.3-60.7c-.4.9-10.5 23.3-33.4 43.8a8.1 8.1 0 0 1-5.3 2a7.6 7.6 0 0 1-5.9-2.7a8 8 0 0 1 .6-11.3A131 131 0 0 0 231 128a130.3 130.3 0 0 0-23.1-30.8C185.7 75.2 158.8 64 128 64a112.9 112.9 0 0 0-19.4 1.6a8.1 8.1 0 0 1-9.2-6.6a8 8 0 0 1 6.6-9.2a132.4 132.4 0 0 1 22-1.8c34.9 0 66.6 13.3 91.7 38.3c18.8 18.9 27.3 37.7 27.6 38.5a8.2 8.2 0 0 1 0 6.5ZM134 96.6a8 8 0 0 1 3-15.8a48.3 48.3 0 0 1 38.8 42.7a8 8 0 0 1-7.2 8.7h-.8a7.9 7.9 0 0 1-7.9-7.2A32.2 32.2 0 0 0 134 96.6Z"/></svg>`;
const eyeClosedIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M234.4 160.8a12 12 0 0 1-10.4 18a11.8 11.8 0 0 1-10.4-6l-16.3-28.2a126 126 0 0 1-29.4 13.5l5.2 29.4a11.9 11.9 0 0 1-9.7 13.9l-2.1.2a12 12 0 0 1-11.8-9.9l-5.1-28.7a123.5 123.5 0 0 1-16.4 1a146.3 146.3 0 0 1-16.5-1l-5.1 28.7a12 12 0 0 1-11.8 9.9l-2.1-.2a11.9 11.9 0 0 1-9.7-13.9l5.2-29.4a125.3 125.3 0 0 1-29.3-13.5L42.3 173a12.1 12.1 0 0 1-10.4 6a11.7 11.7 0 0 1-6-1.6a12 12 0 0 1-4.4-16.4l17.9-31a142.4 142.4 0 0 1-16.7-17.6a12 12 0 1 1 18.6-15.1C57.1 116.8 84.9 140 128 140s70.9-23.2 86.7-42.7a12 12 0 1 1 18.6 15.1a150.3 150.3 0 0 1-16.7 17.7Z"/></svg>`;
const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M247.3 124.8c-.3-.8-8.8-19.6-27.6-38.5C194.6 61.3 162.9 48 128 48S61.4 61.3 36.3 86.3C17.5 105.2 9 124 8.7 124.8a7.9 7.9 0 0 0 0 6.4c.3.8 8.8 19.6 27.6 38.5c25.1 25 56.8 38.3 91.7 38.3s66.6-13.3 91.7-38.3c18.8-18.9 27.3-37.7 27.6-38.5a7.9 7.9 0 0 0 0-6.4ZM128 192c-30.8 0-57.7-11.2-79.9-33.3A130.3 130.3 0 0 1 25 128a130.3 130.3 0 0 1 23.1-30.8C70.3 75.2 97.2 64 128 64s57.7 11.2 79.9 33.2A130.3 130.3 0 0 1 231 128c-7.2 13.5-38.6 64-103 64Zm0-112a48 48 0 1 0 48 48a48 48 0 0 0-48-48Zm0 80a32 32 0 1 1 32-32a32.1 32.1 0 0 1-32 32Z"/></svg>`