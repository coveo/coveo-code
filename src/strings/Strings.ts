const i18n = require('i18n-2');

const i18ninstance = new i18n({
  locales: {
    en: {
      NoDiff: 'The file in your Salesforce organization is identical to your version locally',
      InvalidUriScheme: 'Invalid uri scheme : %s',
      CouldNotExtractLocalPath: 'Could not extract local file path from uri: %s',
      CouldNotExtractComponentNameAndType: 'Could not extract component name and type from uri: %s',
      NoActivePath: 'No active root path for current workspace',
      CannotUploadEmpty: 'Cannot upload empty files',
      CompareLocalRemote: 'Comparing: Local ↔ Remote (%s)',
      NoDocumentation: 'The current selected element is not a Coveo component or no documentation is available',
      RemoveDuplicateOption: 'Remove duplicate option inside the same component',
      MissingRequiredOption: 'The option %s is required. Markup value is %s`',
      OptionNotValid: 'Value %s is not a valid value for the option %s',
      OptionNotValidBoolean: 'Option %s is of type : %s. Value should be "true" or "false"',
      OptionNotValidNumber: 'Option %s is of type : %s. Value should be a valid number',
      OptionNotValidField:
        'Option %s is of type : %s. Value should be a valid Coveo field. Should start with @ and followed by alpha-numeric characters',
      PossibleOptionValues: 'Possible Coveo option values ...',
      MissingTemplateClass: 'A Coveo result template need to have the "result-template" css class',
      MimetypeDocumentation:
        'Specify a mimeType that determine the type of template. This mimeType create an %s template',
      SalesforceUploadSuccess: 'Resource succesfully uploaded to Salesforce as type: %s with the name: %s',
      SalesforceComponentNotFound: 'Component not found in our salesforce organization : %s',
      SalesforceConnection: 'Salesforce connection',
      SalesforceConnecting: 'Connecting to your salesforce organization...',
      SalesforceListingApex: 'Listing Apex components...',
      SalesforceChooseList: 'Choose a component from the list...',
      SalesforceUploadProgress: 'Upload in progress...',
      SalesforceDownloadProgress: 'Download in progress...',
      SalesforceSelectComponent: 'Please select the Apex component which contains the Coveo component to edit',
      SalesforceInvalidLoginConfig: 'Invalid salesforce login configuration',
      SalesforceMissingConfig: 'Missing configuration for coveocode.salesforce.organization.%s',
      SaleforceConnecting: 'SaleforceConnecting'
    }
  }
});

export const l = (toTranslate: string, ...parameters: any[]) => {
  let funcArgs = [toTranslate];
  if (parameters) {
    funcArgs = funcArgs.concat(parameters);
  }
  return i18ninstance.__.apply(i18ninstance, funcArgs);
};
