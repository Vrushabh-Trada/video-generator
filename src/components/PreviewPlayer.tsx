'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { MyComposition } from '../remotion/Composition';

interface PreviewPlayerProps {
  videoUrl: string;
  doctorName: string;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ videoUrl, doctorName }) => {
  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-black">
      <Player
        component={MyComposition}
        inputProps={{
          videoUrl,
          doctorName,
        }}
        durationInFrames={30 * 30} // Default 30 seconds at 30fps
        fps={30}
        compositionWidth={1080}
        compositionHeight={1920}
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: '9 / 16',
          maxHeight: '80vh', // Limit height on desktop so user can see it
          margin: '0 auto',
        }}
        controls
        autoPlay
        loop
      />
    </div>
  );
};
