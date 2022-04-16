import React, { useEffect, useRef } from 'react'
import Plyr from 'plyr'
import 'plyr/src/sass/plyr.scss'

interface VideoPlayerProps {
  media: string
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({ media }: VideoPlayerProps) => {
  return (
    <div className='video-player'>
      <YoutubePlayer id={media.replace(/^[^:/]+[:/]/, '')} />
    </div>
  )
}

export default VideoPlayer

interface YoutubePlayerProps {
  id: string
}
export const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ id }: YoutubePlayerProps) => {
  const video = useRef<HTMLDivElement>(null)
  const player = useRef<Plyr>()

  useEffect(() => {
    if (video.current !== null) {
      player.current = new Plyr(video.current, {
        autoplay: true,
        controls: ['play', 'volume', 'current-time', 'mute', 'frameTitle'],
        resetOnEnd: true,
        clickToPlay: false,
        settings: [],
        hideControls: false,
        muted: true
      })
    }
  }, [])

  // Watch url changes
  useEffect(() => {
    if (player.current != null) {
      player.current.source = {
        type: 'video',
        sources: [
          {
            src: id,
            provider: 'youtube'
          }
        ]
      }
    }
  }, [id])

  return (
    <div ref={video} id='player' data-plyr-provider='youtube' data-plyr-embed-id={id} />
  )
}
