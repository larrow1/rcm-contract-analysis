import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { contractsAPI } from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadStatus(null);
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const response = await contractsAPI.uploadContract(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadStatus('success');
      setUploading(false);

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setUploadProgress(0);
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setUploading(false);
      setErrorMessage(error.response?.data?.detail || 'Upload failed. Please try again.');
      console.error('Upload error:', error);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader className="w-16 h-16 text-blue-500 animate-spin" />
              <div className="w-full max-w-xs">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
              </div>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500" />
              <div>
                <p className="text-lg font-semibold text-green-700">Upload Successful!</p>
                <p className="text-sm text-gray-600 mt-1">Your contract is being analyzed...</p>
              </div>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="w-16 h-16 text-red-500" />
              <div>
                <p className="text-lg font-semibold text-red-700">Upload Failed</p>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
            </>
          ) : (
            <>
              {isDragActive ? (
                <FileText className="w-16 h-16 text-blue-500" />
              ) : (
                <Upload className="w-16 h-16 text-gray-400" />
              )}
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  {isDragActive ? 'Drop your file here' : 'Upload RCM Contract'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Drag & drop or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF and DOCX files (max 50MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
