import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';

export default function MediaPlayer({ onClose, src = '/moe.mp4', autoPlayOnClick = false, defaultMuted = false, loop = false }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(defaultMuted);
  const videoRef = useRef(null);
  const seekTrackRef = useRef(null);
  const seekFillRef = useRef(null);
  const seekThumbRef = useRef(null);
  const volTrackRef = useRef(null);
  const statusTimeRef = useRef(null);
  const statusDurRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [volDragging, setVolDragging] = useState(false);

  function updateSeekDom(pct) {
    if (seekFillRef.current) seekFillRef.current.style.width = `${pct}%`;
    if (seekThumbRef.current) seekThumbRef.current.style.left = `calc(${pct}% - 9px)`;
  }

  useEffect(() => {
    updateSeekDom(0);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!autoPlayOnClick) return;
    function onFirstClick() {
      video.play().catch(() => {});
      document.removeEventListener('mousedown', onFirstClick, true);
    }
    document.addEventListener('mousedown', onFirstClick, true);
    return () => document.removeEventListener('mousedown', onFirstClick, true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const fmtTime = (t) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
    const onTimeUpdate = () => {
      updateSeekDom((video.currentTime / video.duration) * 100 || 0);
      if (statusTimeRef.current) statusTimeRef.current.textContent = fmtTime(video.currentTime);
    };
    const onLoadedMetadata = () => {
      if (statusDurRef.current) statusDurRef.current.textContent = `/ ${fmtTime(video.duration)}`;
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
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
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
    function onTouchMove(e) { e.preventDefault(); seekTo(getSeekPercent(e.touches[0].clientX)); }
    function onTouchEnd() { setDragging(false); }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
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

  function onTrackTouchStart(e) {
    e.preventDefault();
    seekTo(getSeekPercent(e.touches[0].clientX));
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
    function onTouchMove(e) { e.preventDefault(); setVolFromX(e.touches[0].clientX); }
    function onTouchEnd() { setVolDragging(false); }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [volDragging]);

  function setVolFromX(clientX) {
    const el = volTrackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setVolume(pct);
    setMuted(pct === 0);
  }

  function onVolTrackMouseDown(e) {
    e.preventDefault();
    setVolFromX(e.clientX);
    setVolDragging(true);
  }

  function onVolTrackTouchStart(e) {
    e.preventDefault();
    setVolFromX(e.touches[0].clientX);
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
          <Video ref={videoRef} src={src} muted={muted} loop={loop} playsInline />
        </NowPlaying>
        <StatusBar>
          <StatusLabel>
            <img key={playing ? 'playing' : 'paused'} src={playing ? '/Icons/playing.gif' : '/Icons/pause.gif'} alt="" />
            {playing ? 'Playing' : 'Paused'}
          </StatusLabel>
          <span><span ref={statusTimeRef}>0:00</span> <span ref={statusDurRef}>/ 0:00</span></span>
        </StatusBar>
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
            <SeekTrack ref={seekTrackRef} onMouseDown={onTrackMouseDown} onTouchStart={onTrackTouchStart}>
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
              <VolumeWrapper ref={volTrackRef} onMouseDown={onVolTrackMouseDown} onTouchStart={onVolTrackTouchStart}>
                <VolumeTrack>
                  <VolumeFill style={{ width: `${muted ? 0 : volume}%` }} />
                </VolumeTrack>
                <VolumeThumb style={{ left: `calc(${muted ? 0 : volume}% - 9px)` }} />
              </VolumeWrapper>
            </VolumeGroup>
          </BottomRow>
        </ControlsRight>
        </Controls>
      </Body>
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
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: #ebe9d8;               
  padding: 2px;
`;

const NowPlaying = styled.div`
  flex: 1;
  background: #000;
  display: flex;
  overflow: hidden;
`;

/* ── STATUS BAR ── */
const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
  border-top: 1px solid #fff;
  padding: 0px 20px; 
  font-size: 15px;
  color:  #8dafd4;
  flex-shrink: 0;
`;


const StatusLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
  img {
    width: 42px;
    height: 22px;
    object-fit: contain;
  }
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
    #4c5fb5 75%,
    #415ab3 95%,
    #2a337a 100%
  );
  border-top: 1px solid #d1e0f3;
  border-bottom: 1px solid #1a2a52;
  padding: 4px 8px;
  height: 60px;
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
  margin-right: 8px;
  @media (hover: hover) {
    &:hover {
      background: url('/buttons/Bitmap1834.png') center / contain no-repeat;
    }
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
  @media (hover: hover) {
    &:hover {
      background: url('/buttons/Bitmap1838.png') center / contain no-repeat;
    }
  }
`;

const SeekRow = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  top: 5px;
  margin-left: -12px;
`;

const SeekTrack = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 2px;
  background: linear-gradient(to bottom, #2a4a8a 0%, #3a5faa 5%, #5580c8 30%, #7ba3dc 90%, #c8d8f0 100%);
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
  @media (hover: hover) {
    &:hover {
      background: url('/buttons/Bitmap2241.png') center / contain no-repeat;
    }
  }
  &:active {
    cursor: grabbing;
  }
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
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
  height: 47px;
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
  @media (hover: hover) {
    &:hover {
      background: url(${(p) =>
          p.$playing
            ? '/buttons/Bitmap1818_pause_press.png'
            : '/buttons/Bitmap1816_play_pressed.png'})
        center / contain no-repeat;
    }
  }
`;

const StopBtn = styled.button`
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  border: none;
  background: url('/buttons/Bitmap1821.png') center / contain no-repeat;
  cursor: pointer;
  padding: 0;
  margin-left: -11px;
  margin-top: 10px;
  @media (hover: hover) {
    &:hover {
      background: url('/buttons/Bitmap1822.png') center / contain no-repeat;
    }
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
  @media (hover: hover) {
    &:hover {
      background: url('/buttons/Bitmap1827_right.png') center / contain no-repeat;
    }
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
  @media (hover: hover) {
    &:hover {
      background: url('/buttons/Bitmap1827.png') center / contain no-repeat;
    }
  }
`;


const VolumeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
`;

const MuteBtn = styled.button`
  width: 27px;
  height: 22px;
  flex-shrink: 0;
  border: none;
  background: url(${(p) => (p.$muted ? '/buttons/Bitmap1842.png' : '/buttons/Bitmap1840.png')}) center / 100% 100% no-repeat;
  cursor: pointer;
  padding: 0;
  @media (hover: hover) {
    &:hover {
      background: url(${(p) => (p.$muted ? '/buttons/Bitmap1842.png' : '/buttons/Bitmap1841.png')}) center / 100% 100% no-repeat;
    }
  }
`;

const VolumeWrapper = styled.div`
  width: 40px;
  height: 12px;
  position: relative;
  cursor: pointer;
  align-self: center;
  overflow: visible;
  margin-top: -4px;
`;

const VolumeTrack = styled.div`
  position: absolute;
  inset: 0;
  clip-path: path('M 2 8 Q 0 8 0 11 Q 0 14 2 14 L 30 14 L 40 3 Z');
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, #2a4a8a 5%, #3a5faa 50%, #5580c8 80%, #588ad0 100%);
    pointer-events: none;
  }
`;

const VolumeFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #55c166;
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
  @media (hover: hover) {
    &:hover {
      background: url('/buttons/Bitmap2241.png') center / contain no-repeat;
    }
  }
  &:active {
    cursor: grabbing;
  }
`;
