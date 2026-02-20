import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

interface RenderVideoParams {
    videoPath: string; // Absolute path to the uploaded video
    doctorName: string;
    outputFileName: string;
    localVideoPath: string; // Added local path for metadata
}

export async function renderVideo({ videoPath, doctorName, outputFileName, localVideoPath }: RenderVideoParams): Promise<string> {
    const compositionId = 'MyComp';

    // 1. Bundle the Remotion project
    // Ensure the entry point is correct.
    // Standard location: src/remotion/index.ts or src/remotion/Root.tsx or remotion/index.ts
    const entryPoint = path.join(process.cwd(), 'src', 'remotion', 'index.ts');

    console.log('Bundling video...');
    const bundleLocation = await bundle({
        entryPoint,
        // If you need specific webpack config, add here
        // For Next.js projects, sometimes special handling is needed but defaults work well.
    });

    // 2. Select the composition (to get dimensions/props default)
    const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: {
            videoUrl: videoPath, // Pass the path directly or convert to file URL
            doctorName,
        },
    });

    // 3. Render the video
    const outputLocation = path.join(process.cwd(), 'public', 'generated', outputFileName);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(path.dirname(outputLocation))) {
        fs.mkdirSync(path.dirname(outputLocation), { recursive: true });
    }

    // 3. Get video duration to match the input video length
    // We need a way to get the duration. Remotion has `getVideoMetadata` but it requires a file or URL it can access.
    // Since we have a public URL or local file, we can try to get metadata.
    // However, simplest way effectively for now is to trust the user or check it.
    // Let's use `getVideoMetadata` from `@remotion/renderer`.

    // Note: renderMedia allows overriding durationInFrames

    // We can use a helper to get duration if needed, but for now let's try to let Remotion handle it or strict to a default?
    // User requested "keep full length video".

    // Check metadata to get the exact duration of the uploaded video
    const { getVideoMetadata } = require('@remotion/renderer');

    // Use LOCAL file path for metadata to avoid network issues/delays
    console.log("Getting metadata from local path:", localVideoPath);

    let durationInFrames = 300; // Default fallback (10s)

    try {
        const metadata = await getVideoMetadata(localVideoPath);
        durationInFrames = Math.floor(metadata.durationInSeconds * 30);
        console.log(`Video duration: ${metadata.durationInSeconds}s, Frames: ${durationInFrames}`);
    } catch (e) {
        console.error("Failed to get video metadata, using default duration.", e);
    }

    console.log('Rendering video with durationInFrames:', durationInFrames);
    await renderMedia({
        composition: {
            ...composition,
            durationInFrames: durationInFrames, // Explicitly override duration
        },
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation,
        inputProps: {
            videoUrl: videoPath,
            doctorName,
        },
        // Encoding settings for WhatsApp
        crf: 23,
        pixelFormat: 'yuv420p',
        audioBitrate: '128k',
        // videoBitrate: '2M',
    });

    console.log('Video rendered to:', outputLocation);
    return `/generated/${outputFileName}`;
}
