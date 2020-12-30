import React from 'react'
import classnames from 'classnames'
import VideoPlayer from './VideoPlayer'
import styled from 'styled-components'

export default function AudioPlayer (props) {
  return (
    <AudioPlayerWrapper className={classnames('audio-player', props.className)}>
      <VideoPlayer {...props} />
    </AudioPlayerWrapper>
  )
}

const AudioPlayerWrapper = styled.div`
  height: 50px;

  .plyr__video-wrapper {
    display: none;
  }

  .video-player, .plyr {
    height: 50px;
  }
`
