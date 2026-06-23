'use client';

import Image from 'next/image';
import { useAvatarUpload } from '@/app/hooks/useAvatarUpload';
import { cn } from '@/lib/utils'; // or your class merging utility

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onAvatarChange?: (url: string) => void;
  onAvatarRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16 text-sm',
  md: 'w-24 h-24 text-base',
  lg: 'w-32 h-32 text-lg',
};

export function AvatarUpload({
  currentAvatarUrl,
  userName = 'User',
  onAvatarChange,
  onAvatarRemove,
  size = 'lg',
}: AvatarUploadProps) {
  const {
    uploadState,
    progress,
    preview,
    error,
    fileInputRef,
    handleInputChange,
    triggerFileSelect,
    clearError,
  } = useAvatarUpload({
    onSuccess: onAvatarChange,
  });

  const isUploading = uploadState === 'uploading';
  const hasError = uploadState === 'error';
  const displayUrl = preview || currentAvatarUrl;
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div
          className={cn(
            'relative rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center transition-all',
            sizeClasses[size],
            isUploading && 'opacity-70',
            hasError && 'border-red-400 ring-2 ring-red-100'
          )}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={`${userName}'s avatar`}
              fill
              className="object-cover"
              sizes={`(max-width: 768px) 100vw, ${size === 'lg' ? '128px' : size === 'md' ? '96px' : '64px'}`}
            />
          ) : (
            <span className="font-semibold text-gray-500">{initials}</span>
          )}

          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
              <span className="text-sm font-medium">{progress}%</span>
              <div className="w-16 h-1 bg-white/30 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          {!isUploading && (
            <button
              onClick={triggerFileSelect}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 text-transparent hover:text-white rounded-full transition-all cursor-pointer"
              aria-label="Change avatar"
            >
              <span className="text-sm font-medium">Change</span>
            </button>
          )}
        </div>

        {/* Success Indicator */}
        {uploadState === 'success' && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white">
            ✓
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Upload avatar image"
        disabled={isUploading}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isUploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isUploading ? 'Uploading...' : displayUrl ? 'Change Avatar' : 'Upload Avatar'}
        </button>

        {currentAvatarUrl && !isUploading && (
          <button
            onClick={onAvatarRemove}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <span>⚠</span>
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        JPG, PNG, or WebP. Max 5MB. Max 2048x2048px.
      </p>
    </div>
  );
}