import {useThree, extend, useFrame} from '@react-three/fiber'
import {useRef} from 'react'
import { useVideoTexture } from '@react-three/drei'
import fragmentShader from './shaders/blur/fragment.glsl'
import vertexShader from './shaders/blur/vertex.glsl'
import * as THREE from 'three'


export default function Experience ()
{

    const meshRef = useRef()
    const videoTexture = useVideoTexture('/walk.mp4', {
        muted: true,
        loop: true,   
        playsInline: true,
    })
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
        }
    })

    return <>

    <mesh ref={meshRef}>  
            <planeGeometry args={[4, 3]} />
            <meshBasicMaterial map={videoTexture} />
            <shaderMaterial
            uniforms={{ uTexture: { value: videoTexture }, uTintColor: { value: [0.2, 0.5, 0.5] }, uTime: { value: 0 }, uFrequency: { value: new THREE.Vector2(10, 5) }}}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            />
                
    </mesh>

    </>
}
