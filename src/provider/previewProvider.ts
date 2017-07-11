import * as vscode from 'vscode';
import { ReferenceDocumentation } from '../referenceDocumentation';
import { fromDocumentToComponent, getCurrentSymbol } from '../documentService';
import * as _ from 'lodash';

export class PreviewProvider implements vscode.TextDocumentContentProvider {
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

  public constructor(public referenceDocumentation: ReferenceDocumentation) {}
  public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
    let editor = vscode.window.activeTextEditor;
    if (editor.document.languageId !== 'html') {
      return null;
    }
    return new Promise((resolve, reject) => {
      const currentPosition = vscode.window.activeTextEditor.selection.start;
      const currentComponent = fromDocumentToComponent(
        this.referenceDocumentation,
        currentPosition,
        vscode.window.activeTextEditor.document
      );
      if (currentComponent) {
        const currentSymbol = getCurrentSymbol(
          currentPosition,
          vscode.window.activeTextEditor.document
        );
        const currentRange = new vscode.Range(currentSymbol.location.range.start, currentSymbol.location.range.end);
        const currentHTml = vscode.window.activeTextEditor.document.getText(currentRange);
        resolve(
          '<html><head></head><body>Current component is ' +
            currentComponent.name +
            '<br/><pre>' +
            _.escape(currentHTml) +
            '</pre></body></html>'
        );
      } else {
        resolve('<html><head></head><body>Not a component !</body></html>');
      }
    });
  }

  public update(uri: vscode.Uri) {
    this._onDidChange.fire(uri);
  }

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event;
  }
}
