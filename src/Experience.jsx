// import {useThree, extend, useFrame} from '@react-three/fiber'
// import {useRef} from 'react'
import walking from './walking.mp4'
import { useVideoTexture } from '@react-three/drei'


export default function Experience ()
{

    const videoTexture = useVideoTexture('./walking.mp4')
    console.log(videoTexture)

    return <>

    <mesh>
            <planeGeometry args={[4, 3]} />
            <meshBasicMaterial map={videoTexture} />
    </mesh>

    </>
}
