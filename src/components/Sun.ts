class Sun {
    public name: string;
    private mass: number;
    private radius: number;
    private textureUrl: string;
    private luminosity: number;
    // private surfaceTemp // maybe in future

    constructor(
        name: string,
        mass: number,
        radius: number,
        textureUrl: string,
        luminosity: number
    ) {
        this.luminosity = luminosity;
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.textureUrl = textureUrl;
    }

    public init() {}
}

export default Sun;
