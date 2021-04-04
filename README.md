# 👓 Privacy Glasses plugin for Obsidian

"Privacy Glasses" plugin for [Obsidian](http://obsidian.md). Preserve your privacy when working in public!

![](https://raw.githubusercontent.com/jillalberts/privacy-glasses/master/assets/screencast.gif)

https://github.com/jillalberts/privacy-glasses

https://www.buymeacoffee.com/jillalberts

### 👀 What it does

This plugin creates a "Privacy Glasses" icon (👓) on the left-hand ribbon as well as a "Toggle Privacy Glasses" command in the Command Palette (Ctrl-P).

- Activating either one will toggle Privacy Glasses. 

When Privacy Glasses is active your document's text, as well as the title of the current document in the header, will be obfuscated according to the settings you choose. You can also optionally blur text in Obsidian's sidebars.

- **Blurry Text**: text appears blurred and (hopefully) unreadable. 

	- You can adjust the blur level in the plugin's settings.

- **Solid Blocks:** Text is obscured with solid blocks of the foreground (text) color.

- **Circles** (experimental): All characters appear as circles, like in a password input field. (see "Known Issues" section below)

**❗ In any mode, you can temporarily reveal a small section of text simply by hovering your mouse over it.**

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

### ⚠️ Known Issues

- When "Circles" (experimental) obfuscation mode is activated:
	- In Edit Mode the cursor sometimes appears to jump around.
		- This happens because this mode makes every character the same width, which can alter the line length. The cursor will remain on the same character -- you can keep typing from where you left off -- but it just displays a bit oddly.
	- In both Edit Mode and Preview Mode the line height can change unexpectedly when you hover your mouse over a section.

- "Solid Blocks" mode works okay in Edit Mode, but infor Preview Mode it messes up some formatting and generally behaves oddly.

	- This is due to the CSS `display:inline` which is needed to make the blocks of color fit more tightly to the actual text (rather than being giant blocks of color even where there's no text)

- This plugin already works pretty well across a variety of themes, but **if you're seeing sections of unblurred text even when your mouse pointer isn't over it, please email me or file an issue on GitHub**.

	- Please include what exactly is not blurred and what theme, extensions, and CSS snippets you're using. In the meantime, you can try using a different theme as a workaround. (If the issue persists across themes, including with the "None" theme, it's almost certainly caused by interference with another plugin or snippet; I'd be interested in taking a look.)

- There are undoubtedly many bugs remaining (though they should only affect appearance, nothing that would endanger your files). Please report issues per the "Contact the author" section below.

### 💡 Possible ideas for future versions:

*You can suggest a feature by opening an issue on github.*

- Improve compatibilty with popular plugins? Suggestions and bug reports welcome!

- Further compatibility testing with a variety of themes and uses


### ✍ Contact the author

- To report an issue or suggest a feature:

	- open an issue on GitHub: https://github.com/jillalberts/privacy-glasses/issues

	- or email jillian dot alberts at gmail dot com

- Support the development of this free plugin: https://www.buymeacoffee.com/jillalberts

### 🕰 Release History

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
