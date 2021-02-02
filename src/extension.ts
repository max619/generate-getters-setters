'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wg-getters-and-setters" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.generateGettersAndSetters', () => {
        // The code you place here will be executed every time your command is executed

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let code = ``;
        let reverse: boolean = false;

        for (let selection of editor.selections) {
            reverse = selection.isReversed;
        }

        let selections: vscode.Selection[];
        if (reverse) {
            selections = editor.selections.reverse();
        } else {
            selections = editor.selections;
        }

        for (let selection of selections) {
            code += editor.document.getText(selection);
            code += `\n`;
        }

        let text = code;

        if (text.length < 1) {
            vscode.window.showErrorMessage('No selected properties.');
            return;
        }

        try {
            var getterAndSetter = createGetterAndSetter(text);
            editor.edit(e => e.insert(selections[selections.length - 1].end, getterAndSetter));
        }
        catch (error) {
            console.log(error);
            vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private String name;"');
        }
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposableES6 = vscode.commands.registerCommand('extension.generateGettersAndSettersES6', () => {
        // The code you place here will be executed every time your command is executed

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let code = ``;
        let reverse: boolean = false;

        for (let selection of editor.selections) {
            reverse = selection.isReversed;
        }

        let selections: vscode.Selection[];
        if (reverse) {
            selections = editor.selections.reverse();
        } else {
            selections = editor.selections;
        }

        for (let selection of selections) {
            code += editor.document.getText(selection);
            code += `\n`;
        }

        let text = code;

        if (text.length < 1) {
            vscode.window.showErrorMessage('No selected properties.');
            return;
        }

        try {
            var getterAndSetter = createGetterAndSetterES6(text);
            editor.edit(e => e.insert(selections[selections.length - 1].end, getterAndSetter));
        }
        catch (error) {
            console.log(error);
            vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private String name;"');
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposableES6);
}

function toCamelCase(str: string) {
    return str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1));
}

type FieldInfo = {
    fieldName: string;
    name: string;
    type?: string;
    canBeUndefined: boolean;
};

function tryExtractFieldInfo(line: string): FieldInfo | null {
    const regex = /private\s*(_?(\S*\b))(\?)?\s*(:\s*(\S+))?(\s+=\s+(.+))?;/;

    const regexResult = regex.exec(line);
    if (!regexResult || regexResult.length === 0) {
        return null;
    }

    return {
        fieldName: regexResult[1],
        name: regexResult[2],
        type: regexResult[5] && regexResult[5],
        canBeUndefined: regexResult[3] === '?' ? true : false
    };
}

function createGetterAndSetterInternal(textProperties: string, codeGenerator: (info: FieldInfo) => string) {
    const rows = textProperties.split('\n').filter((line) => line.trim() !== '').map((line) => line.trim());

    let generatedCode = `\n`;
    for (const p of rows) {

        const fieldInfo = tryExtractFieldInfo(p);

        if (fieldInfo) {
            generatedCode += codeGenerator(fieldInfo) + '\n';
        }
    }

    return generatedCode;
}

function createGetterAndSetter(textProperties: string) {
    return createGetterAndSetterInternal(textProperties, (fi) => {
        return `
            public ${(fi.type === "Boolean" || fi.type === "boolean" ? "is" : "get")}${toCamelCase(fi.name)}()${fi.type ? `: ${fi.type}` : ''}${fi.canBeUndefined ? ' | undefined' : ''} {
                return this.${fi.fieldName};
            }\n
            public set${toCamelCase(fi.name)}(value${fi.type ? `: ${fi.type}` : ' /* Unknown type (Fix me)*/'}${fi.canBeUndefined ? ' | undefined' : ''}): void {
                this.${fi.fieldName} = value;
            }`;
    });
}

function createGetterAndSetterES6(textProperties: string) {
    return createGetterAndSetterInternal(textProperties, (fi) => {
        return `
            public get ${fi.name}()${fi.type ? `: ${fi.type}` : ''}${fi.canBeUndefined ? ' | undefined' : ''} {
                return this.${fi.fieldName};
            }\n
            public set ${fi.name}(value${fi.type ? `: ${fi.type}` : ' /* Unknown type (Fix me)*/'}${fi.canBeUndefined ? ' | undefined' : ''}) {
                this.${fi.fieldName} = value;
            }`;
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}