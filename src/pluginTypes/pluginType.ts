export abstract class PluginType {
    group: string;
    mainClassName: string;
    referencingNamespace: string
    nopInterface: string

    constructor(
        group: string,
        mainClassName: string,
        referencingNamespace: string,
        nopInterface: string
    ) {
        this.group = group;
        this.mainClassName = mainClassName;
        this.referencingNamespace = referencingNamespace;
        this.nopInterface = nopInterface;
    }

    abstract methods(): string

    usingStatement() {
        return `using ${this.referencingNamespace};`
    }
}