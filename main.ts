/* 	
	Privacy Glasses plugin for Obsidian
	Copyright 2021 Jill Alberts
	Licensed under the MIT License (http://opensource.org/licenses/MIT) 
*/

import { App, Plugin, PluginSettingTab, Setting, addIcon, ToggleComponent, Notice, MarkdownView, MarkdownFileInfo, Editor, View} from 'obsidian';

function isMarkdownFileInfoView(x: unknown):x is MarkdownFileInfo {
	const anyX = x as any;
	return !!Object.getOwnPropertyDescriptor(anyX, 'file')
} 

export default class PrivacyGlassesPlugin extends Plugin {

	settings: PrivacyGlassesSettings;
	statusBar: HTMLElement;
	noticeMsg: Notice;
	blurLevelStyleEl: HTMLElement;
	lastEventTime: number | undefined;
	currentLevel: 'hide-all' | 'hide-private' | 'reveal-all';

	async onload() {
        		
		this.statusBar = this.addStatusBarItem();

		await this.loadSettings();

		this.addSettingTab(new privacyGlassesSettingTab(this.app, this));

		addIcon('glasses', privacyGlassesIcon);

		this.addRibbonIcon('glasses', 'Hide all', () => {
			this.currentLevel = 'hide-all';
			this.updateLeavesAndGlobalReveals();
		});
		this.addRibbonIcon('glasses', 'Reveal non-private', () => {
			this.currentLevel = 'hide-private';
			this.updateLeavesAndGlobalReveals();
		});
		this.addRibbonIcon('glasses', 'Reveal all', () => {
			this.currentLevel = 'reveal-all';
			this.updateLeavesAndGlobalReveals();
		});


		// todo: multiple levels
		// this.addCommand({
		// 	id: 'toggle-privacy-glasses', 
		// 	name: 'Toggle Privacy Glasses',
		// 	callback: () => {
		// 		this.toggleGlasses();
		// 	}
		// });

		this.registerInterval(window.setInterval(() => {
			this.checkIdleTimeout();
		}, 1000));

		function patchView(view: View, onBeforeStateChange: () => void) {
			const anyView = view as any;

			const original = anyView.__proto__.setState;

			function wrapper() {
				onBeforeStateChange();
				return original.apply(this, arguments);
			}

			anyView.setState = wrapper.bind(view);

			return anyView;
		}

		this.registerEvent(this.app.workspace.on('active-leaf-change', (e) => {
			patchView(e.view, () => {
				this.revealed.forEach(r => {
					r.removeClass('privacy-glasses-reveal');
				});
				this.revealed = [];
			})
			this.updateLeafsStyle();
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
		if (this.currentLevel === 'reveal-all' || this.currentLevel === 'hide-all') {
			return true;
		}

		if (!isMarkdownFileInfoView(view)){
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
			if (this.settings.hoverToReveal) {
				document.body.classList.add('privacy-glasses-reveal-on-hover');
			}
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
	blurOnStartup: boolean;
	privacyGlasses: boolean;
	blurLevel: number;
	blurOnIdleTimeoutSeconds: number;
	hoverToReveal: boolean;
	privateDirs: string;
}

const DEFAULT_SETTINGS: PrivacyGlassesSettings = {
	blurOnStartup: false,
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
		containerEl.createEl('p', {text: 'To activate/deactivate Privacy Glasses, click the glasses icon on the left-hand ribbon or run the "Toggle Privacy Glasses" command in the Command Palette (Ctrl-P). The command can also be bound to a keyboard shortcut if you wish.'});	
		containerEl.createEl('p', {text: 'Experimental settings that don\'t always work as well as you might like are marked with a "⚠️". They are safe to use but can behave in annoying ways.'});

		new Setting(containerEl)
			.setName('Activate Privacy Glasses on startup')
			.setDesc('Indicates whether or not the pluigin will be automatically activated when starting obsidian.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.blurOnStartup);
				toggle.onChange(async (value) => {
					this.plugin.settings.blurOnStartup = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Activate Privacy Glasses after user inactivity')
			.setDesc('Inactivity time after which Privace Glasses will be automatically activated. -1 to never activate automatically.')
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
			.setDesc('Indicates whether or not to reveal text when hovering the cursor over it.')
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
			.setName('Locations with increased privacy')
			.setDesc('Comma-separated list of directories, files in which are blurred in semi-private mode')
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

const privacyGlassesIcon = `<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 18.242188 7.664062 C 15.429688 7.84375 12.015625 8.40625 6.914062 9.53125 C 6.140625 9.703125 4.328125 10.070312 2.890625 10.359375 C 1.453125 10.648438 0.234375 10.890625 0.1875 10.90625 C 0.0703125 10.929688 -0.0390625 13.554688 0.0234375 14.570312 C 0.125 16.132812 0.375 16.703125 1.5 17.992188 C 3.414062 20.1875 3.726562 20.710938 4.171875 22.539062 C 5.171875 26.609375 6.757812 31.226562 8.429688 34.914062 C 9.46875 37.21875 10.859375 38.625 13.398438 39.929688 C 17.726562 42.164062 23.382812 42.898438 29.453125 42.03125 C 33.164062 41.492188 36.179688 39.9375 38.867188 37.179688 C 40.78125 35.210938 42.304688 32.976562 43.945312 29.726562 C 44.78125 28.078125 45.03125 27.40625 45.664062 25.039062 C 46.179688 23.125 46.445312 22.335938 46.921875 21.367188 C 47.59375 19.96875 48 19.679688 49.335938 19.625 C 49.765625 19.609375 50.59375 19.632812 51.171875 19.671875 C 52.429688 19.757812 52.664062 19.851562 53.289062 20.523438 C 54.109375 21.414062 54.625 22.492188 55.304688 24.75 C 56.984375 30.34375 59.09375 34.21875 61.960938 36.992188 C 63.320312 38.304688 64.382812 39.0625 66.007812 39.875 C 69.179688 41.46875 72.679688 42.265625 76.523438 42.265625 C 83.632812 42.265625 89.484375 39.320312 92.46875 34.242188 C 93.53125 32.445312 94.09375 30.851562 95.234375 26.40625 C 96.570312 21.203125 96.90625 20.203125 97.734375 18.984375 C 98.085938 18.46875 98.71875 17.867188 99.273438 17.515625 C 99.960938 17.078125 99.960938 17.085938 99.945312 14.21875 C 99.945312 13.554688 99.945312 12.742188 99.953125 12.421875 C 99.96875 11.34375 99.609375 11.039062 97.945312 10.734375 C 96.609375 10.484375 95.679688 10.265625 93.476562 9.65625 C 90.921875 8.945312 90.515625 8.851562 88.367188 8.515625 C 83.03125 7.671875 81.625 7.539062 78.757812 7.601562 C 74.945312 7.6875 72.304688 8.0625 64.492188 9.609375 C 59.21875 10.65625 57.03125 11.023438 54.507812 11.289062 C 52.570312 11.492188 50.179688 11.570312 48.46875 11.484375 C 45.40625 11.335938 43.914062 11.109375 39.257812 10.078125 C 34.960938 9.125 34.09375 8.960938 31.203125 8.554688 C 25.0625 7.703125 21.523438 7.460938 18.242188 7.664062 Z M 18.242188 7.664062 "/>`