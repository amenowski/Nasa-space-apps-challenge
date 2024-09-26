import {
    Mesh,
    MeshStandardMaterial,
    PointLight,
    SphereGeometry,
    TextureLoader,
} from "three";

class Sun {
    public name: string;
    public mesh: Mesh;
    public radius: number;
    private mass: number;
    private textureUrl: string;
    // private surfaceTemp // maybe in future

    constructor(
        name: string,
        mass: number,
        radius: number,
        textureUrl: string
    ) {
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
        const mat = new MeshStandardMaterial({ map: tex });

        this.mesh = new Mesh(geo, mat);
        this.mesh.name = this.name;

        this.mesh.position.set(0, 0, 0);

        const light = new PointLight(0xffffff, 1, 0, 0);
        this.mesh.add(light);
    }
}

export default Sun;
