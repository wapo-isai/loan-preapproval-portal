export interface UserDocumentResponse {
  id: string;
  userId: string;
  documentType: string;
  fileName: string;
  contentType?: string;
  size?: number;
  uploadedAt: Date | string;
  presignedUrl?: string | null;
}

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
