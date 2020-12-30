import React, { useEffect, useRef } from 'react'
import Plyr from 'plyr'
import 'plyr/src/sass/plyr.scss'

export default function VideoPlayer ({ media }) {
  return (
    <div className='video-player'>
      <YoutubePlayer id={media.replace(/^[^:/]+[:/]/, '')} />
    </div>
  )
}

export function YoutubePlayer ({ id }) {
  const video = useRef()
  const player = useRef()

  useEffect(() => {
    player.current = new Plyr(video.current, {
      autoplay: true,
      controls: ['play', 'volume', 'current-time', 'mute', 'frameTitle'],
      resetOnEnd: true,
      clickToPlay: false,
      settings: [],
      hideControls: false,
      muted: true
    })
  }, [])

  // Watch url changes
  useEffect(() => {
    player.current.source = {
      type: 'video',
      sources: [
        {
          src: id,
          provider: 'youtube'
        }
      ]
    }
  }, [id])

  return (
    <div ref={video} id='player' data-plyr-provider='youtube' data-plyr-embed-id={id} />
  )
}
