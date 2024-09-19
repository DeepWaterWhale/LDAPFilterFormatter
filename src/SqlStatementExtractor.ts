import * as vscode from 'vscode';
import { parseStringPromise } from 'xml2js';

export class SqlStatementExtractor {
    public async extractSqlStatements(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const fileName = document.fileName;

            // Check if the current active file is a SQL plan file
            if (!fileName.endsWith('.sqlplan') && !fileName.endsWith('.xml')) {
                vscode.window.showErrorMessage('The active file is not a SQL plan file.');
                return;
            }

            const queryPlan: string = document.getText();
            const xml = await parseStringPromise(queryPlan);
            const sqlStatements: string[] = [];
            sqlStatements.push("DECLARE @query NVARCHAR(MAX);");
            sqlStatements.push("DECLARE @param NVARCHAR(MAX);");
            sqlStatements.push("SET @query = N'");
            sqlStatements.push(this.getSqlQueryString(xml));
            sqlStatements.push("';");
            sqlStatements.push("SET @param = N'");
            sqlStatements.push(this.getSqlParamsDefinitionString(xml));
            sqlStatements.push("';");
            sqlStatements.push("EXEC sp_executesql @query, @param,");
            sqlStatements.push(this.getSqlParamsValuesString(xml));
            sqlStatements.push(";");

            const combinedSqlStatements = sqlStatements.join('\n');
            const newDocument = await vscode.workspace.openTextDocument({ content: combinedSqlStatements, language: 'sql' });
            const newEditor = await vscode.window.showTextDocument(newDocument);

            // Format the new document
            await vscode.commands.executeCommand('editor.action.formatDocument', newEditor);
        }
    }

    private getSqlQueryString(xml: any): string {
        // Adjust the path based on the actual structure of your XML
        const queryString = this.getStringValueByPathAndAttribute(xml, ['ShowPlanXML', 'BatchSequence', 'Batch', 'Statements', 'StmtSimple'], 'StatementText');
        return queryString ? queryString : '';
    }

    private getSqlParamsDefinitionString(xml: any): string {
        // Adjust the path based on the actual structure of your XML
        const params = this.getElementsByPath(xml, ['ShowPlanXML', 'BatchSequence', 'Batch', 'Statements', 'StmtSimple', 'QueryPlan', 'ParameterList', 'Parameter']);
        return params.map((param: any) => `@${param.$.Column} ${param.$.ParameterDataType}`).join(', ');
    }

    private getSqlParamsValuesString(xml: any): string {
        // Adjust the path based on the actual structure of your XML
        const params = this.getElementsByPath(xml, ['ShowPlanXML', 'BatchSequence', 'Batch', 'Statements', 'StmtSimple', 'QueryPlan', 'ParameterList', 'Parameter']);
        return params.map((param: any) => `@${param.$.Column} = ${param.$.ParameterCompiledValue}`).join(', ');
    }

    private getElementsByPath(obj: any, path: string[]): any[] {
        let current = obj;
        for (const segment of path) {
            if (current[segment]) {
                current = current[segment];
            } else {
                return [];
            }
        }
        return Array.isArray(current) ? current : [current];
    }

    private getStringValueByPathAndAttribute(obj: any, path: string[], attributeName: string): string | null {
        const elements = this.getElementsByPath(obj, path);
        if (elements.length > 0 && elements[0].$ && elements[0].$.hasOwnProperty(attributeName)) {
            return elements[0].$[attributeName];
        }
        return null;
    }
}