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
									author
								);
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
	author: string
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
	</ItemGroup>

	<ItemGroup>
		<ProjectReference Include="..\\..\\Presentation\\Nop.Web.Framework\\Nop.Web.Framework.csproj" />
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

// this method is called when your extension is deactivated
export function deactivate() {}

