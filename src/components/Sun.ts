import { Mesh, MeshBasicMaterial, SphereGeometry, TextureLoader } from "three";

class Sun {
    public name: string;
    public mesh: Mesh;
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
        this.mesh = new Mesh();
    }

    public init() {
        // console.log(this.radius);
        const tex = new TextureLoader().load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshBasicMaterial({ map: tex });

        this.mesh = new Mesh(geo, mat);

        this.mesh.position.set(0, 0, 0);
    }
}

export default Sun;
