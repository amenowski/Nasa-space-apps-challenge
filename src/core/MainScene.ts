import { AmbientLight, DoubleSide, Group, Scene, TextureLoader } from "three";
import { MeshStandardMaterial, Mesh } from "three";
import { PlanetRingGeometry } from "../utils/PlanetRingGeometry";
export default class MainScene {
    private scene: Scene;
    constructor() {
        this.scene = new Scene();
    }

    public init() {
        this.scene.add(new AmbientLight(0xffffff, 1));
    }

    public getScene(): Scene {
        return this.scene;
    }

    public addGroup(group: Group) {
        this.scene.add(group);
    }

    public textExample() {}
}
