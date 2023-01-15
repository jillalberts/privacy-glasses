# 👓 Privacy Glasses plugin for Obsidian

"Privacy Glasses" plugin for [Obsidian](http://obsidian.md). Preserve your privacy when working in public!

![](https://raw.githubusercontent.com/jillalberts/privacy-glasses/master/assets/screencast.gif)

https://github.com/jillalberts/privacy-glasses

---

# note:

#### I am no longer working on this project very actively, but the code is open-source and distributed under the MIT license, so anyone who wants to fix or improve anything is free to submit pull requests (or even fork the project!).

---

### 👀 What it does

This plugin creates a "Privacy Glasses" icon (👓) on the left-hand ribbon as well as a "Toggle Privacy Glasses" command in the Command Palette (Ctrl-P).

- Activating either one will toggle Privacy Glasses. 

When Privacy Glasses is active your document's text, as well as the title of the current document in the header, will be obfuscated according to the settings you choose. You can also optionally blur text in Obsidian's sidebars.

**❗ You can temporarily reveal a small section of text simply by hovering your mouse over it.**

- This is useful for finding your place in a document or doing a quick check for typos.

- To obfuscate it again, just move your mouse pointer away.

In Edit Mode you can continue to type and navigate via your keyboard without revealing any text (as long as your mouse pointer is elsewhere).

To reveal all your text again, just click the "Privacy Glasses" icon (👓) again in the left ribbon or run the "Toggle Privacy Glasses" command in the Command Palette (Ctrl-P) .

This plugin works with most themes in either Light mode or Dark Mode.

### ❓Why?

- You want to work on your brilliant screenplay on the bus/train without the person sitting next to you stealing your amazing ideas.

- You are journaling at a coffee shop and don't want people at nearby tables to read your deepest inner thoughts.

- You are drafting a sensitive company memo on an airplane and don't want your seatmate to snap a picture of what you're typing.

- You're a writer who just wants to get words down on the page while limiting your habit of going back to self-edit.

### ❌ What this plugin does NOT do

- This plugin does not encrypt your writing.
	- It just temporarily layers a new CSS style on top of your current Obsidian theme. Your files remain unchanged.

- This plugin does not read or change any of the markdown files in your vault.
	- It just temporarily layers new CSS styles on top of your current Obsidian theme. It knows nothing about the contents of your files.

- This plugin does not provide any security against anything other than someone casually reading off of your screen.

- This plugin does not connect to the internet for any reason. (However, if you click one of the links in the settings dialog then Obsidian will launch your browser to load the website.)

### 💪 For power users

- The "Toggle Privacy Glasses" command can be bound to a keyboard shortcut in Obsidian's settings for maximum ease of activation!

- You can combine this plugin with the "Hider" plugin to hide Obsidian's title bar, making it impossible for an onlooker to see the name of your vault!

- You can work on a sensitive obfuscated document while keeping a non-sensitive one visible in a second pane! 
	- In the plugin's settings choose an obfuscation mode for Edit Mode, but select `[Off]` for Preview Mode.
	- Activate Privacy Glasses (through the 👓 ribbon icon or "Toggle Privacy Glasses" command)
	- Now you can open your documents in different panes and switch the non-sensitive one(s) to Preview Mode. The sensitive document you're working on in Edit Mode will remain obfuscated while the non-sensitive one(s) in Preview Mode will remain fully visible.
	- If you need help with working with multiple panes, you can refer to the "Panes" section of the Obsidian Help vault.

### ⚠️ Issues

- This plugin already works pretty well across a variety of themes, but **if you're seeing sections of unblurred text even when your mouse pointer isn't over it, please email me or file an issue on GitHub**.

	- Please include what exactly is not blurred and what theme, extensions, and CSS snippets you're using. In the meantime, you can try using a different theme as a workaround. (If the issue persists across themes, including with the "None" theme, it's almost certainly caused by interference with another plugin or snippet; I'd be interested in taking a look.)

- Please report issues per the "Contact the author" section below.

### ✍ Contact the author

- To report an issue or suggest a feature:

	- open an issue on GitHub: https://github.com/jillalberts/privacy-glasses/issues

	- or email jillian dot alberts at gmail dot com

### 🕰 Release 

- 2023-01-15: Version 0.7.1
	- Finish up the major update, thanks again to the work of #0xorial 
		- Fixed startup blurring setting.
    	- Implemented revealing under caret
    	- Implemented marking note as private
- 2023-01-14: Version 0.7.0
	- Major update, thanks to @0xorial . 
		- (Tech) Switched to .scss
    	- (Tech) Started using prettier
    	- Switched to {filter: blur()} for blurring everything
    	- Implemented "3-mode" way - reveal all/blur all/blur content in folders, specified as private
- 2023-01-07: Version 0.6.0
	- Added blur on startup, timeout, disable hover features among others thanks to @0xorial
- 2022-10-27: Version 0.5.3
	- Added blurring of markdown code blocks thanks to @leoccyao
- 2022-06-04: Version 0.5.2
        - Fixed an error in the deployment of 0.5.1.
- 2022-05-26: Version 0.5.1
	- Added support for blurring the UI of the "Quick Explorer" plugin, thanks to @leoccyao
- 2022-05-18: Version 0.5.0
	- Added support for live preview mode thanks to @leoccyao
- 2021-04-06: Version 0.4.3
	- minor code improvements
- 2021-04-05: Version 0.4.2
	- cleaned up statusbar code
	- activation messages now match (and are stored in variables)
	- The `style` element containing blurLevel is now referenced in a better way in the code
	- The `style` element containing blurLevel is now only created when the plugin is actively on (not just when the plugin's enabled and available to use). It is cleanly removed when the plugin is toggled off (rather than waiting until the plugin is unloaded to be removed)
	- the variable that stores whether or not the plugin is on is no longer saved in the plugin's settings, since I think having the plugin activate upon first loading a vault would probably be more annoying than useful. If users want the ability to save the plugin's state across sessions then I can bring it back in the future.
	- misc small code improvements
- 2021-04-04: Version 0.4.1
	- Changed blur level selector to a slider (was a dropdown)
		- Added indication of current blur level setting next to the slider
	- Activating or deactivating Privacy Glasses mode now provides a more visible notification
	- Bug fix: the `<style>` element the plugin creates is now properly removed when the plugin is unloaded
	- removed svg tags from icon variable
	- Cleaned up and improved code
	- TODO for next version: try to improve CSS, do more compatibility testing
- 2021-04-04: Version 0.4.0, first version to be fully submitted to the Obsidian Community Plugins directory
	- Fixed header blur levels
	- Added option to adjust the blur level in a (new) settings dialog
	- Improved ability to respect various themes' colors while text is blurred
	- Added ability to blur text in Obsidian's sidebars
	- Added blur functionality for Preview Mode
	- Added "Solid Blocks" obfuscation option for Edit Mode, Preview Mode, and Sidebars
	- Added "Circles" experimental obfuscation option for Edit Mode, Preview Mode, and Sidebars
	- Changed name to "Privacy Glasses"
	- squashed many bugs
- 2021-03-30: Version 0.1 (preliminary release under the name "Blurry Edit Mode"). Supported blurry text (only) in Edit Mode (only). Adjusting the blur level required manually editing a CSS file.



# Test cases
- full privacy
	- left panels hidden, right panels hidden
	- hover on reveal works
- half privacy
	- left panel visible (maybe hide conent of private folders)
	- hover on reveal works
