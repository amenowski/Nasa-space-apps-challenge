import {
    Camera,
    Mesh,
    MeshStandardMaterial,
    PointLight,
    Scene,
    SphereGeometry,
    TextureLoader,
    Vector2,
    WebGLRenderer,
} from "three";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

class Sun {
    public name: string;
    public mesh: Mesh;
    public radius: number;
    private mass: number;
    private textureUrl: string;
    private composer: EffectComposer;
    // private surfaceTemp // maybe in future

    constructor(
        scene: Scene,
        renderer: WebGLRenderer,
        camera: Camera,
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
        this.composer = new EffectComposer(renderer);
        this.composer.addPass(new RenderPass(scene, camera));
    }

    public init() {
        // console.log(this.radius);
        const tex = new TextureLoader().load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({
            map: tex,
            emissive: 0xf2d45a,
            emissiveIntensity: 1.5,
        });

        this.mesh = new Mesh(geo, mat);
        this.mesh.name = this.name;

        this.mesh.position.set(0, 0, 0);
        const light = new PointLight(0xffffff, 1, 0, 0);
        this.mesh.add(light);

        const bloomPass = new UnrealBloomPass(
            new Vector2(window.innerWidth, window.innerHeight),
            1.1,
            0.1,
            0.2
        );

        this.composer.addPass(bloomPass);
    }

    public render(): void {
        this.composer.render();
    }

    public resize(): void {
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default Sun;
