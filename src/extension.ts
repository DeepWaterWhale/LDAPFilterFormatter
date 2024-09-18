// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const formatCommand = vscode.commands.registerCommand('ldapfilterformatter.formatLdapFilter', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			let fullText: string = document.getText();

			// Remove all whitespace
			fullText = fullText.replaceAll(" ", "").replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", "");

			// Add new lines and indents
			let newText: string = "";
			const indent = '  ';
			const stack: string[] = [];
			let index = 0;

			while (index < fullText.length) {
				const currentChar = fullText[index];
				newText += currentChar;
				index += 1;

				if (currentChar === '(') {
					if (fullText[index] === '&' || fullText[index] === '|' || fullText[index] === '!') {
						stack.push("(" + fullText[index]);

						newText += fullText[index];
						newText += '\n' + indent.repeat(stack.length);

						index += 1;
					}
					else {
						stack.push("(");
					}
				}
				else if (currentChar === ')') {
					{
						if (index + 2 < fullText.length && fullText.substring(index, index + 3) === "{n}") {
							newText += "{n}";
							index += 3;
						}
						
						stack.pop();
						if (index < fullText.length && fullText[index] === ')') {
							newText += '\n' + indent.repeat(stack.length - 1);
						}
						else {
							newText += '\n' + indent.repeat(stack.length);
						}
					}
				}
			}

			editor.edit(editBuilder => {
				const firstLine = document.lineAt(0);
				const lastLine = document.lineAt(document.lineCount - 1);
				const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
				editBuilder.replace(textRange, newText);
			});
		}
	});

	context.subscriptions.push(formatCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }
