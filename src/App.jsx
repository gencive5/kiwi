import './style.css'
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

export default function App ()
{

    const [blinkTrigger, setBlinkTrigger] = useState(false)

    const handleBlink = () => {
        setBlinkTrigger(prev => !prev)
        setTimeout(() => setBlinkTrigger(false), 100)
    }

    return <>
     <Canvas
            gl={ {
                antialias: true
            }}
             style={{ position: 'relative', zIndex: 1 }} 
        >
            <Experience blinkTrigger={blinkTrigger} />
        </Canvas>
    <button className= "blink-btn" onClick={handleBlink}>Blink</button>
    </>
}