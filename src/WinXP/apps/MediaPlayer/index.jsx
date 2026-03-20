import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';

const TRACKS = [
  {
    title: 'Track 1',
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    duration: 213,
  },
  {
    title: 'Track 2',
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    duration: 187,
  },
  {
    title: 'Track 3',
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    duration: 254,
  },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MediaPlayer({ onClose }) {
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef(null);
  const track = TRACKS[currentTrack];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + 100 / track.duration;
          if (next >= 100) {
            setCurrentTrack((t) => (t + 1) % TRACKS.length);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, track.duration]);

  function onClickOptionItem(item) {
    if (item === 'Exit') onClose();
  }

  function prevTrack() {
    setCurrentTrack((t) => (t - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  }

  function nextTrack() {
    setCurrentTrack((t) => (t + 1) % TRACKS.length);
    setProgress(0);
  }

  function stop() {
    setPlaying(false);
    setProgress(0);
  }

  const elapsed = Math.floor((progress / 100) * track.duration);

  return (
    <Container>
      <MenuBar>
        <WindowDropDowns items={dropDownData} onClickItem={onClickOptionItem} />
      </MenuBar>
      <Body>
        <NowPlaying>
          <VisualizerContainer>
            <VisualizerBars>
              {[...Array(28)].map((_, i) => (
                <Bar key={i} index={i} playing={playing} />
              ))}
            </VisualizerBars>
            <WmpLogo>
              <LogoRing />
              <LogoPlay>&#9654;</LogoPlay>
            </WmpLogo>
          </VisualizerContainer>
          <TrackInfoPanel>
            <TrackTitle>{track.title}</TrackTitle>
            <TrackMeta>
              {track.artist} — {track.album}
            </TrackMeta>
          </TrackInfoPanel>
        </NowPlaying>
        <Playlist>
          <PlaylistHeader>Now Playing</PlaylistHeader>
          {TRACKS.map((t, i) => (
            <PlaylistItem
              key={i}
              active={i === currentTrack}
              onClick={() => {
                setCurrentTrack(i);
                setProgress(0);
              }}
            >
              <PlaylistIndex active={i === currentTrack}>
                {i === currentTrack && playing ? '▶' : i + 1}
              </PlaylistIndex>
              <PlaylistTrackName active={i === currentTrack}>
                {t.title}
              </PlaylistTrackName>
              <PlaylistDuration>{formatTime(t.duration)}</PlaylistDuration>
            </PlaylistItem>
          ))}
        </Playlist>
      </Body>
      <Controls>
        <SeekRow>
          <TimeLabel>{formatTime(elapsed)}</TimeLabel>
          <SeekBar
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
          <TimeLabel>{formatTime(track.duration)}</TimeLabel>
        </SeekRow>
        <BottomRow>
          <TransportGroup>
            <TBtn title="Previous" onClick={prevTrack}>
              &#9664;&#9664;
            </TBtn>
            <TBtn
              title="Rewind"
              onClick={() => setProgress((p) => Math.max(0, p - 5))}
            >
              &#9664;
            </TBtn>
            <PlayPauseBtn
              title={playing ? 'Pause' : 'Play'}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? '&#10074;&#10074;' : '&#9654;'}
            </PlayPauseBtn>
            <TBtn title="Stop" onClick={stop}>
              &#9632;
            </TBtn>
            <TBtn
              title="Fast Forward"
              onClick={() => setProgress((p) => Math.min(99, p + 5))}
            >
              &#9654;
            </TBtn>
            <TBtn title="Next" onClick={nextTrack}>
              &#9654;&#9654;
            </TBtn>
          </TransportGroup>
          <VolumeGroup>
            <VolBtn
              title={muted ? 'Unmute' : 'Mute'}
              onClick={() => setMuted((m) => !m)}
            >
              {muted ? '🔇' : volume > 50 ? '🔊' : volume > 0 ? '🔉' : '🔈'}
            </VolBtn>
            <VolumeBar
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
            />
          </VolumeGroup>
        </BottomRow>
      </Controls>
    </Container>
  );
}

const barAnimation = keyframes`
  0%, 100% { height: 4px; }
  50% { height: 100%; }
`;

const Container = styled.div`
  height: 100%;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
`;

const MenuBar = styled.section`
  background: linear-gradient(to bottom, #2d2d2d, #1f1f1f);
  border-bottom: 1px solid #444;
  flex-shrink: 0;
  height: 21px;
  position: relative;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const VisualizerContainer = styled.div`
  width: 100%;
  flex: 1;
  background: radial-gradient(ellipse at center, #001a33 0%, #000 70%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 10px;
  position: relative;
  overflow: hidden;
`;

const VisualizerBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  width: 100%;
  height: 100%;
  padding: 0 10px;
`;

const Bar = styled.div`
  flex: 1;
  background: linear-gradient(to top, #00a8ff, #0050c8);
  border-radius: 1px 1px 0 0;
  min-height: 4px;
  animation: ${({ playing }) => (playing ? barAnimation : 'none')}
    ${({ index }) => 0.4 + (index % 7) * 0.1}s ease-in-out infinite;
  animation-delay: ${({ index }) => (index % 5) * 0.07}s;
`;

const WmpLogo = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoRing = styled.div`
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle, #ff6600 0%, #cc0000 60%, #880000 100%);
  box-shadow: 0 0 12px rgba(255, 100, 0, 0.6);
  border: 2px solid #ff8844;
`;

const LogoPlay = styled.span`
  position: relative;
  font-size: 18px;
  color: #fff;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  margin-left: 2px;
`;

const TrackInfoPanel = styled.div`
  background: linear-gradient(to right, #0d2240, #0a1a33);
  width: 100%;
  padding: 6px 10px;
  border-top: 1px solid #003366;
  flex-shrink: 0;
`;

const TrackTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #7ec8ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackMeta = styled.div`
  font-size: 10px;
  color: #5599cc;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Playlist = styled.div`
  width: 180px;
  background: #111;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
`;

const PlaylistHeader = styled.div`
  background: linear-gradient(to bottom, #2a2a2a, #1e1e1e);
  color: #aaa;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-bottom: 1px solid #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
`;

const PlaylistItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  background: ${({ active }) =>
    active ? 'linear-gradient(to right, #003366, #002244)' : 'transparent'};
  border-bottom: 1px solid #1a1a1a;
  gap: 4px;
  &:hover {
    background: ${({ active }) =>
      active ? 'linear-gradient(to right, #003366, #002244)' : '#1e1e1e'};
  }
`;

const PlaylistIndex = styled.span`
  color: ${({ active }) => (active ? '#7ec8ff' : '#555')};
  font-size: 9px;
  width: 12px;
  flex-shrink: 0;
`;

const PlaylistTrackName = styled.span`
  flex: 1;
  color: ${({ active }) => (active ? '#7ec8ff' : '#999')};
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlaylistDuration = styled.span`
  color: #555;
  font-size: 10px;
  flex-shrink: 0;
`;

const Controls = styled.div`
  background: linear-gradient(to bottom, #222, #1a1a1a);
  border-top: 1px solid #444;
  padding: 4px 8px 6px;
  flex-shrink: 0;
`;

const SeekRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const TimeLabel = styled.span`
  color: #7ec8ff;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  min-width: 30px;
`;

const SeekBar = styled.input`
  flex: 1;
  height: 4px;
  cursor: pointer;
  accent-color: #0078d7;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TransportGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const TBtn = styled.button`
  background: linear-gradient(to bottom, #3a3a3a, #2a2a2a);
  border: 1px solid #555;
  color: #ccc;
  border-radius: 3px;
  width: 26px;
  height: 22px;
  cursor: pointer;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:hover {
    background: linear-gradient(to bottom, #4a4a4a, #3a3a3a);
    color: #fff;
  }
  &:active {
    background: linear-gradient(to bottom, #222, #2a2a2a);
  }
`;

const PlayPauseBtn = styled(TBtn)`
  width: 32px;
  background: linear-gradient(to bottom, #0060b0, #004488);
  border-color: #0078d7;
  color: #fff;
  font-size: 11px;
  &:hover {
    background: linear-gradient(to bottom, #0070c0, #005599);
  }
`;

const VolumeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const VolBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  line-height: 1;
`;

const VolumeBar = styled.input`
  width: 70px;
  height: 4px;
  cursor: pointer;
  accent-color: #0078d7;
`;
