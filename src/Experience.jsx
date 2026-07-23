import {useThree, extend, useFrame} from '@react-three/fiber'
import {useRef} from 'react'
import { useVideoTexture, Text, MeshTransmissionMaterial, Sphere } from '@react-three/drei'
import fragmentShader from './shaders/blur/fragment.glsl'
import vertexShader from './shaders/blur/vertex.glsl'
import * as THREE from 'three'
import { useControls } from 'leva'


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

    const materialProps = useControls({
        thickness: { value: 0.2, min: 0, max: 3, step: 0.05},
        roughness: { value: 0, min: 0, max: 1, step: 0.1},
        transmission: { value: 1, min: 0, max: 1, step: 0.1},
        ior: { value: 1.2, min: 0, max: 3, step: 0.1 },
        chromaticAberration: { value: 0.02, min: 0, max: 1},
        backside: { value: true}
    })

    return <>

    <mesh ref={meshRef}>  
            <planeGeometry args={[4, 3]} />
            <meshBasicMaterial map={videoTexture} />
            <Text> Bye Kiwi</Text>
            <Sphere><MeshTransmissionMaterial {...materialProps}/></Sphere>
            <shaderMaterial
            uniforms={{ uTexture: { value: videoTexture }, uTintColor: { value: [0.2, 0.5, 0.5] }, uTime: { value: 0 }, uFrequency: { value: new THREE.Vector2(10, 5) }}}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            />
                
    </mesh>

    </>
}
