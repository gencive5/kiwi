// import {useThree, extend, useFrame} from '@react-three/fiber'
// import {useRef} from 'react'
// import walking from './walktrim.mp4'
import { useVideoTexture } from '@react-three/drei'
import fragmentShader from './shaders/blur/fragment.glsl'
import vertexShader from './shaders/blur/vertex.glsl'


export default function Experience ()
{

    const videoTexture = useVideoTexture('/walk.mp4', {
        muted: true,
        loop: true,   
        playsInline: true,
    })
    console.log(videoTexture)

    return <>

    <mesh>
            <planeGeometry args={[4, 3]} />
            <meshBasicMaterial map={videoTexture} />
            <shaderMaterial
            uniforms={{ uTexture: { value: videoTexture }, uTintColor: { value: [0.2, 0.5, 0.5] }}}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            />
                
    </mesh>

    </>
}
