'use client';

import { useState, useCallback, useRef } from 'react';
import { useApi } from './useApi';

export type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface UseAvatarUploadOptions {
  maxSizeMB?: number;
  acceptedTypes?: string[];
  maxDimension?: number;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_DIMENSION = 2048;

export function useAvatarUpload({
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxDimension = DEFAULT_MAX_DIMENSION,
  onSuccess,
  onError,
}: UseAvatarUploadOptions = {}) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useApi();

  const validateFile = useCallback(
    async (file: File): Promise<ValidationResult> => {
      // Type validation
      if (!acceptedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid file type. Accepted: ${acceptedTypes.map((t) => t.replace('image/', '.')).join(', ')}`,
        };
      }

      // Size validation
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: `File too large. Max size: ${maxSizeMB}MB`,
        };
      }

      // Dimension validation
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          if (img.width > maxDimension || img.height > maxDimension) {
            resolve({
              valid: false,
              error: `Image too large. Max dimensions: ${maxDimension}x${maxDimension}px`,
            });
          } else {
            resolve({ valid: true });
          }
        };
        img.onerror = () => {
          resolve({ valid: false, error: 'Invalid image file' });
        };
        img.src = URL.createObjectURL(file);
      });
    },
    [acceptedTypes, maxSizeMB, maxDimension]
  );

  const generatePreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setUploadState('validating');
      setError(null);
      setProgress(0);

      const validation = await validateFile(file);
      if (!validation.valid) {
        setUploadState('error');
        setError(validation.error || 'Validation failed');
        onError?.(validation.error || 'Validation failed');
        return;
      }

      const previewUrl = generatePreview(file);
      setPreview(previewUrl);
      setUploadState('uploading');

      try {
        // Simulate progress (replace with actual upload progress if your API supports it)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const response = await upload('/users/avatar', file, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        clearInterval(progressInterval);
        setProgress(100);
        setUploadState('success');

        // Clean up preview after successful upload
        setTimeout(() => {
          setPreview(null);
          setProgress(0);
          setUploadState('idle');
        }, 1500);

        onSuccess?.(response.avatarUrl);
      } catch (err) {
        setUploadState('error');
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [validateFile, generatePreview, upload, onSuccess, onError]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileSelect(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setUploadState('idle');
    setPreview(null);
    setProgress(0);
  }, []);

  return {
    uploadState,
    progress,
    preview,
    error,
    fileInputRef,
    handleInputChange,
    triggerFileSelect,
    handleFileSelect,
    clearError,
  };
}