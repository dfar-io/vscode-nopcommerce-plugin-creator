import { PluginType } from "./pluginType";

export class Misc extends PluginType {
    constructor() {
        super(
            "Misc",
            "Plugin",
            "Nop.Services.Common",
            "IMiscPlugin",
            "Misc"
        );
    }

    methods(): string {
        return ``
    }
}