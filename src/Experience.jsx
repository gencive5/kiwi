import { useFrame, useThree, extend } from '@react-three/fiber'
import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import wobbleVertexShader from './shaders/blur/vertex.glsl'
import wobbleFragmentShader from './shaders/blur/fragment.glsl'
import video from '/walk.mp4'
import { useControls } from 'leva'
import { useSpring, animated } from '@react-spring/three'
import { useVideoTexture} from '@react-three/drei'


export default function Experience({ blinkTrigger, muted }) {
   
    const meshRef = useRef()

    const { scene, camera, gl, size, viewport } = useThree()

    // video
    const videoTexture = useVideoTexture('/walk.mp4', {
        muted: muted,
        loop: true,   
        playsInline: true,
    })

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

    useEffect(() => {
        if (videoTexture) {
            const video = videoTexture.image
            if (video) {
                video.muted = muted
            }
        }
    }, [muted])

    
    // leva
     const materialProps = useControls({
        thickness: { value: 1.5, min: 0, max: 3, step: 0.05 },
        roughness: { value: 0.5, min: 0, max: 1, step: 0.05 },
        // transmission: { value: 0, min: 0, max: 1, step: 0.05 },
        color: { value: '#ffffff' },
    })

        const wobbleControls = useControls({
        uPositionFrequency: { value: 0.5, min: 0, max: 2, step: 0.001 },
        uTimeFrequency: { value: 0.4, min: 0, max: 2, step: 0.001 },
        uStrength: { value: 0.3, min: 0, max: 2, step: 0.001 },
    })
    // Material parameters
    const DEFAULT_TRANSMISSION = 0.95


    // Blink
    const DEFAULT_IOR = 2 
    const [currentIor, setCurrentIor] = useState(DEFAULT_IOR)
    const [meshVisible, setMeshVisible] = useState(true)

  
    const { ior } = useSpring({
        ior: blinkTrigger ? 0 : DEFAULT_IOR,
        config: {
            duration: blinkTrigger ? 1000 : 7000,
            easing: t =>  {
                if (blinkTrigger) { 
                    return t * t * (3 - 2 * t) 
                } else {
                    return t
                }
            }
        },
        onChange: ({ value }) => {
            setCurrentIor(value.ior)
            setMeshVisible(newIor > 0.01)
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
        roughness: materialProps.roughness,
        transmission: DEFAULT_TRANSMISSION,
        thickness: materialProps.thickness,
        color: materialProps.color,
        ior: currentIor,
        transparent: true,
        opacity: meshVisible ? 1 : 0,
        side: THREE.DoubleSide,
        })}, 

        [uniforms, 
        materialProps.roughness,
        DEFAULT_TRANSMISSION,
        materialProps.thickness,
        materialProps.color,
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
        let geo = new THREE.IcosahedronGeometry(6, 50)
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
{/*         
        <directionalLight
            color="#ffffff"
            intensity={3}
            position={[0.25, 2, -2.25]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={15}
            shadow-normalBias={0.05}
        /> */}
        
        <mesh
            ref={meshRef}
            geometry={geometry}
            material={material}
            customDepthMaterial={depthMaterial}
            receiveShadow
            position={[0, 0, 0]}
            visible={meshVisible}
        />

        <ambientLight intensity={0.5} />
    </>
)
}