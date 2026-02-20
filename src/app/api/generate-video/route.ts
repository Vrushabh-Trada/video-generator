import { NextRequest, NextResponse } from 'next/server';
import { renderVideo } from '../../../lib/video-renderer'; // Correct relative import path
import path from 'path';
import fs from 'fs';
// using custom generateUniqueId instead of uuid package

// Since standard Node.js doesn't have uuid built-in without package, use simple timestamp + random string
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const videoFile = data.get('video') as File | null;
        const doctorName = data.get('doctorName') as string | null;

        if (!videoFile || !doctorName) {
            return NextResponse.json({ error: 'Missing video or doctor name' }, { status: 400 });
        }

        if (videoFile.type !== 'video/mp4') {
            return NextResponse.json({ error: 'Invalid file type. Only MP4 is allowed.' }, { status: 400 });
        }

        // Determine paths
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueId = generateUniqueId();
        const fileName = `upload-${uniqueId}.mp4`;
        const filePath = path.join(uploadDir, fileName);

        // Write file to disk
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        console.log(`Video uploaded to ${filePath}`);

        // Generate output filename
        const outputFileName = `render-${uniqueId}.mp4`;

        // Render video
        // Note: renderVideo is async and potentially long-running. 
        // Ideally this should be a background job. Typically Vercel functions time out after 10s.
        // However, since this is a local setup for MVP, we can await it.
        // Or return a processing ID and poll status.
        // For simplicity, we await it but acknowledge potential timeout if deployed.

        // Construct the public URL for the video so Remotion can access it via HTTP
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const videoUrl = `${protocol}://${host}/uploads/${fileName}`;

        const downloadUrl = await renderVideo({
            videoPath: videoUrl, // Pass HTTP URL for Remotion rendering
            localVideoPath: filePath, // Pass local path for metadata fetching
            doctorName,
            outputFileName,
        });

        return NextResponse.json({
            success: true,
            downloadUrl,
            message: 'Video generated successfully'
        });

    } catch (error) {
        console.error('Error generating video:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error during generation' },
            { status: 500 }
        );
    }
}
