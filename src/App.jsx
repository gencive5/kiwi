import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

export default function App ()
{
    return <>
     <Canvas
            // flat
            //  
            gl={ {
                antialias: true
            }}
            orthographicCamera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [3, 2, 6]
            }}
        >
            <Experience/>
        </Canvas>
    </>
}