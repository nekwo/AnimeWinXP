import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';

export default function MediaPlayer({ onClose, src = '/moe.mp4', autoPlayOnClick = false }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef(null);
  const seekTrackRef = useRef(null);
  const seekFillRef = useRef(null);
  const seekThumbRef = useRef(null);
  const volTrackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [volDragging, setVolDragging] = useState(false);

  function updateSeekDom(pct) {
    if (seekFillRef.current) seekFillRef.current.style.width = `${pct}%`;
    if (seekThumbRef.current) seekThumbRef.current.style.left = `calc(${pct}% - 9px)`;
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!autoPlayOnClick) return;
    function onFirstClick() {
      video.play().catch(() => {});
      document.removeEventListener('click', onFirstClick);
    }
    document.addEventListener('click', onFirstClick);
    return () => document.removeEventListener('click', onFirstClick);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      updateSeekDom((video.currentTime / video.duration) * 100 || 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      updateSeekDom(0);
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (!dragging) return;
    function onMouseMove(e) { seekTo(getSeekPercent(e.clientX)); }
    function onMouseUp() { setDragging(false); }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  function getSeekPercent(clientX) {
    const el = seekTrackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }

  function seekTo(pct) {
    const video = videoRef.current;
    if (video && video.duration) {
      video.currentTime = (pct / 100) * video.duration;
    }
    updateSeekDom(pct);
  }

  function onTrackMouseDown(e) {
    e.preventDefault();
    seekTo(getSeekPercent(e.clientX));
    setDragging(true);
  }

  function onClickOptionItem(item) {
    if (item === 'Exit') onClose();
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
  }

  function stop() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    updateSeekDom(0);
  }

  useEffect(() => {
    if (!volDragging) return;
    function onMouseMove(e) { setVolFromX(e.clientX); }
    function onMouseUp() { setVolDragging(false); }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [volDragging]);

  function setVolFromX(clientX) {
    const el = volTrackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setVolume(pct);
    setMuted(false);
  }

  function onVolTrackMouseDown(e) {
    e.preventDefault();
    setVolFromX(e.clientX);
    setVolDragging(true);
  }

  function seekBack() {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
  }

  function seekForward() {
    const video = videoRef.current;
    if (video)
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
  }

  return (
    <Container>
      <MenuBar>
        <WindowDropDowns items={dropDownData} onClickItem={onClickOptionItem} />
      </MenuBar>
      <Body>
        <NowPlaying>
          <Video ref={videoRef} src={src} autoPlay muted={muted} />
        </NowPlaying>
      </Body>
      <Controls>
        <PlayPauseBtn
          title={playing ? 'Pause' : 'Play'}
          onClick={togglePlay}
          $playing={playing}
        />
        <StopBtn title="Stop" onClick={stop} />
        <ControlsRight>
          <SeekRow>
            <SeekBackBtn title="-10s" onClick={seekBack} />
            <SeekTrack ref={seekTrackRef} onMouseDown={onTrackMouseDown}>
              <SeekFill ref={seekFillRef} />
              <SeekThumb ref={seekThumbRef} />
            </SeekTrack>
            <SeekFwdBtn title="+10s" onClick={seekForward} />
          </SeekRow>
          <BottomRow>
            <TransportGroup>
              <PrevBtn title="-10s" onClick={seekBack} />
              <NextBtn title="+10s" onClick={seekForward} />
            </TransportGroup>
            <VolumeGroup>
              <MuteBtn
                title={muted ? 'Unmute' : 'Mute'}
                onClick={() => setMuted((m) => !m)}
                $muted={muted}
              />
              <VolumeTrack ref={volTrackRef} onMouseDown={onVolTrackMouseDown}>
                <VolumeFill style={{ width: `${muted ? 0 : volume}%` }} />
                <VolumeThumb style={{ left: `calc(${muted ? 0 : volume}% - 9px)` }} />
              </VolumeTrack>
            </VolumeGroup>
          </BottomRow>
        </ControlsRight>
      </Controls>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
`;

const MenuBar = styled.section`
  background: #ebe9d8;
  border-bottom: 1px solid #f8f6f5;
  flex-shrink: 0;
  height: 21px;
  position: relative;
  color: #040100;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const NowPlaying = styled.div`
  flex: 1;
  background: #000;
  display: flex;
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Controls = styled.div`
  background: linear-gradient(
    to bottom,
    #b0c4de 0%,
    #7a96d4 10%,
    #5b7cc2 50%,
    #4a6bb3 95%,
    #2a407a 100%
  );
  border-top: 1px solid #d1e0f3;
  border-bottom: 1px solid #1a2a52;
  padding: 4px 8px;
  height: 52px;
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7px;
`;

const ControlsRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
`;


const SeekBackBtn = styled.button`
  width: 16px;
  height: 13px;
  flex-shrink: 0;
  border: none;
  background: url('/buttons/Bitmap1833.png') center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  margin-right: 4px;
  &:hover {
    background: url('/buttons/Bitmap1834.png') center / contain no-repeat;
  }
`;

const SeekFwdBtn = styled.button`
  width: 16px;
  height: 13px;
  flex-shrink: 0;
  border: none;
  background: url('/buttons/Bitmap1837.png') center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  &:hover {
    background: url('/buttons/Bitmap1838.png') center / contain no-repeat;
  }
`;

const SeekRow = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  top: 5px;
`;

const SeekTrack = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #555;
  position: relative;
  cursor: pointer;
  align-self: center;
  overflow: visible;
`;

const SeekFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #55c166;
  border-radius: 2px;
  pointer-events: none;
`;

const SeekThumb = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  width: 18px;
  height: 13px;
  background: url('/buttons/Bitmap2242.png') center / contain no-repeat;
  cursor: grab;
  &:hover {
    background: url('/buttons/Bitmap2241.png') center / contain no-repeat;
  }
  &:active {
    cursor: grabbing;
  }
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  top: 4px;
`;

const TransportGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0px;
  margin-left: -7px;
`;

const PlayPauseBtn = styled.button`
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border: none;
  margin-left: -8px;
  background: url(${(p) =>
      p.$playing
        ? '/buttons/Bitmap1818_pause.png'
        : '/buttons/Bitmap1815.png'})
    center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  &:hover {
    background: url(${(p) =>
        p.$playing
          ? '/buttons/Bitmap1818_pause_press.png'
          : '/buttons/Bitmap1816_play_pressed.png'})
      center / contain no-repeat;
  }
`;

const StopBtn = styled.button`
  width: 33px;
  height: 33px;
  flex-shrink: 0;
  border: none;
  background: url('/buttons/Bitmap1821.png') center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  margin-left: -14px;
  margin-top: 10px;
  &:hover {
    background: url('/buttons/Bitmap1822.png') center / contain no-repeat;
  }
`;

const NextBtn = styled.button`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  background: url('/buttons/Bitmap1825_right.png') center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  &:hover {
    background: url('/buttons/Bitmap1827_right.png') center / contain no-repeat;
  }
`;

const PrevBtn = styled.button`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  background: url('/buttons/Bitmap1825_left.png') center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  &:hover {
    background: url('/buttons/Bitmap1827.png') center / contain no-repeat;
  }
`;


const VolumeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MuteBtn = styled.button`
  width: 21px;
  height: 16px;
  flex-shrink: 0;
  border: none;
  background: url(${(p) => (p.$muted ? '/buttons/Bitmap1842.png' : '/buttons/Bitmap1840.png')}) center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  &:hover {
    background: url(${(p) => (p.$muted ? '/buttons/Bitmap1842.png' : '/buttons/Bitmap1841.png')}) center / contain no-repeat;
  }
`;

const VolumeTrack = styled.div`
  width: 70px;
  height: 4px;
  border-radius: 2px;
  background: #555;
  position: relative;
  cursor: pointer;
  align-self: center;
  overflow: visible;
`;

const VolumeFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #55c166;
  border-radius: 2px;
  pointer-events: none;
`;

const VolumeThumb = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  width: 18px;
  height: 13px;
  background: url('/buttons/Bitmap2242.png') center / contain no-repeat;
  cursor: grab;
  &:hover {
    background: url('/buttons/Bitmap2241.png') center / contain no-repeat;
  }
  &:active {
    cursor: grabbing;
  }
`;
