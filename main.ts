import { App, Plugin, PluginSettingTab, Setting, addIcon} from 'obsidian';

export default class PrivacyGlassesPlugin extends Plugin {

	settings: PrivacyGlassesSettings;

	async onload() {
		console.log('loading privacy-glasses plugin');

		this.removeStyle();

		await this.loadSettings();

		this.addSettingTab(new privacyGlassesSettingTab(this.app, this));
		
		let statusBar = this.addStatusBarItem();
		
		statusBar.setText(this.settings.privacyGlasses ? 'Privacy Glasses ON' : 'Privacy Glasses off');

		addIcon('glasses', privacyGlassesIcon);

		this.addRibbonIcon('glasses', 'Toggle Privacy Glasses', () => {
			this.settings.privacyGlasses = !this.settings.privacyGlasses;
			this.updateStyle();
			statusBar.setText(this.settings.privacyGlasses ? 'Privacy Glasses ON' : 'Privacy Glasses off');
			this.saveSettings();
		});
		
		this.addCommand({
			id: 'toggle-privacy-glasses', name: 'Toggle Privacy Glasses',
			callback: () => {
			this.settings.privacyGlasses = !this.settings.privacyGlasses;
			this.updateStyle();
			statusBar.setText(this.settings.privacyGlasses ? 'Privacy Glasses ON' : 'Privacy Glasses off');
			this.saveSettings();
			}
		});
		

		this.refresh()
	}

	refresh() {
		// re-load the style
		this.updateStyle()
	}

	onunload() {
		this.settings.privacyGlasses = false;
		this.saveSettings();
		this.removeStyle();
		console.log('unloading privacy-glasses plugin');
	}


	async loadSettings() {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}
	
	async saveSettings() {
		await this.saveData(this.settings);
	}
	
	// update the styles when first loaded or after changing settings
	updateStyle() {
		this.removeStyle();

        const el = document.getElementById('privacyGlasses');
		if (!el) {
			const el = document.createElement('style'); 
			el.id = 'privacyGlasses';
			document.getElementsByTagName("head")[0].appendChild(el);
		};

		el.innerText = `body {--blurLevel:${this.settings.blurLevel}};`;

		if (this.settings.privacyGlasses) {

			document.body.classList.toggle('privacy-glasses', this.settings.privacyGlasses);

			//sidebars (UI)
			if (this.settings.uiBlurMethod == 'blurUI') {
				document.body.classList.toggle('blur-ui', true);
			}
			if (this.settings.uiBlurMethod == 'blockUI') {
				document.body.classList.toggle('block-ui', true);
			}
			if (this.settings.uiBlurMethod == 'circlesUI') {
				document.body.classList.toggle('circles-ui', true);
			}

			//edit mode
			if (this.settings.editBlurMethod == 'blurEdit') {
				document.body.classList.toggle('blur-edit', true);
			}
			if (this.settings.editBlurMethod == 'blockEdit') {
				document.body.classList.toggle('block-edit', true);
			}
			if (this.settings.editBlurMethod == 'circlesEdit') {
				document.body.classList.toggle('circles-edit', true);
			}

			//preview mode
			if (this.settings.previewBlurMethod == 'blurPreview') {
				document.body.classList.toggle('blur-preview', true);
			}
			if (this.settings.previewBlurMethod == 'blockPreview') {
				document.body.classList.toggle('block-preview', true);
			}
			if (this.settings.previewBlurMethod == 'circlesPreview') {
				document.body.classList.toggle('circles-preview', true);
			}
		};
	}	
	
	removeStyle() {
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
	blurLevel: string;
		editBlurMethod: string;
	uiBlurMethod: string;
	previewBlurMethod: string;
}

const DEFAULT_SETTINGS: PrivacyGlassesSettings = {
	privacyGlasses: false,
	blurLevel: '0.60em',
	editBlurMethod: 'blurEdit',
	uiBlurMethod: 'blurUI',
	previewBlurMethod: 'blurPreview' 
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
	containerEl.createEl('h3', {text: 'Privacy Glasses'});
	//containerEl.createEl('p', {text: 'Preserve your privacy while working in public. No more \'shoulder surfing\'!'});
	containerEl.createEl('a', {text: 'https://github.com/jillalberts/privacy-glasses', href:"https://github.com/jillalberts/privacy-glasses"});
	containerEl.createEl('br');
	containerEl.createEl('a', {text: 'https://www.buymeacoffee.com/jillalberts', href:"https://www.buymeacoffee.com/jillalberts"});
	containerEl.createEl('p', {text: 'To activate Privacy Glasses, click the glasses icon on the left-hand ribbon or run the "Toggle Privacy Glasses" command in the Command Palette (Ctrl-P). The command can also be bound to a keyboard shortcut if you wish.'});	

	containerEl.createEl('p', {text: 'Experimental settings that don\'t always work as well as you might like are marked with a "⚠️". They should be safe to use, but may behave in annoying ways.'});
  
	new Setting(containerEl)
		.setName('Blur Level (only affects elements for which "Blurry Text" is selected below)')
		.setDesc('Higher = blurrier. Default is 60')
		.addDropdown(dropdown => dropdown
			.addOption('0.1em','10')
			.addOption('0.2em','20')
			.addOption('0.3em','30')
			.addOption('0.4em','40')
			.addOption('0.50em','50')
			.addOption('0.60em','60')
			.addOption('0.70em','70')
			.addOption('0.80em','80')
			.addOption('0.90em','90')
			.addOption('1.0em','100')
			.setValue(this.plugin.settings.blurLevel)
		.onChange((value) => {
			this.plugin.settings.blurLevel = value;
			this.plugin.saveData(this.plugin.settings);
			this.plugin.refresh();
	}));

	new Setting(containerEl)
		.setName('Obfuscation method for Edit Mode')
		.setDesc('How to obfuscate the document\'s text in Edit Mode')
		.addDropdown(dropdown => dropdown
			.addOption('','[Off]')
			.addOption('blurEdit','Blurry Text')
			.addOption('blockEdit','Solid Blocks')
			.addOption('circlesEdit','Circles ⚠️')
			.setValue(this.plugin.settings.editBlurMethod)
		.onChange((value) => {
		  this.plugin.settings.editBlurMethod = value;
		  this.plugin.saveData(this.plugin.settings);
		  this.plugin.refresh();
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
	.onChange((value) => {
	  this.plugin.settings.previewBlurMethod = value;
	  this.plugin.saveData(this.plugin.settings);
	  this.plugin.refresh();
	}));

	new Setting(containerEl)
		.setName('Obfuscation method for Sidebars')
		.setDesc('How to obfuscate your file list, tags, outline, etc')
		.addDropdown(dropdown => dropdown
			.addOption('','[Off]')
		  	.addOption('blurUI','Blurry Text')
		  	.addOption('blockUI','Solid Blocks')
			.addOption('circlesUI','Circles')
		  	.setValue(this.plugin.settings.uiBlurMethod)
		.onChange((value) => {
		  this.plugin.settings.uiBlurMethod = value;
		  this.plugin.saveData(this.plugin.settings);
		  this.plugin.refresh();
	  }));  
	}
  }

const privacyGlassesIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="tasks" class="svg-inline--fa fa-tasks fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g></g><path d="M251.627 245.719c-12.37 64.798-74.957 107.284-139.766 94.904-64.819-12.38-107.315-74.978-94.935-139.776 12.39-64.829 247.112-19.968 234.701 44.871z" fill="currentColor" /><path d="M260.373 245.719c12.37 64.798 74.967 107.284 139.786 94.904 64.798-12.38 107.305-74.978 94.925-139.776-12.401-64.829-247.112-19.968-234.711 44.871z" fill="currentColor" /></svg>`