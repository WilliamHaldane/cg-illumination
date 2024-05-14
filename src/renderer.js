import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

const BASE_URL = import.meta.env.BASE_URL || '/';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.3, 0.2, 0.5, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.4, 0.2, 0.2),
                lights: [],
                models: []
            } 
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](idx);
        });
    }

    CreateOval(radiusX, radiusY, radialSegments, tubularSegments, scene) {
        // Initialize arrays for vertex data
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];

        // Generate vertex data for oval shape
        for (let i = 0; i <= radialSegments; i++) {
            let angle = i * Math.PI * 2 / radialSegments;
            let cosAngle = Math.cos(angle);
            let sinAngle = Math.sin(angle);

            for (let j = 0; j <= tubularSegments; j++) {
                let tubularAngle = j * Math.PI * 2 / tubularSegments;
                let cosTubular = Math.cos(tubularAngle);
                let sinTubular = Math.sin(tubularAngle);

                let x = radiusX * cosAngle * cosTubular;
                let y = radiusY * sinAngle * cosTubular;
                let z = radiusX * sinTubular;

                positions.push(x, y, z);

                let nx = cosAngle * cosTubular;
                let ny = sinAngle * cosTubular;
                let nz = sinTubular;

                normals.push(nx, ny, nz);

                let u = j / tubularSegments;
                let v = i / radialSegments;

                uvs.push(u, v);
            }
        }

        // Generate indices for oval shape
        for (let i = 0; i < radialSegments; i++) {
            for (let j = 0; j < tubularSegments; j++) {
                let a = i * (tubularSegments + 1) + j;
                let b = a + tubularSegments + 1;
                let c = a + 1;
                let d = b + 1;

                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }

        // Create vertex data object
        let vertexData = new VertexData();

        // Set vertex data arrays
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        // Create mesh object using vertex data
        let ovalMesh = new Mesh("ovalMesh", scene);
        vertexData.applyToMesh(ovalMesh);

        // Return mesh object
        return ovalMesh;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*************************************************************************************************************************/
    //SCENE 1
    //*************************************************************************************************************************/
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        let cylinder = CreateCylinder('cylinder', {width: 3, height: 4, depth: 1}, scene);
        cylinder.position = new Vector3(-4.0, 0.5, 2.0);
        cylinder.metadata = {
            mat_color: new Color3(0.35, 0.65, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cylinder.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cylinder);

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case 'a':
                  current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'A':
                  current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'd':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'D':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'f':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'F':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'r':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'R':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'w':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;
                case 'W':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;
                case 's':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
                case 'S':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*************************************************************************************************************************/
    //SCENE 2
    //*************************************************************************************************************************/
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        let cylinder = CreateCylinder('cylinder', {width: 3, height: 4, depth: 1}, scene);
        cylinder.position = new Vector3(3.0, 0.5, 2.0);
        cylinder.metadata = {
            mat_color: new Color3(0.95, 0.65, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cylinder.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cylinder);

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case 'a':
                  current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'A':
                  current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'd':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'D':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'f':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'F':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'r':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'R':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'w':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;
                case 'W':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;
                case 's':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
                case 'S':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
            }
        });


        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });

        
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //*************************************************************************************************************************/
    //SCENE 3
    //*************************************************************************************************************************/
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    createScene2(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        let light2 = new PointLight('light2', new Vector3(2.0, 3.0, 3.0), scene);
        light2.diffuse = new Color3(1.0, 1.0, 1.0);
        light2.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light2);


        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        let cylinder = CreateCylinder('cylinder', {width: 3, height: 4, depth: 1}, scene);
        cylinder.position = new Vector3(3.0, 0.5, 2.0);
        cylinder.metadata = {
            mat_color: new Color3(0.95, 0.65, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cylinder.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cylinder);

        let oval = this.CreateOval(3, 1.5, 32, 16, scene);
        oval.scaling = new Vector3(0.3, 0.3, 0.3); 
        oval.position = new Vector3(-5.0, 0.5, 2.0);
        oval.metadata = {
            mat_color: new Color3(0.4, 0.9, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        oval.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(oval);

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case 'a':
                  current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'A':
                  current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'd':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'D':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'f':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'F':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'r':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'R':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;
                case 'w':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;
                case 'W':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;
                case 's':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
                case 'S':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
            }
        });



        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
    
    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
