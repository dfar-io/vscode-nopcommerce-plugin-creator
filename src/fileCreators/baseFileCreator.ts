import { PluginType } from "../pluginTypes/pluginType";

const fs = require('fs');

export class BaseFileCreator {
    private pluginType: PluginType
    private pluginPath: string
    private pluginName: string
    // this will be a settings object to include extra options
    private includePluginSettings: boolean

    private className: string

    constructor(
        pluginType: PluginType,
        pluginPath: string,
        pluginName: string,
        includePluginSettings: boolean
    ) {
        this.pluginType = pluginType;
        this.pluginPath = pluginPath;
        this.pluginName = pluginName;
        this.includePluginSettings = includePluginSettings

        this.className = `${this.pluginName}${this.pluginType.mainClassName}`;
    }

    private contents() {
        var localeName = `${this.pluginName}Locales`;
        return `using System;
using System.Collections.Generic;
using Nop.Core;
using Nop.Services.Configuration;
using Nop.Services.Localization;
using Nop.Services.Plugins;
${this.pluginType.usingStatement()}
        
namespace Nop.Plugin.${this.pluginType.group}.${this.pluginName}
{
    public class ${this.className} : BasePlugin, ${this.pluginType.nopInterface}
    {
        private readonly IWebHelper _webHelper;
        private readonly ILocalizationService _localizationService;
        private readonly ISettingService _settingService;
            
        public ${this.className}(
            IWebHelper webHelper,
            ILocalizationService localizationService,
            ISettingService settingService
        )
        {
            _webHelper = webHelper;
            _localizationService = localizationService;
            _settingService = settingService;
        }
        ${this.includePluginSettings ? `
        public override string GetConfigurationPageUrl()
        {
            return $"{_webHelper.GetStoreLocation()}Admin/${this.pluginName}/Configure";
        }

        public override void Install()
        {
            UpdatePluginLocaleResources();
        
            base.Install();
        }
            
        public override void Uninstall()
        {
            _localizationService.DeletePluginLocaleResources(${localeName}.Base);
            _settingService.DeleteSetting<${this.pluginName}Settings>();
        
            base.Uninstall();
        }
            
        public override void Update(string oldVersion, string currentVersion)
        {
            UpdatePluginLocaleResources();
        
            base.Update(oldVersion, currentVersion);
        }
        
        private void UpdatePluginLocaleResources()
        {
            _localizationService.AddPluginLocaleResource(
            new Dictionary<string, string>
                {
                    [${localeName}.TestString] = "Test String",
                    [${localeName}.TestStringHint] = "Holds the value of a string.",
                    [${localeName}.TestBoolean] = "Test Boolean",
                    [${localeName}.TestBooleanHint] = "Holds the value of a boolean."
                }
            );
        }
` : ``}
        ${this.pluginType.methods()}
    }
}
        `;
    }

    createFile() {
        fs.writeFile(
            `${this.pluginPath}/${this.className}.cs`,
            this.contents(),
            function (err: any) {
                if (err) throw err;
            }
        ); 
    }
}