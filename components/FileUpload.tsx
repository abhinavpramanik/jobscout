'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface FileUploadProps {
  type: 'profilePic' | 'resume';
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  onDelete?: () => void;
}

export default function FileUpload({ type, currentUrl, onUploadSuccess, onDelete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = type === 'profilePic';
  const accept = isImage ? 'image/jpeg,image/jpg,image/png,image/webp' : 'application/pdf';
  const maxSize = isImage ? 5 : 10; // MB
  const label = isImage ? 'Profile Picture' : 'Resume';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset states
    setError(null);
    setSuccess(false);

    // Validate file type
    if (isImage) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, WEBP)');
        return;
      }
    } else {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
    }

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await fetch('/api/upload-profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const uploadedUrl = type === 'profilePic' ? data.data.profilePicUrl : data.data.resumeUrl;
      setSuccess(true);
      onUploadSuccess(uploadedUrl);

      // Clear file input after successful upload
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setUploading(true);
    setError(null);

    try {
      const response = await fetch(`/api/upload-profile?type=${type}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      onDelete();
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{label}</h3>
        {currentUrl && (
          <Button
            onClick={handleDelete}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Delete
          </Button>
        )}
      </div>

      {/* Current File Display */}
      {currentUrl && !file && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          {isImage ? (
            <div className="w-32 h-32 mx-auto relative">
              <Image
                src={currentUrl}
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Current Resume
              </a>
            </div>
          )}
        </div>
      )}

      {/* File Input */}
      <div className="space-y-3">
        <label
          htmlFor={`file-${type}`}
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {preview && isImage ? (
              <div className="w-32 h-32 mb-3 relative">
                <Image src={preview} alt="Preview" fill className="object-cover rounded-full" />
              </div>
            ) : (
              <Upload className="w-10 h-10 mb-3 text-slate-400" />
            )}
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              {preview && !isImage ? (
                <span className="font-semibold">{preview}</span>
              ) : (
                <>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {isImage ? 'PNG, JPG, WEBP (MAX. 5MB)' : 'PDF (MAX. 10MB)'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            id={`file-${type}`}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {/* Action Buttons */}
        {file && (
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {label}
                </>
              )}
            </Button>
            <Button onClick={handleCancel} disabled={uploading} variant="outline">
              Cancel
            </Button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {file ? 'File uploaded successfully!' : 'File deleted successfully!'}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
