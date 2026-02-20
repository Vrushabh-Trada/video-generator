'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Video } from 'lucide-react';

interface VideoUploaderProps {
  files: File[] | null;
  setFiles: (files: File[]) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ files, setFiles }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only accept one file
    if (acceptedFiles.length > 0) {
      setFiles([acceptedFiles[0]]);
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {files && files.length > 0 ? (
          <div className="flex flex-col items-center">
            <Video className="w-12 h-12 text-blue-500 mb-2" />
            <p className="text-gray-700 font-medium">{files[0].name}</p>
            <p className="text-sm text-gray-500">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Drag & drop your video here</p>
            <p className="text-sm text-gray-500">or click to browse (MP4 only)</p>
          </div>
        )}
      </div>
    </div>
  );
};
