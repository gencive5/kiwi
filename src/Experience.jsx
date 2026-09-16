import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import wobbleVertexShader from './shaders/blur/vertex.glsl'
import wobbleFragmentShader from './shaders/blur/fragment.glsl'
import { useSpring } from '@react-spring/three'
import { useVideoTexture, Environment} from '@react-three/drei'
import { useIsMobile } from './IsMobile.jsx'


export default function Experience({ blinkTrigger, muted }) {
  
    const { scene } = useThree()

    // mobile detection
    const isMobile = useIsMobile()

    // video
    const videoTexture = useVideoTexture('/walk.mp4', {
        muted: muted,
        loop: true,   
        playsInline: true,
        crossOrigin: 'anonymous',
        start: false,
    })

    // preload video
    useEffect(() => {
    if (videoTexture) {
        const video = videoTexture.image
        if (video) {
            video.load()
            video.addEventListener('loadeddata', () => {
                video.play()
            })
        }
    }
    }, [videoTexture])

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
    const UTIME_FREQUENCY = 0.31
    const USTRENGTH = 0.38
    const DEFAULT_IOR = 2 

    
    // uniforms
    const uniforms = useMemo(() => ({
        uTime: new THREE.Uniform(0),
        uPositionFrequency: new THREE.Uniform(POSITION_FREQUENCY),
        uTimeFrequency: new THREE.Uniform(UTIME_FREQUENCY),
        uStrength: new THREE.Uniform(USTRENGTH),
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
        ior: DEFAULT_IOR,
        transparent: true,
        side: THREE.DoubleSide,
        metalness: 0.0, 
        })}, 

        [uniforms])  

    
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
        const subdivisions = isMobile ? 15 : 50;
        const size = isMobile ? 3 : 5;
        let geo = new THREE.IcosahedronGeometry(size, subdivisions);
        geo = mergeVertices(geo)
        geo.computeTangents()
        return geo
    }, [])

    // Animation
    useFrame((state) => {
        // Update time
        uniforms.uTime.value = state.clock.elapsedTime
    })

    const position = isMobile ? [0, 0, 0] : [0, 2, 0];
    const scale = isMobile ? [1.2, 2, 1] : [2.2, 1, 1.7];

    // Blink
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
            if (material) material.ior = value.ior
        },

        delay: blinkTrigger ? 0 : 5000 
    })
    

return (
    <> 
        <mesh
            geometry={geometry}
            material={material}
            customDepthMaterial={depthMaterial}
            position={position}
            scale={scale}
        />
        <Suspense fallback={null}>
        <Environment 
            files="./lilienstein_1k.hdr"
            background={false}
        />
        </Suspense>
    </>
)
}