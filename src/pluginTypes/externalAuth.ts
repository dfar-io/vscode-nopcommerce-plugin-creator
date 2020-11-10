import { PluginType } from "./pluginType";

export class ExternalAuth extends PluginType {
    constructor() {
        super(
            "ExternalAuth",
            "AuthenticationMethod",
            "Nop.Services.Authentication.External",
            "IExternalAuthenticationMethod",
            "ExternalAuth methods"
        );
    }

    methods(): string {
        return `/// <summary>
        /// Gets a name of a view component for displaying plugin in public store
        /// </summary>
        /// <returns>View component name</returns>
        public string GetPublicViewComponentName()
        {
            // This needs to be changed to a valid ViewComponent to allow for
            // the plugin to work.
            // check out https://github.com/nopSolutions/nopCommerce/tree/develop/src/Plugins/Nop.Plugin.ExternalAuth.Facebook
            return "ViewComponentName";
        }     
`
    }
}