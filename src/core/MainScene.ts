import { AmbientLight, Group, Scene } from "three";

export default class MainScene {
    private scene: Scene;
    constructor() {
        this.scene = new Scene();
    }

    public init() {
        this.scene.add(new AmbientLight(0xffffff, 0.05));
    }

    public getScene(): Scene {
        return this.scene;
    }

    public addGroup(group: Group) {
        this.scene.add(group);
    }
}
