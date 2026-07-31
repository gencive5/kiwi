import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import Video from './Video.jsx'

export default function App ()
{
    return <>
    <Video/>
     <Canvas
            gl={ {
                antialias: true
            }}
             style={{ position: 'relative', zIndex: 1 }} 
        >
            <Experience/>
        </Canvas>
    </>
}