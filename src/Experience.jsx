import { useFrame, useThree, extend } from '@react-three/fiber'
import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import wobbleVertexShader from './shaders/blur/vertex.glsl'
import wobbleFragmentShader from './shaders/blur/fragment.glsl'
import video from '/walk.mp4'
import { useControls } from 'leva'
import { useSpring, animated } from '@react-spring/three'


export default function Experience({ blinkTrigger }) {
   
    const meshRef = useRef()

    const { scene, camera, gl, size, viewport } = useThree()

    
    // leva
     const materialProps = useControls({
        thickness: { value: 1.5, min: 0, max: 3, step: 0.05 },
        roughness: { value: 0.5, min: 0, max: 1, step: 0.05 },
        transmission: { value: 0, min: 0, max: 1, step: 0.05 },
        
        metalness: { value: 0, min: 0, max: 1, step: 0.05 },
        color: { value: '#ffffff' },
    })

        const wobbleControls = useControls({
        uPositionFrequency: { value: 0.5, min: 0, max: 2, step: 0.001 },
        uTimeFrequency: { value: 0.4, min: 0, max: 2, step: 0.001 },
        uStrength: { value: 0.3, min: 0, max: 2, step: 0.001 },
    })


    // Blink
    const DEFAULT_IOR = 2 
    const [currentIor, setCurrentIor] = useState(DEFAULT_IOR)

  
    const { ior } = useSpring({
        ior: blinkTrigger ? 0 : DEFAULT_IOR,
        config: {
            duration: 3000,
            easing: t => t * t * (3 - 2 * t) 
        },
        onChange: ({ value }) => {
            setCurrentIor(value.ior)
        },

        delay: blinkTrigger ? 0 : 5000 
    })

    
    // uniforms
    const uniforms = useMemo(() => ({
        uTime: new THREE.Uniform(0),
        uPositionFrequency: new THREE.Uniform(wobbleControls.uPositionFrequency),
        uTimeFrequency: new THREE.Uniform(wobbleControls.uTimeFrequency),
        uStrength: new THREE.Uniform(wobbleControls.uStrength)
    }), 
    [wobbleControls.uPositionFrequency,
    wobbleControls.uTimeFrequency,
    wobbleControls.uStrength])


    // materials
    const material = useMemo(() => {
        return new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            vertexShader: wobbleVertexShader,
            fragmentShader: wobbleFragmentShader,
            uniforms: uniforms,
        
        // MeshPhysicalMaterial properties
        metalness: materialProps.metalness,
        roughness: materialProps.roughness,
        color: materialProps.color,
        transmission: materialProps.transmission,
        thickness: materialProps.thickness,
        ior: currentIor
        })}, 

        [uniforms, 
        materialProps.metalness,
        materialProps.roughness,
        materialProps.color,
        materialProps.transmission,
        materialProps.thickness,
        currentIor])  

    
    const depthMaterial = useMemo(() => {
        return new CustomShaderMaterial({
            baseMaterial: THREE.MeshDepthMaterial,
            vertexShader: wobbleVertexShader,
            uniforms: uniforms,
            depthPacking: THREE.RGBADepthPacking
        })
    }, [uniforms])
    
    
    // BLOB
    const geometry = useMemo(() => {
        let geo = new THREE.IcosahedronGeometry(3, 50)
        geo = mergeVertices(geo)
        geo.computeTangents()
        return geo
    }, [])
    
    // Animation
    useFrame((state, delta) => {
        // Update time
        uniforms.uTime.value = state.clock.elapsedTime
    })
    
    // camera
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
            position={[0, 0, 0]}
        />

        <ambientLight intensity={0.5} />
    </>
)
}