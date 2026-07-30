import { useFrame, useThree, extend } from '@react-three/fiber'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import wobbleVertexShader from './shaders/blur/vertex.glsl'
import wobbleFragmentShader from './shaders/blur/fragment.glsl'
import video from '/walk.mp4'
import { useControls } from 'leva'
import { useVideoTexture } from '@react-three/drei'


export default function Experience() {
    // Refs
    const meshRef = useRef()
    const controlsRef = useRef()
    
    // Video
    const videoTexture = useVideoTexture('/walk.mp4', {
        muted: false,
        loop: true,   
        playsInline: true,
    })
    
    // R3F hooks
    const { scene, camera, gl, size, viewport } = useThree()
    
    // leva

     const materialProps = useControls('Material', {
        thickness: { value: 1.5, min: 0, max: 3, step: 0.05 },
        roughness: { value: 0.5, min: 0, max: 1, step: 0.05 },
        transmission: { value: 0, min: 0, max: 1, step: 0.05 },
        ior: { value: 1.5, min: 0, max: 3, step: 0.05 },
        metalness: { value: 0, min: 0, max: 1, step: 0.05 },
        color: { value: '#ffffff' },
    })

        const wobbleControls = useControls('Wobble', {
        uPositionFrequency: { value: 0.5, min: 0, max: 2, step: 0.001 },
        uTimeFrequency: { value: 0.4, min: 0, max: 2, step: 0.001 },
        uStrength: { value: 0.3, min: 0, max: 2, step: 0.001 },
    })
    
    // Setup video texture
   
    useEffect(() => {
    if (videoTexture) {
        scene.background = videoTexture
    }
     return () => {
        if (scene.background === videoTexture) {
            scene.background = null
        }
    }
    }, [videoTexture, scene])
      
    
    // Load environment map
    useEffect(() => {
        const rgbeLoader = new RGBELoader()
        
        rgbeLoader.load(
            './urban_alley_01_1k.hdr',
            (environmentMap) => {
                environmentMap.mapping = THREE.EquirectangularReflectionMapping
                scene.environment = environmentMap
            },
            undefined,
            (error) => {
                console.error('Error loading HDR:', error)
            }
        )
    }, [scene])
    
    // Setup uniforms
    const uniforms = useMemo(() => ({
        uTime: new THREE.Uniform(0),
        uPositionFrequency: new THREE.Uniform(0.5),
        uTimeFrequency: new THREE.Uniform(0.4),
        uStrength: new THREE.Uniform(0.3)
    }), [])
    
    // materials
    const material = useMemo(() => {
        return new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            vertexShader: wobbleVertexShader,
            fragmentShader: wobbleFragmentShader,
            uniforms: uniforms,
            
            // MeshPhysicalMaterial properties
            metalness: 0,
            roughness: 0.5,
            color: '#ffffff',
            transmission: 0,
            ior: 1.5,
            thickness: 1.5,
            transparent: true,
            wireframe: false
        })
    }, [uniforms])
    
    const depthMaterial = useMemo(() => {
        return new CustomShaderMaterial({
            baseMaterial: THREE.MeshDepthMaterial,
            vertexShader: wobbleVertexShader,
            uniforms: uniforms,
            depthPacking: THREE.RGBADepthPacking
        })
    }, [uniforms])
    
    // GUI controls
    // useEffect(() => {
        
    //     gui.add(uniforms.uPositionFrequency, 'value', 0, 2, 0.001).name('uPositionFrequency')
    //     gui.add(uniforms.uTimeFrequency, 'value', 0, 2, 0.001).name('uTimeFrequency')
    //     gui.add(uniforms.uStrength, 'value', 0, 2, 0.001).name('uStrength')
        
    //     gui.add(material, 'metalness', 0, 1, 0.001)
    //     gui.add(material, 'roughness', 0, 1, 0.001)
    //     gui.add(material, 'transmission', 0, 1, 0.001)
    //     gui.add(material, 'ior', 0, 10, 0.001)
    //     gui.add(material, 'thickness', 0, 10, 0.001)
    //     gui.addColor(material, 'color')
        
    //     // Cleanup GUI on unmount
    //     return () => {
    //         gui.destroy()
    //     }
    // }, [gui, uniforms, material])
    
    // Create geometry with memoization
    const geometry = useMemo(() => {
        let geo = new THREE.IcosahedronGeometry(2.5, 50)
        geo = mergeVertices(geo)
        geo.computeTangents()
        return geo
    }, [])
    
    // Animation
    useFrame((state, delta) => {
        // Update time
        uniforms.uTime.value = state.clock.elapsedTime
        
        // Update controls
        if (controlsRef.current) {
            controlsRef.current.update()
        }
    })
    
    // Setup camera position
    useEffect(() => {
        camera.position.set(13, -3, -5)
        camera.lookAt(0, 0, 0)
    }, [camera])
    
    return (
        <>
          
            <directionalLight
                color="#ffffff"
                intensity={3}
                position={[0.25, 2, -2.25]}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={15}
                shadow-normalBias={0.05}
            />
            
            <mesh
                ref={meshRef}
                geometry={geometry}
                material={material}
                customDepthMaterial={depthMaterial}
                receiveShadow
                castShadow
                position={[0, 0, 0]}
                {...materialProps}
            />

            <ambientLight intensity={0.5} />
        </>
    )
}