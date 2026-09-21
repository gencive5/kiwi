import './style.css'
import { useState, lazy, Suspense  } from 'react'
import { Canvas } from '@react-three/fiber'
import blinkButton from './assets/blinkuplashes.svg'
import soundButton from './assets/unmute.svg'

const Experience = lazy(()=> import('./Experience.jsx'))

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
        <Suspense fallback={null}>
        <Experience blinkTrigger={blinkTrigger} muted={muted} />
        </Suspense>
    </Canvas>

    <div className= "blink-div">
        <button className= "blink-btn" onClick={handleBlink}>
            <img src={blinkButton} alt="Blink" className='blink-svg'/>
             <span className="blink-text">blink</span>
        </button>
     </div>
     
    <button onClick={handleToggleMute} className="sound-btn">
        {muted ? "unmute" : "mute"}
        <img src={soundButton} alt="Sound" className={`sound-svg ${muted ? '' : 'unmuted'}`}/>
    </button>

    <p className="text-div">je pourrais mourir pour toi</p>

    </>
}