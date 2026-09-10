import './style.css'
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import blinkButton from './assets/blinkline.svg'
import soundButton from './assets/unmute.svg'

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

    <div className= "blink-div">
        <button className= "blink-btn" onClick={handleBlink}>
            <img src={blinkButton} alt="Blink" className='blink-svg'/>
             <span className="blink-text">Blink</span>
        </button>
     </div>
     
    <button onClick={handleToggleMute} className="sound-btn">
        {muted ? "Unmute" : "Mute"}
        <img src={soundButton} alt="Sound" className='sound-svg'/>
    </button>
   
    </>
}