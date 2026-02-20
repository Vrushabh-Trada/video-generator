'use client';

import React, { useState } from 'react';
import { VideoUploader } from '@/components/VideoUploader';
import { DoctorInput } from '@/components/DoctorInput';
import { PreviewPlayer } from '@/components/PreviewPlayer'; // New import
import { Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null); // New state
  const [doctorName, setDoctorName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!videoFile || !doctorName) {
      setError('Please provide both a video file and doctor name.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('doctorName', doctorName);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload video');
      }

      // In the Vercel Free version, we don't render a file on the server.
      // We use the uploaded video from Blob storage to show the preview.
      setGeneratedUrl(data.videoUrl); 
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };


  // Effect to create object URL for preview
  React.useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Personalized Patient Education Video Generator
            </h1>
            <p className="text-blue-100 text-center text-sm mt-1">
              Create branded videos for World Stroke Day
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Step 1: Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Upload Doctor Video
              </h2>
              <VideoUploader files={videoFile ? [videoFile] : null} setFiles={(files) => setVideoFile(files[0])} />
            </div>


            {/* Step 2: Input Name */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Enter Doctor Details
              </h2>
              <DoctorInput value={doctorName} onChange={setDoctorName} />
            </div>

            {/* Step 3: Review Preview */}
            {videoPreviewUrl && (
              <div className="animate-fade-in">
                 <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                  Review Preview
                </h2>
                <div className="bg-gray-900 rounded-lg p-4 flex justify-center">
                  <div className="relative w-full max-w-sm"> {/* Constrain width for vertical video */}
                    <PreviewPlayer videoUrl={videoPreviewUrl} doctorName={doctorName || "Doctor Name"} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  This is how your video will look.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !videoFile || !doctorName}
                className={`flex items-center justify-center px-8 py-3 text-lg font-medium rounded-full shadow-md transition-all ${
                  isGenerating || !videoFile || !doctorName
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Generating Video...
                  </>
                ) : (
                  'Generate Video'
                )}
              </button>
            </div>

            {/* Result Section */}
            {generatedUrl && (
              <div className="mt-8 border-t border-gray-100 pt-8 animate-fade-in">
                <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                  <div className="flex items-center justify-center mb-6">
                    <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                    <h2 className="text-xl font-bold text-green-800">Your Branded Video is Ready!</h2>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 flex justify-center mb-6">
                    <div className="relative w-full max-w-sm">
                      <PreviewPlayer videoUrl={generatedUrl} doctorName={doctorName} />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-sm text-green-700">
                      The video has been processed and branded with your details.
                    </p>
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Finalize & Share
                      </button>
                      <p className="text-[10px] text-gray-400 max-w-xs">
                        * In the Free Testing Version, you can preview and share the branded link. MP4 downloads require a dedicated rendering server.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
          
          <div className="bg-gray-50 px-6 py-4 text-center text-xs text-gray-500 border-t border-gray-200">
             Video Automation System - Demo Version
          </div>
        </div>
      </div>
    </div>
  );
}
