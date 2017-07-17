import * as vscode from 'vscode';
import * as _ from 'lodash';
import { ReferenceDocumentation, IDocumentation } from '../referenceDocumentation';
import { getAllComponentsSymbol, doCompleteScanOfSymbol, IScanOfAttributeValue } from '../documentService';

export class OptionsDiagnostics {
  constructor(public referenceDocumentation: ReferenceDocumentation) {}

  public provideDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[] {
    let allDiagnostics: vscode.Diagnostic[] = [];
    const allComponentsSymbols = getAllComponentsSymbol(this.referenceDocumentation, document);
    allComponentsSymbols.forEach(componentSymbol => {
      const component = this.referenceDocumentation.getDocumentation(componentSymbol);
      if (component && component.options) {
        allDiagnostics = allDiagnostics.concat(this.diagnoseDuplicateOptions(document, componentSymbol, component));
        allDiagnostics = allDiagnostics.concat(
          this.diagnoseMissingRequiredOptions(document, componentSymbol, component)
        );
        allDiagnostics = allDiagnostics.concat(
          this.diagnoseInvalidConstrainedValues(document, componentSymbol, component)
        );
        allDiagnostics = allDiagnostics.concat(this.diagnoseInvalidOptionType(document, componentSymbol, component));
      }
    });

    return allDiagnostics;
  }

  private diagnoseDuplicateOptions(
    document: vscode.TextDocument,
    componentSymbol: vscode.SymbolInformation,
    component: IDocumentation
  ): vscode.Diagnostic[] {
    let allDiagnostics: vscode.Diagnostic[] = [];
    const completeScan = doCompleteScanOfSymbol(componentSymbol, document);
    const scanWithOnlyUnique = _.uniqBy(completeScan, scan => scan.attributeName);
    const duplicates = _.difference(completeScan, scanWithOnlyUnique);
    if (!_.isEmpty(duplicates)) {
      allDiagnostics = allDiagnostics.concat(
        duplicates.map(duplicate => {
          return new vscode.Diagnostic(
            duplicate.rangeInDocument,
            'Remove duplicate option inside the same component.',
            vscode.DiagnosticSeverity.Error
          );
        })
      );
    }
    return allDiagnostics;
  }

  private diagnoseMissingRequiredOptions(
    document: vscode.TextDocument,
    componentSymbol: vscode.SymbolInformation,
    component: IDocumentation
  ) {
    let allDiagnostics: vscode.Diagnostic[] = [];
    const requiredOptions = _.filter(component.options, option => option.miscAttributes.required == 'true');
    if (!_.isEmpty(requiredOptions)) {
      const completeScan = doCompleteScanOfSymbol(componentSymbol, document);
      const matchScanWithOption = this.matchScanToDocumentation(completeScan, requiredOptions);
      const missingRequiredOptions = matchScanWithOption.filter(
        scannedOption =>
          scannedOption.scan == null || _.isEmpty(this.attributeValueWithNoQuote(scannedOption.scan.attributeValue))
      );
      allDiagnostics = allDiagnostics.concat(
        missingRequiredOptions.map(missingRequiredOption => {
          return new vscode.Diagnostic(
            componentSymbol.location.range,
            `The option ${missingRequiredOption.option
              .name} is required. Markup value is ${ReferenceDocumentation.camelCaseToHyphen(
              missingRequiredOption.option.name
            )}`,
            vscode.DiagnosticSeverity.Error
          );
        })
      );
    }
    return allDiagnostics;
  }

  private diagnoseInvalidConstrainedValues(
    document: vscode.TextDocument,
    componentSymbol: vscode.SymbolInformation,
    component: IDocumentation
  ) {
    let allDiagnostics: vscode.Diagnostic[] = [];
    const allOptionsWithConstrainedValues = _.filter(component.options, option => !_.isEmpty(option.constrainedValues));

    if (!_.isEmpty(allOptionsWithConstrainedValues)) {
      const allOptionsWithConstrainedValuesMarkup = allOptionsWithConstrainedValues.map(optionWithConstrainedValue =>
        ReferenceDocumentation.camelCaseToHyphen(optionWithConstrainedValue.name)
      );
      const completeScan = doCompleteScanOfSymbol(componentSymbol, document);
      const currentScanWhichNeedConstrainedValues = _.filter(
        completeScan,
        scan => _.indexOf(allOptionsWithConstrainedValuesMarkup, scan.attributeName) != -1
      );
      const allScanWhichMatchWithMarkup = this.matchNonNullScanToDocumentation(
        currentScanWhichNeedConstrainedValues,
        allOptionsWithConstrainedValues
      );
      _.each(allScanWhichMatchWithMarkup, optionThatIsPossiblyInError => {
        const allUniquePossibleValuesFromDocumentation = _.chain(optionThatIsPossiblyInError.option.constrainedValues)
          .flatMap(constrainedValue => constrainedValue.split(','))
          .uniq()
          .value();

        if (optionThatIsPossiblyInError.scan) {
          const valuesInAttributeNotPossible = _.chain(
            this.attributeValueWithNoQuote(optionThatIsPossiblyInError.scan.attributeValue).split(',')
          )
            .difference(allUniquePossibleValuesFromDocumentation)
            .without('')
            .value();

          const range = optionThatIsPossiblyInError.scan.rangeInDocument;

          allDiagnostics = allDiagnostics.concat(
            valuesInAttributeNotPossible.map(
              valueNotPossibleInAttribute =>
                new vscode.Diagnostic(
                  range,
                  `Value ${valueNotPossibleInAttribute} is not a valid value for the option ${optionThatIsPossiblyInError
                    .option.name}`,
                  vscode.DiagnosticSeverity.Error
                )
            )
          );
        }
      });
    }
    return allDiagnostics;
  }

  private diagnoseInvalidOptionType(
    document: vscode.TextDocument,
    componentSymbol: vscode.SymbolInformation,
    component: IDocumentation
  ): vscode.Diagnostic[] {
    const allDiagnostics: vscode.Diagnostic[] = [];
    const completeScan = doCompleteScanOfSymbol(componentSymbol, document);
    const matchedScans = this.matchNonNullScanToDocumentation(completeScan, component.options);
    _.each(matchedScans, matchedScan => {
      if (matchedScan.option.type && matchedScan.scan) {
        switch (matchedScan.option.type.toLowerCase()) {
          case 'boolean':
            const diagnosisOfBoolean = this.diagnoseInvalidBooleanType(matchedScan.scan, matchedScan.option);
            if (diagnosisOfBoolean) {
              allDiagnostics.push(diagnosisOfBoolean);
            }
            break;
          case 'number':
            const diagnosisOfNumber = this.diagnoseInvalidNumberType(matchedScan.scan, matchedScan.option);
            if (diagnosisOfNumber) {
              allDiagnostics.push(diagnosisOfNumber);
            }
            break;
          case 'ifieldoption':
            const diagnosisOfField = this.diagnoseInvalidFieldType(matchedScan.scan, matchedScan.option);
            if (diagnosisOfField) {
              allDiagnostics.push(diagnosisOfField);
            }
          default:
            break;
        }
      }
    });
    return allDiagnostics;
  }

  private diagnoseInvalidBooleanType(scan: IScanOfAttributeValue, options: IDocumentation): vscode.Diagnostic | null {
    const attributeValue = this.attributeValueWithNoQuote(scan.attributeValue).toLowerCase();
    if (attributeValue != 'true' && attributeValue != 'false') {
      return new vscode.Diagnostic(
        scan.rangeInDocument,
        `Option ${options.name} is of type : ${options.type}. Value should be "true" or "false"`
      );
    }
    return null;
  }

  private diagnoseInvalidNumberType(scan: IScanOfAttributeValue, options: IDocumentation): vscode.Diagnostic | null {
    const attributeValue = this.attributeValueWithNoQuote(scan.attributeValue).toLowerCase();
    if (attributeValue == '' || isNaN(Number(attributeValue).valueOf())) {
      return new vscode.Diagnostic(
        scan.rangeInDocument,
        `Option ${options.name} is of type : ${options.type}. Value should be a valid number.`
      );
    }
    return null;
  }

  private diagnoseInvalidFieldType(scan: IScanOfAttributeValue, options: IDocumentation): vscode.Diagnostic | null {
    const attributeValue = this.attributeValueWithNoQuote(scan.attributeValue).toLowerCase();
    if (!/^@[a-zA-Z0-9_\.]+$/.test(attributeValue)) {
      return new vscode.Diagnostic(
        scan.rangeInDocument,
        `Option ${options.name} is of type : ${options.type}. Value should be a valid Coveo field. Should start with @ and followed by alpha-numeric characters.`
      );
    }
    return null;
  }

  private matchScanToDocumentation(completeScan: IScanOfAttributeValue[], options: IDocumentation[]) {
    return _.map(options, option => {
      return {
        option,
        scan: _.find(completeScan, scan => scan.attributeName == ReferenceDocumentation.camelCaseToHyphen(option.name))
      };
    });
  }

  private matchNonNullScanToDocumentation(completeScan: IScanOfAttributeValue[], options: IDocumentation[]) {
    return _.filter(this.matchScanToDocumentation(completeScan, options), matchedScan => {
      return matchedScan.scan != null;
    });
  }

  private attributeValueWithNoQuote(attributeValue: string): string {
    return attributeValue.replace(/['"]/g, '');
  }
}