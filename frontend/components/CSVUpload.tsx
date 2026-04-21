/**
 * CSV Upload Component
 * Drag-and-drop or file picker for uploading Key Launch CSV data
 */

'use client';

import React, { useState, useRef } from 'react';

interface CSVUploadProps {
  onUploadSuccess: () => void;
  onUploadError: (error: string) => void;
}

export function CSVUpload({ onUploadSuccess, onUploadError }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [planningCycle, setPlanningCycle] = useState('Q2 refresh 2026');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      onUploadError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('planning_cycle', planningCycle);

      const response = await fetch('http://localhost:5000/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Upload failed');
      }

      const result = await response.json();
      onUploadSuccess();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <button
      onClick={handleButtonClick}
      disabled={isUploading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      {isUploading ? 'Uploading...' : 'Upload CSV'}
    </button>
  );
}
