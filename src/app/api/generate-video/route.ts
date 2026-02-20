import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// We no longer call renderVideo here because Vercel Serverless cannot render Remotion videos.
// Instead, we store the video and return the URL so the client can play it with overlays.

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

        console.log(`Uploading video to Vercel Blob...`);

        // Upload to Vercel Blob
        const blob = await put(`uploads/${Date.now()}-${videoFile.name}`, videoFile, {
            access: 'public',
        });

        console.log(`Video uploaded to ${blob.url}`);

        // Return the blob URL. The client will use this to show the preview.
        // On Vercel Free, "rendering" happens in the user's browser for download.
        return NextResponse.json({
            success: true,
            videoUrl: blob.url,
            doctorName,
            message: 'Video uploaded successfully. Ready for preview.'
        });

    } catch (error) {
        console.error('Error handling video upload:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error during upload' },
            { status: 500 }
        );
    }
}

