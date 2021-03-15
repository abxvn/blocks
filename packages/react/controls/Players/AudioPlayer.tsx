import React from 'react'
import classnames from 'classnames'
import VideoPlayer from './VideoPlayer'
import styled from 'styled-components'

interface AudioPlayerProps {
  media: string
  className?: string
}
const AudioPlayer: React.FC<AudioPlayerProps> = (props: AudioPlayerProps) => {
  return (
    <AudioPlayerWrapper className={classnames('audio-player', props.className)}>
      <VideoPlayer {...props} />
    </AudioPlayerWrapper>
  )
}

export default AudioPlayer

const AudioPlayerWrapper = styled.div`
  height: 50px;

  .plyr__video-wrapper {
    display: none;
  }

  .video-player, .plyr {
    height: 50px;
  }
`
