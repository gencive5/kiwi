// import {useThree, extend, useFrame} from '@react-three/fiber'
// import {useRef} from 'react'
import walking from './walktrim.mp4'
import { useVideoTexture } from '@react-three/drei'


export default function Experience ()
{

    const videoTexture = useVideoTexture('./walktrim.mp4')
    console.log(videoTexture)

    return <>

    <mesh>
            <planeGeometry args={[4, 3]} />
            <meshBasicMaterial map={videoTexture} />
    </mesh>

    </>
}
