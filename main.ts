/* 	
	Privacy Glasses plugin for Obsidian
	Copyright 2021 Jill Alberts
	Licensed under the MIT License (http://opensource.org/licenses/MIT) 
*/

import { App, Plugin, PluginSettingTab, Setting, addIcon, ToggleComponent, Notice} from 'obsidian';

export default class PrivacyGlassesPlugin extends Plugin {

	settings: PrivacyGlassesSettings;
	statusBar: HTMLElement;
	noticeMsg: Notice;
	blurLevelStyleEl: HTMLElement;
	privacyGlasses: boolean = false;

	async onload() {
        		
		this.statusBar = this.addStatusBarItem();

		await this.loadSettings();

		this.addSettingTab(new privacyGlassesSettingTab(this.app, this));

		addIcon('glasses', privacyGlassesIcon);
		
		this.addRibbonIcon('glasses', 'Toggle Privacy Glasses', () => {
			this.toggleGlasses();
		});

		this.addCommand({
			id: 'toggle-privacy-glasses', 
			name: 'Toggle Privacy Glasses',
			callback: () => {
				this.toggleGlasses();
			}
		});

		this.privacyGlasses = true;	// we do not want to automatically activate the plugin upon vault open or initial plugin activation, 
									// so we temporarily set it to true just until it quickly gets flipped to false in toggleGlasses() on the next line
		await this.toggleGlasses(true); // flips this.privacyGlasses to false and updates statusbar. 'true' means do toggle quietly (do not display a Notice)
	}

	async toggleGlasses(quiet: boolean = false) {

		this.privacyGlasses = !this.privacyGlasses;
		
		let pgOnMsg = 'Privacy Glasses On';
		let pgOffMsg = 'Privacy Glasses Off';
		if (!quiet) {
			this.noticeMsg = new Notice(this.privacyGlasses ? pgOnMsg : pgOffMsg, 2000);
		}

		this.statusBar.setText(this.privacyGlasses ? pgOnMsg : pgOffMsg);

		if (this.privacyGlasses) {
			await this.addBlurLevelEl();
		}
		else {
			await this.removeBlurLevelEl();
		}

		this.refresh(false); // false = no settings changes to save
	}

	async refresh(saveIt: boolean) {

		this.updateStyle();
		if (saveIt) {
			await this.saveSettings();
		}
	}

	async onunload() {

		await this.saveSettings();
		await this.removeCssClasses();
		await this.removeBlurLevelEl();
		this.statusBar.remove();
	}

	async loadSettings() {

		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}
	
	async saveSettings() {

		await this.saveData(this.settings);
	}
	
	async updateStyle() {

		await this.removeCssClasses();

		if (this.privacyGlasses) {

			await this.updateBlurLevelEl();

			document.body.classList.add('privacy-glasses');

			if (this.settings.uiBlurMethod == 'blurUI') {document.body.classList.add('blur-ui');}
			if (this.settings.uiBlurMethod == 'blockUI') {document.body.classList.add('block-ui');}
			if (this.settings.uiBlurMethod == 'circlesUI') {document.body.classList.add('circles-ui');}

			if (this.settings.editBlurMethod == 'blurEdit') {document.body.classList.add('blur-edit');}
			if (this.settings.editBlurMethod == 'blockEdit') {document.body.classList.add('block-edit');}
			if (this.settings.editBlurMethod == 'circlesEdit') {document.body.classList.add('circles-edit');}

			if (this.settings.previewBlurMethod == 'blurPreview') {document.body.classList.add('blur-preview');}
			if (this.settings.previewBlurMethod == 'blockPreview') {document.body.classList.add('block-preview');}
			if (this.settings.previewBlurMethod == 'circlesPreview') {document.body.classList.add('circles-preview');}
		}
	}	

	async addBlurLevelEl() {

		this.blurLevelStyleEl = document.createElement('style');
		this.blurLevelStyleEl.id = 'privacyGlassesBlurLevel';
		document.head.appendChild(this.blurLevelStyleEl);
		await this.updateBlurLevelEl();
	}

	async updateBlurLevelEl() {

		this.blurLevelStyleEl.textContent = `body {--blurLevel:${this.settings.blurLevel}em};`;
	}

	async removeBlurLevelEl() {

		if (this.blurLevelStyleEl) {
			this.blurLevelStyleEl.remove();
		}
	}
	
	async removeCssClasses() {

		document.body.removeClass(	'privacy-glasses',
									'blur-ui',
									'block-ui',
									'circles-ui',
									'blur-edit',
									'block-edit',
									'circles-edit',
									'blur-preview',
									'block-preview',
									'circles-preview'
								 );
	}
}

interface PrivacyGlassesSettings {
	privacyGlasses: boolean;
	blurLevel: number;
	editBlurMethod: string;
	previewBlurMethod: string;
	uiBlurMethod: string;
}

const DEFAULT_SETTINGS: PrivacyGlassesSettings = {
	privacyGlasses: false,
	blurLevel: 0.6,
	editBlurMethod: 'blurEdit',
	previewBlurMethod: 'blurPreview',
	uiBlurMethod: 'blurUI'
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
			.setName('Privacy Glasses Activated')
			.setDesc('Indicates whether or not the plugin is currently activated.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.privacyGlasses);
				toggle.onChange(async (value) => {
					await this.plugin.toggleGlasses();
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
					await this.plugin.refresh(true);
				})
			);

		new Setting(containerEl)
			.setName('Obfuscation method for Edit Mode')
			.setDesc('How to obfuscate the document\'s text in Edit Mode')
			.addDropdown(dropdown => dropdown
				.addOption('','[Off]')
				.addOption('blurEdit','Blurry Text')
				.addOption('blockEdit','Solid Blocks')
				.addOption('circlesEdit','Circles ⚠️')
				.setValue(this.plugin.settings.editBlurMethod)
			.onChange(async (value) => {
				this.plugin.settings.editBlurMethod = value;
				await this.plugin.refresh(true);
			}));

		new Setting(containerEl)
		.setName('Obfuscation method for Preview Mode')
		.setDesc('How to obfuscate the document\'s text in Preview Mode')
		.addDropdown(dropdown => dropdown
			.addOption('','[Off]')
			.addOption('blurPreview','Blurry Text')
			.addOption('blockPreview','Solid Blocks ⚠️')
			.addOption('circlesPreview','Circles ⚠️')
			.setValue(this.plugin.settings.previewBlurMethod)
		.onChange(async (value) => {
			this.plugin.settings.previewBlurMethod = value;
			await this.plugin.refresh(true);
		}));

		new Setting(containerEl)
			.setName('Obfuscation method for Sidebars')
			.setDesc('How to obfuscate your file list, tags, outline, etc in Obsidian\'s sidebars')
			.addDropdown(dropdown => dropdown
				.addOption('','[Off]')
				.addOption('blurUI','Blurry Text')
				.addOption('blockUI','Solid Blocks')
				.addOption('circlesUI','Circles')
				.setValue(this.plugin.settings.uiBlurMethod)
			.onChange(async (value) => {
				this.plugin.settings.uiBlurMethod = value;
				await this.plugin.refresh(true);
		}));  
	}
  }

const privacyGlassesIcon = `<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 18.242188 7.664062 C 15.429688 7.84375 12.015625 8.40625 6.914062 9.53125 C 6.140625 9.703125 4.328125 10.070312 2.890625 10.359375 C 1.453125 10.648438 0.234375 10.890625 0.1875 10.90625 C 0.0703125 10.929688 -0.0390625 13.554688 0.0234375 14.570312 C 0.125 16.132812 0.375 16.703125 1.5 17.992188 C 3.414062 20.1875 3.726562 20.710938 4.171875 22.539062 C 5.171875 26.609375 6.757812 31.226562 8.429688 34.914062 C 9.46875 37.21875 10.859375 38.625 13.398438 39.929688 C 17.726562 42.164062 23.382812 42.898438 29.453125 42.03125 C 33.164062 41.492188 36.179688 39.9375 38.867188 37.179688 C 40.78125 35.210938 42.304688 32.976562 43.945312 29.726562 C 44.78125 28.078125 45.03125 27.40625 45.664062 25.039062 C 46.179688 23.125 46.445312 22.335938 46.921875 21.367188 C 47.59375 19.96875 48 19.679688 49.335938 19.625 C 49.765625 19.609375 50.59375 19.632812 51.171875 19.671875 C 52.429688 19.757812 52.664062 19.851562 53.289062 20.523438 C 54.109375 21.414062 54.625 22.492188 55.304688 24.75 C 56.984375 30.34375 59.09375 34.21875 61.960938 36.992188 C 63.320312 38.304688 64.382812 39.0625 66.007812 39.875 C 69.179688 41.46875 72.679688 42.265625 76.523438 42.265625 C 83.632812 42.265625 89.484375 39.320312 92.46875 34.242188 C 93.53125 32.445312 94.09375 30.851562 95.234375 26.40625 C 96.570312 21.203125 96.90625 20.203125 97.734375 18.984375 C 98.085938 18.46875 98.71875 17.867188 99.273438 17.515625 C 99.960938 17.078125 99.960938 17.085938 99.945312 14.21875 C 99.945312 13.554688 99.945312 12.742188 99.953125 12.421875 C 99.96875 11.34375 99.609375 11.039062 97.945312 10.734375 C 96.609375 10.484375 95.679688 10.265625 93.476562 9.65625 C 90.921875 8.945312 90.515625 8.851562 88.367188 8.515625 C 83.03125 7.671875 81.625 7.539062 78.757812 7.601562 C 74.945312 7.6875 72.304688 8.0625 64.492188 9.609375 C 59.21875 10.65625 57.03125 11.023438 54.507812 11.289062 C 52.570312 11.492188 50.179688 11.570312 48.46875 11.484375 C 45.40625 11.335938 43.914062 11.109375 39.257812 10.078125 C 34.960938 9.125 34.09375 8.960938 31.203125 8.554688 C 25.0625 7.703125 21.523438 7.460938 18.242188 7.664062 Z M 18.242188 7.664062 "/>`