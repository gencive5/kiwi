import React from "react";
import './style.css'

export default function Video() {

    return(
        <div>
            <video loop autoPlay muted id="bg-video">
                 <source src="/walk.mp4" type="video/mp4" />
            </video>
        </div>
    )
}