// src/app/models/document.model.ts (Create this file or add to existing models)
import { ApplicationStatus } from './application.model'; // Assuming this enum is relevant for document statuses if any, or create a new one

export interface UserDocumentResponse {
  id: string;
  userId: string;
  documentType: string;
  fileName: string;
  contentType?: string;
  size?: number;
  uploadedAt: Date | string; // Backend will send string, map to Date
  presignedUrl?: string | null; // URL for downloading the file
}

// Interface for the metadata returned after a successful upload (matches backend DocumentMetadata)
export interface DocumentMetadata {
  id: string;
  userId: string;
  documentType: string;
  s3Key: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: Date | string;
}
