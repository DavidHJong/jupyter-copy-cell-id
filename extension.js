const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.copyJupyterCellId', async (...args) => {
        let cell = null;

        // The argument passed can sometimes be the cell directly or an object containing the cell
        if (args.length > 0) {
            let arg = args[0];
            if (arg && arg.notebook && arg.document) {
                cell = arg;
            } else if (arg && arg.cell && arg.cell.notebook) {
                cell = arg.cell;
            }
        }

        // Fallback: find the active cell
        if (!cell) {
            const editor = vscode.window.activeNotebookEditor;
            if (editor && editor.selections.length > 0) {
                const cellIndex = editor.selections[0].start;
                cell = editor.notebook.cellAt(cellIndex);
            }
        }

        if (cell) {
            // Find the cell ID. Depending on the VS Code version and Jupyter extension version, 
            // the metadata structure can vary slightly.
            let cellId = null;
            
            if (cell.metadata) {
                cellId = cell.metadata.id || 
                         (cell.metadata.custom && cell.metadata.custom.id) ||
                         (cell.metadata.custom && cell.metadata.custom.metadata && cell.metadata.custom.metadata.id);
            }
            
            if (cellId) {
                // Copy to clipboard
                await vscode.env.clipboard.writeText(cellId);
                vscode.window.showInformationMessage(`Copied Cell ID: ${cellId}`);
            } else {
                vscode.window.showWarningMessage('No ID found. Metadata: ' + JSON.stringify(cell.metadata));
            }
        } else {
            vscode.window.showWarningMessage('No active notebook cell found. Args length: ' + args.length);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
