export abstract class PluginType {
    // Plugin group
    group: string;
    // Name of plugin main class
    mainClassName: string;
    // Namespace of below interface file
    referencingNamespace: string;
    // Interface file class name
    nopInterface: string;
    // Name listed in Plugins page
    pluginGroupName: string;

    constructor(
        group: string,
        mainClassName: string,
        referencingNamespace: string,
        nopInterface: string,
        pluginGroupName: string
    ) {
        this.group = group;
        this.mainClassName = mainClassName;
        this.referencingNamespace = referencingNamespace;
        this.nopInterface = nopInterface;
        this.pluginGroupName = pluginGroupName;
    }

    abstract methods(): string

    usingStatement() {
        return `using ${this.referencingNamespace};`
    }
}