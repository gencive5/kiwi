import { useFrame, useThree, extend } from '@react-three/fiber'
import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import wobbleVertexShader from './shaders/blur/vertex.glsl'
import wobbleFragmentShader from './shaders/blur/fragment.glsl'
import video from '/walk.mp4'
import { useSpring, animated } from '@react-spring/three'
import { useVideoTexture, Environment} from '@react-three/drei'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'


export default function Experience({ blinkTrigger, muted }) {
   
    const meshRef = useRef()

    const { scene, camera, gl, size, viewport } = useThree()

    const rgbeLoader = new RGBELoader()

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


    // Material parameters
    const DEFAULT_TRANSMISSION = 1.0
    const DEFAULT_THICKNESS = 0.95
    const DEFAULT_ROUGHNESS = 0.19
    const DEFAULT_COLOR = '#ffffff'

    const POSITION_FREQUENCY = 0.50
    const UTIME_FREQUENCY = 0.46
    const USTRENGTH = 0.30
    const CHROMATIC_ABERRATION = 0.10


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
        uPositionFrequency: new THREE.Uniform(POSITION_FREQUENCY),
        uTimeFrequency: new THREE.Uniform(UTIME_FREQUENCY),
        uStrength: new THREE.Uniform(USTRENGTH)
        }), 
        [])


    // materials
    const material = useMemo(() => {
        return new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            vertexShader: wobbleVertexShader,
            fragmentShader: wobbleFragmentShader,
            uniforms: uniforms,
        
        // MeshPhysicalMaterial properties
        roughness: DEFAULT_ROUGHNESS,
        transmission: DEFAULT_TRANSMISSION,
        thickness: DEFAULT_THICKNESS,
        color: DEFAULT_COLOR,
        ior: currentIor,
        chromaticAberration: CHROMATIC_ABERRATION,
        transparent: true,
        opacity: meshVisible ? 1 : 0,
        side: THREE.DoubleSide,
        metalness: 0.0, 
        })}, 

        [uniforms, 
        DEFAULT_ROUGHNESS,
        DEFAULT_TRANSMISSION,
        DEFAULT_THICKNESS,
        DEFAULT_COLOR,
        CHROMATIC_ABERRATION,
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
        let geo = new THREE.IcosahedronGeometry(10, 50)
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
        <mesh
            ref={meshRef}
            geometry={geometry}
            material={material}
            customDepthMaterial={depthMaterial}
            receiveShadow
            position={[0, 8, 0]}
            scale={[2.7, 1, 1.4]}
            visible={meshVisible}
        />

        {/* <ambientLight intensity={0.1} /> */}

        <Environment 
        files="./lilienstein_1k.hdr"
        background={false}
        blur={88} 
        intensity={0.1}
        />
    </>
)
}