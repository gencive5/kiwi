import React, { useState } from 'react'
import './style.css'

export default function Video() {

    
    const [muted, setMuted] = useState(true);
    const handleToggleMute = () => setMuted(current => !current);

    return(
        <div>
            <video loop autoPlay muted={muted} playsInline id="bg-video">
                 <source src="/walk.mp4" type="video/mp4" />
            </video>

            <button onClick={handleToggleMute} className="control">{muted ? "Unmute" : "Mute"}</button>
        </div>
    )
}



                
