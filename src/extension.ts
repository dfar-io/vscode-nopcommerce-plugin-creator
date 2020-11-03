// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const fs = require('fs');
const cp = require('child_process')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const pluginTypes = [
		'DiscountRules',
		'ExternalAuth',
		'ExchangeRate',
		'Misc',
		'Payments',
		'Pickup',
		'Shipping',
		'Tax',
		'Widgets'
	]

	const typeOptions: vscode.QuickPickOptions = {
		placeHolder: "(Plugin Type)"
	}

	const nameOptions: vscode.InputBoxOptions = {
		prompt: "Plugin Name: ",
		placeHolder: "(Plugin Name)"
	}

	const friendlyNameOptions: vscode.InputBoxOptions = {
		prompt: "Friendly Name: ",
		placeHolder: "(Friendly Name)"
	}

	const authorOptions: vscode.InputBoxOptions = {
		prompt: "Author: ",
		placeHolder: "(Author)"
	}

	const descriptionOptions: vscode.InputBoxOptions = {
		prompt: "Description: ",
		placeHolder: "(Description)"
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('nopcommerce-plugin-creator.createPlugin', () => {
		// The code you place here will be executed every time your command is executed

		vscode.workspace.findFiles("NopCommerce.sln", null, 1).then(slnFile => {
			if (slnFile.length == 0) {
				vscode.window.showErrorMessage(
					`Unable to find NopCommerce.sln, make sure you have NopCommerce source open.`
				);
				return;
			}

			vscode.window.showQuickPick(pluginTypes, typeOptions).then(group => {
				if (!group) return;
				
				vscode.window.showInputBox(nameOptions).then(name => {
					if (!name || name == '') return;

					vscode.window.showInputBox(friendlyNameOptions).then(friendlyName => {
						if (!friendlyName || friendlyName == '') return;

						vscode.window.showInputBox(authorOptions).then(author => {
							if (!author || author == '') return;

							vscode.window.showInputBox(descriptionOptions).then(description => {
								if (!description || description == '') return;
							
								const pluginName = `Nop.Plugin.${group}.${name}`;
								const workspaceFolders = vscode.workspace.workspaceFolders;
								if (workspaceFolders == undefined) {
									return;
								}
								
								const basePath = workspaceFolders[0].uri.path;
								const pluginPath = `${workspaceFolders[0].uri.path}/Plugins/${pluginName}`;

								fs.mkdirSync(pluginPath);
								createPluginJson(
									pluginPath,
									group,
									name,
									friendlyName,
									author,
									description
								);
								createOmnisharpJson(pluginPath);
								createCsproj(
									pluginPath,
									group,
									name,
									author,
									true // for now, should be selectable
								);
								if (true) { // if include settings
									createSettingsFile(
										group,
										name, 
										pluginPath
									);
									createConfigModelFile(
										group,
										name,
										pluginPath
									)
									createLocaleFile(
										group,
										name,
										pluginPath
									)
									createViews(
										group,
										name,
										pluginPath
									)
								}

								addPluginToSolution(
									basePath,
									pluginPath,
									group,
									name
								);

								vscode.window.showInformationMessage("Plugin created.");
							});
						});
					});
				});
			});
		});
	});

	context.subscriptions.push(disposable);
}

function createPluginJson(
	path: string,
	group: string,
	name: string,
	friendlyName: string,
	author: string,
	description: string
) {
	const contents = {
		"Group": group,
		"FriendlyName": friendlyName,
		"SystemName": `${group}.${name}`,
		"Version": "1.0.0",
		"SupportedVersions": [ "4.30" ],
		"Author": author,
		"DisplayOrder": -1,
		"FileName": `Nop.Plugin.${group}.${name}.dll`,
		"Description": description
	};

	fs.writeFile(
		`${path}/plugin.json`,
		JSON.stringify(contents, null, 1),
		function (err: any) {
			if (err) throw err;
		}
	);  
}

function createOmnisharpJson(path: string) {
	const contents = {
		"RoslynExtensionsOptions": {
			"enableAnalyzersSupport": true
		},
		"FormattingOptions": {
			"enableEditorConfigSupport": true
		}
	};

	fs.writeFile(
		`${path}/omnisharp.json`,
		JSON.stringify(contents, null, 1),
		function (err: any) {
			if (err) throw err;
		}
	);  
}

function createCsproj(
	path: string,
	group: string,
	name: string,
	author: string,
	includeSettings: boolean
) {
	const contents = `
<Project Sdk="Microsoft.NET.Sdk">
	<PropertyGroup>
		<TargetFramework>netcoreapp3.1</TargetFramework>
		<Authors>${author}</Authors>
		<RepositoryType>Git</RepositoryType>
		<OutputPath>..\\..\\Presentation\\Nop.Web\\Plugins\\${group}.${name}</OutputPath>
		<OutDir>$(OutputPath)</OutDir>
		<!--Set this parameter to true to get the dlls copied from the NuGet cache to the output of your project. You need to set this parameter to true if your plugin has a nuget package to ensure that   the dlls copied from the NuGet cache to the output of your project-->
		<CopyLocalLockFileAssemblies>true</CopyLocalLockFileAssemblies>
	</PropertyGroup>

	<ItemGroup>
		<None Remove="plugin.json" />
		<!-- add a approximately 50x50 logo to plugin root and uncomment this
		<None Remove="logo.png" />
		-->
		${includeSettings ? `
		<None Remove="Views\\Configure.cshtml" />
    	<None Remove="Views\\_ViewImports.cshtml" />
		` : ``}
	</ItemGroup>

	<ItemGroup>
		<Content Include="plugin.json">
			<CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
		</Content>
		<!-- uncomment this after adding a logo from above
		<Content Include="logo.png">
			<CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
		</Content>
		-->
		${includeSettings ? `
		<Content Include="Views\\Configure.cshtml">
			<CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
		</Content>
		<Content Include="Views\\_ViewImports.cshtml">
			<CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
		</Content>
		` : ``}
	</ItemGroup>

	<ItemGroup>
		<ProjectReference Include="..\\..\\Presentation\\Nop.Web.Framework\\Nop.Web.Framework.csproj" />
		${includeSettings ? `
		<ProjectReference Include="..\\..\\Libraries\\Nop.Core\\Nop.Core.csproj" />
		` : ``}
		<ClearPluginAssemblies Include="$(MSBuildProjectDirectory)\\..\\..\\Build\\ClearPluginAssemblies.proj" />
	</ItemGroup>
	<!-- This target execute after "Build" target -->
	<Target Name="NopTarget" AfterTargets="Build">
		<!-- Delete unnecessary libraries from plugins path -->
		<MSBuild Projects="@(ClearPluginAssemblies)" Properties="PluginPath=$(MSBuildProjectDirectory)\\$(OutDir)" Targets="NopClear" />
	</Target>
</Project>
	`
	
	fs.writeFile(
		`${path}/Nop.Plugin.${group}.${name}.csproj`,
		contents,
		function (err: any) {
			if (err) throw err;
		}
	);  
}

function addPluginToSolution(
	basePath: string,
	pluginPath: string,
	group: string,
	name: string
) {
	const command =
		`dotnet sln ${basePath}/NopCommerce.sln add ${pluginPath}/Nop.Plugin.${group}.${name}.csproj`;

	cp.exec(command, (err: any, stdout: any, stderr: any) => {
		console.log('stdout: ' + stdout);
    	console.log('stderr: ' + stderr);
		if (err) {
			throw err;
		}
	});
}

function createSettingsFile(
	group : string,
	name : string,
	path : string
) {
	const namespace = `Nop.Plugin.${group}.${name}`;
	const className = `${name}Settings`;
	const contents = `using Nop.Core.Configuration;
using ${namespace}.Models;

namespace ${namespace}
{
	public class ${className} : ISettings
	{
		public string TestString { get; private set; }
		public bool TestBoolean { get; private set; }
	
		public static ${className} FromModel(ConfigurationModel model)
		{
			return new ${className}()
			{
				TestString = model.TestString,
				TestBoolean = model.TestBoolean
			};
		}

		public ConfigurationModel ToModel()
		{
			return new ConfigurationModel
			{
				TestString = TestString,
				TestBoolean = TestBoolean
			};
		}
	}
}
	`;

	fs.writeFile(
		`${path}/${name}Settings.cs`,
		contents,
		function (err: any) {
			if (err) throw err;
		}
	);  
}

function createConfigModelFile(
	group : string,
	name : string,
	path : string
) {
	const localeClassName = `${name}Locales`;
	const contents = `using Nop.Web.Framework.Mvc.ModelBinding;

namespace Nop.Plugin.${group}.${name}.Models
{
	public class ConfigurationModel
	{
		[NopResourceDisplayName(${localeClassName}.TestString)]
		public string TestString { get; set; }

		[NopResourceDisplayName(${localeClassName}.TestBoolean)]
		public bool TestBoolean { get; set; }
	}
}	
`;

	fs.mkdirSync(
		`${path}/Models`
	);
	fs.writeFile(
		`${path}/Models/ConfigModel.cs`,
		contents,
		function (err: any) {
			if (err) throw err;
		}
	);  
}

function createLocaleFile(
	group : string,
	name : string,
	path : string
) {
	const contents = `namespace Nop.Plugin.${group}.${name}
{
	public class ${name}Locales
	{
		public const string Base = "Plugins.${group}.${name}.Fields.";

        public const string TestString = Base + ".TestString";
        public const string TestStringHint = TestString + ".Hint";

        public const string TestBoolean = Base + ".TestBoolean";
        public const string TestBooleanHint = TestBoolean + ".Hint";
	}
}	
`;

	fs.writeFile(
		`${path}/${name}Locales.cs`,
		contents,
		function (err: any) {
			if (err) throw err;
		}
	);  
}

function createViews(
	group : string,
	name: string,
	path : string
) {
	// ViewImports
	const viewImportsContents = `@inherits Nop.Web.Framework.Mvc.Razor.NopRazorPage<TModel>
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@addTagHelper *, Nop.Web.Framework
	
@using Microsoft.AspNetCore.Mvc.ViewFeatures
@using Nop.Web.Framework.UI
@using Nop.Web.Framework.Extensions
@using System.Text.Encodings.Web	
`;
	
	// Configure
	const configureContents = `@model ConfigurationModel

@using Nop.Plugin.${group}.${name}.Models
	
@{
	Layout = "_ConfigurePlugin";
}
	
<form asp-controller="${name}" asp-action="Configure" method="post">
	<div class="panel-group">
		<div class="panel panel-default">
			<div class="panel-body">
				<div class="form-group">
					<div class="col-md-3">
						<nop-label asp-for="TestString" />
					</div>
					<div class="col-md-9">
						<nop-editor asp-for="TestString" />
						<span asp-validation-for="TestString"></span>
					</div>
				</div>
				<div class="form-group">
					<div class="col-md-3">
						<nop-label asp-for="TestBoolean" />
					</div>
					<div class="col-md-9">
						<nop-editor asp-for="TestBoolean" />
						<span asp-validation-for="TestBoolean"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</form>`;

	fs.mkdirSync(
		`${path}/Views`
	);
	fs.writeFile(
		`${path}/Views/_ViewImports.cshtml`,
		viewImportsContents,
		function (err: any) {
			if (err) throw err;
		}
	);
	fs.writeFile(
		`${path}/Views/Configure.cshtml`,
		configureContents,
		function (err: any) {
			if (err) throw err;
		}
	);  
}

// this method is called when your extension is deactivated
export function deactivate() {}

