import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

export default function App ()
{
    return <>
     <Canvas
            gl={ {
                antialias: true
            }}
        >
            <Experience/>
        </Canvas>
    </>
}