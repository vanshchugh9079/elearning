import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const AudioVisualizer = ({ stream }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4a90e2',
      progressColor: '#2a5caa',
      cursorColor: 'transparent',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 0,
      height: 50,
      barGap: 2,
      interact: false,
    });

    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      wavesurferRef.current.loadBlob(blob);
    };
    
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 100);

    return () => {
      wavesurferRef.current.destroy();
      source.disconnect();
    };
  }, [stream]);

  return <div ref={waveformRef} className="audio-visualizer" />;
};

export default AudioVisualizer;