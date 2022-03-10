## Cursor Position

This plugin remembers the recent 20 cursor positions history and allows you to jump to them back and forth like VSCode.

### Limitations

- It remembers the cursor position once a second
- It resets the cursor history when the another file is opened
- The history is not saved permanently
- The forward history will be resetted when you make new move while navigating the history

### Commands

- Cursor Position: Go back
- Cursor Position: Go forward

You can set hotkeys for the commands. `^-` for the backward and `^=` for the forward.

### Installation

As it is not a registered plugin you need to install it manually.

- Clone the repository in your plugin folder(Usually `{your-vault}/.obsidian/plugins`)
- `npm install`
- `npm run build`
- Reload Obsidian
