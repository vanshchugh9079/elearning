import React, { useEffect, useState } from "react";
import { useDaily } from "@daily-co/daily-react";

const VideoTileGrid = () => {
  const daily = useDaily();
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    if (!daily) return;

    // Listen for participant updates
    const handleParticipantChange = () => {
      const participants = daily.participants();
      const newTiles = participants.map((participant) => ({
        id: participant.session_id,
        isLocal: participant.local,
        stream: participant.videoTrack,
      }));
      setTiles(newTiles);
    };

    daily.on("participant-updated", handleParticipantChange);
    daily.on("participant-joined", handleParticipantChange);

    // Clean up listeners on unmount
    return () => {
      daily.off("participant-updated", handleParticipantChange);
      daily.off("participant-joined", handleParticipantChange);
    };
  }, [daily]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {tiles.map((tile) => (
        <div key={tile.id} className="video-tile">
          <video
            ref={(ref) => {
              if (ref && tile.stream) {
                tile.stream.attach(ref);
              }
            }}
            autoPlay
            muted={tile.isLocal}
            className="rounded-lg"
          />
        </div>
      ))}
    </div>
  );
};

export default VideoTileGrid;
