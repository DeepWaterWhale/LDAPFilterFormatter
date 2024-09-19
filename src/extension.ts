// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LdapFilterFormatter } from './LdapFilterFormatter';
import { SqlStatementExtractor } from './SqlStatementExtractor';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const ldapFilterFormatter = new LdapFilterFormatter();
    const sqlStatementExtractor = new SqlStatementExtractor();

    const formatCommand = vscode.commands.registerCommand('ldapfilterformatter.formatLdapFilter', () => {
        ldapFilterFormatter.formatLdapFilter();
    });

    const extractSqlCommand = vscode.commands.registerCommand('sqlstatementextractor.extractSqlStatements', () => {
        sqlStatementExtractor.extractSqlStatements();
    });

    context.subscriptions.push(formatCommand);
    context.subscriptions.push(extractSqlCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }