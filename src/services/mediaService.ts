import { apiClient } from './apiClient';
import { compressImage } from '../utils/fileUtils';

export interface AdminDocument {
  id: number;
  createdAt: string;
  updatedAt: string;
  documentType: string;
  documentUrl: string;
  version?: string;
  description?: string;
  isActive?: boolean;
}

export const getAdminDocuments = async () => {
  const { data } = await apiClient.get<AdminDocument[]>('/media/admin/documents');
  return data;
};

export default { getAdminDocuments };

export const uploadAspirantDocument = async (aspirantId: number, documentType: string, file: File) => {
  const toUpload =
    documentType === 'selfie'
      ? await compressImage(file, { maxBytes: 100 * 1024, maxDimension: 1024 })
      : file;
  const form = new FormData();
  form.append('documentType', documentType);
  form.append('file', toUpload, toUpload.name);
  // Let axios set the Content-Type (including boundary) for FormData automatically.
  const { data } = await apiClient.post(`/media/aspirant/${aspirantId}/document`, form);
  return data;
};

export const uploadProfilePicture = async (file: File) => {
  const compressed = await compressImage(file, { maxBytes: 100 * 1024, maxDimension: 1024 });
  const form = new FormData();
  form.append('file', compressed, compressed.name);
  const { data } = await apiClient.post('/media/profile-picture', form);
  return data;
};
