import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader, Vector3 } from "three";
import Asteroid from "./Asteroid";
import SolarSystem from "./SolarSystem";
import { SETTINGS } from "../core/Settings";

export default class PHA extends Asteroid{
    public distanceToEarth: number;
    constructor(
        system: SolarSystem,
        name: string,
        radius: number,
        obliquity: number,
        sidRotPerSec: number,
        color: string,
        textureUrl: string,
        textureLoader: TextureLoader,
    ) {
        super(system, name, radius, obliquity, sidRotPerSec, color, textureUrl, textureLoader,"Y",  SETTINGS.PLANET_LAYER );
        this.distanceToEarth = 0;
        
    }

    public async  init(date: Date): Promise<void> {
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ color: 0xfafafa });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.set(this.layer);
        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;
        this.group.visible = false;

        if (this.orbit) {
            this.mesh.position.copy(this.orbit.setFromDate(date));

            this.group.add(this.orbit.orbitLine);
        }
        this.group.add(this.mesh);
        this.createLabel();
        this.createIcon();
    }
    
    public calcDistanceToEarth(earthPos: Vector3): boolean {


        if(!this.mesh) return false;
        // 99942 Apophis (2004 MN4)
        this.distanceToEarth = earthPos.distanceTo(this.mesh.position) / 149597870.7;
        this.distanceToEarth *= SETTINGS.DISTANCE_SCALE
    
        // if(this.name == "99942 Apophis (2004 MN4)")
        //     console.log(this.distanceToEarth)

        if(this.distanceToEarth < SETTINGS.PHA_THRESHOLD) {
            this.group.visible = true;
            this.orbit?.show()

            return true;
        } 
            this.group.visible = false;
            this.orbit?.hide()

            return false;
            // console.log(this.distanceToEarth, this.name) 
    }
}