# coveo-code Coveo Search UI development support for Visual Studio Code

Visual Studio Code plugin for Coveo Search UI. This plugin is designed to help build and deploy Coveo Search pages built using the [Coveo Search UI framework](https://github.com/coveo/search-ui)


## Configuration

### Salesforce

To connect to your Salesforce organization, you need provide your username, password and security token. You can do so using either your user preferences, or (preferred) your workspace settings. See : 
- [VScode documentation](https://code.visualstudio.com/docs/getstarted/settings) for information about your workspace settings
- [Salesforce documentation](https://help.salesforce.com/articleView?id=user_security_token.htm&type=0&language=en_US&release=208.14) for information on how to reset and obtain your security token

#### Available configuration option for salesforce

- `coveocode.salesforce.organization.username`

  Your salesforce username

- `coveocode.salesforce.organization.password`

  Your salesforce password

- `coveocode.salesforce.organization.securityToken`

  Your salesforce security token

- `coveocode.salesforce.local.outputFolder`

  The folder where the extension should put retrieved components form your salesforce organization. The default value is `./coveocode/salesforce`. This is also where any created resources can be synced and uploaded to your salesforce organization.

- `coveocode.salesforce.organization.loginUrl`

  The url where the extension will try to login inside Salesforce. The default value is `https://login.salesforce.com/` Change this if you are targeting a sandbox (`https://test.salesforce.com`);

- Examples :
```
{
  "coveocode.salesforce.organization.username" : "MANDATORY",
  "coveocode.salesforce.organization.password" : "MANDATORY",
  "coveocode.salesforce.organization.securityToken" : "MANDATORY",
  "coveocode.salesforce.organization.loginUrl" : "OPTIONAL",
  "coveocode.salesforce.local.outputFolder" : "OPTIONAL"
}
```



## Features
### Completions

- Automatically provide completions for options name and values, with detailed documentation about each option.
- Provide possible options values which match the option type when possible.
- Provide snippets for result templates.

  <img id='completion-1' src='./media/completion-1.gif' />

### Configuration error diagnostics

- Diagnose missing required options
- Diagnose invalid option types
- Diagnose invalid result template content

  <img id='diagnostic-1' src='./media/diagnostic-1.gif' />

### Commands and menu options

- Show online documentation about the selected component or component option

  <img id='menu-1' src='./media/menu-1.gif' />

### Salesforce compatible 

- Retrieve Apex components containing the code of your Coveo Search page directly from Salesforce
- Diff and upload local changes directly to your Salesforce organization.
- Create new Visualforce component locally and upload them to your Salesforce organization

  <img id='menu-1' src='./media/salesforce-1.gif' />
