import * as vscode from 'vscode';

export class LdapFilterFormatter {
    public formatLdapFilter(): void {
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

                if (currentChar === '(') {
                    stack.push(currentChar);
                    newText += '\n' + indent.repeat(stack.length);
                } else if (currentChar === ')') {
                    stack.pop();
                    if (index + 1 < fullText.length && fullText[index + 1] !== ')') {
                        newText += '\n' + indent.repeat(stack.length);
                    }
                }
                index++;
            }

            // Replace the document content with the formatted text
            editor.edit(editBuilder => {
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
                editBuilder.replace(new vscode.Range(start, end), newText);
            });
        }
    }
}