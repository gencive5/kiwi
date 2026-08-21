import { useFrame, useThree, extend } from '@react-three/fiber'
import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import wobbleVertexShader from './shaders/blur/vertex.glsl'
import wobbleFragmentShader from './shaders/blur/fragment.glsl'
import { useSpring } from '@react-spring/three'
import { useVideoTexture, Environment} from '@react-three/drei'


export default function Experience({ blinkTrigger, muted }) {
   
    const meshRef = useRef()

    const { scene, camera } = useThree()

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

  
    useSpring({
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
        uStrength: new THREE.Uniform(USTRENGTH),
        uChromaticAberration: new THREE.Uniform(CHROMATIC_ABERRATION) 
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
    useFrame((state) => {
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

        <Environment 
        files="./lilienstein_1k.hdr"
        background={false}
        blur={88} 
        intensity={0.1}
        />
    </>
)
}