import './style.css'
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

export default function App ()
{

    const [blinkTrigger, setBlinkTrigger] = useState(false)

    const handleBlink = () => {
        setBlinkTrigger(prev => !prev)
        setTimeout(() => setBlinkTrigger(false), 100)
    }

    const [muted, setMuted] = useState(true);
    const handleToggleMute = () => setMuted(current => !current);

    return <>
     <Canvas
            gl={ {
                antialias: true
            }}
             style={{ position: 'relative', zIndex: 1 }} 
        >
        <Experience blinkTrigger={blinkTrigger} muted={muted} />
    </Canvas>
    <button className= "blink-btn" onClick={handleBlink}>Blink</button>
    <button onClick={handleToggleMute} className="sound-btn">{muted ? "Unmute" : "Mute"}</button>
    </>
}