import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig, Video } from 'remotion';
import { z } from 'zod';

export const myCompSchema = z.object({
  videoUrl: z.string(),
  doctorName: z.string(),
});

export const MyComposition: React.FC<z.infer<typeof myCompSchema>> = ({
  videoUrl,
  doctorName,
}) => {
  const { width, height } = useVideoConfig();

  // Coordinates based on estimation - update these after visual check
  // Square frame parameters
  const videoSize = 850; // Approximated square size
  const videoX = (width - videoSize) / 2; // Center horizontally
  const videoY = 480; // Approximate top offset for the square

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      {/* 
        Layer 1: Background Template 
        Ensure 'template.jpg' is in the public folder.
        If a transparent area isn't available, we layer the video on top.
      */}
      <Img 
        src={staticFile('image/World Strock Day_PNG.png')} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          zIndex: 1,
        }}
        onError={(e: any) => {
           console.warn("Template image not found, using fallback");
           e.currentTarget.style.display = 'none'; // Hide the broken image
        }}
      />
      
      {/* 
        Layer 2: Doctor Video
        Positioned to fit strictly within the square frame.
        zIndex must be > 1 to sit ON TOP of the opaque jpg template.
      */}
      {videoUrl ? (
        <Sequence from={0}>
          <div
            style={{
              position: 'absolute',
              // Further refined coordinates to fit INSIDE the blue border
              top: 380, 
              left: 170, 
              width: 740, // Reduced size to fit inside
              height: 740, 
              overflow: 'hidden',
              zIndex: 2, 
            }}
          >
            <Video
              src={videoUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </Sequence>
      ) : null}

      {/* 
        Layer 3: Doctor Name Overlay
      */}
      <Sequence from={0}>
        <div
          style={{
            position: 'absolute',
            top: 1180, // Adjusted further down to clear the video box
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 3,
          }}
        >
          {/* Container with background to cover the static text in the template */}
          <div
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white to blend but cover
                padding: '10px 40px',
                borderRadius: '8px',
                minWidth: '400px',
                textAlign: 'center',
            }}
          >
            <h1
                style={{
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                fontSize: '50px',
                color: '#000',
                margin: 0,
                textTransform: 'capitalize'
                }}
            >
                {doctorName}
            </h1>
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
