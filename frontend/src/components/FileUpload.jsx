import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader } from 'lucide-react';
import { contractsAPI } from '../services/api';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await contractsAPI.uploadContract(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploading(false);
      setUploadProgress(0);

      // Show success toast
      toast({
        title: "Upload Successful!",
        description: `${file.name} has been uploaded and is being analyzed.`,
        duration: 5000,
      });

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);

      // Show error toast
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.detail || 'Upload failed. Please try again.',
        duration: 7000,
      });

      console.error('Upload error:', error);
    }
  }, [onUploadSuccess, toast]);

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
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-gray-200 p-12 text-center cursor-pointer transition-all duration-200",
          "bg-white shadow-stripe hover:shadow-stripe-lg rounded-2xl",
          "hover:border-stripe-indigo/50 hover:bg-stripe-indigo/[0.02]",
          isDragActive && "border-stripe-indigo bg-stripe-indigo/5 shadow-stripe-xl scale-[1.01]",
          uploading && "opacity-70 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-6">
          {uploading ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-stripe-indigo/20 rounded-full blur-xl"></div>
                <Loader className="w-14 h-14 text-stripe-indigo animate-spin relative" />
              </div>
              <div className="w-full max-w-xs space-y-3">
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-stripe-indigo to-stripe-purple h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-600">Uploading... {uploadProgress}%</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                {isDragActive ? (
                  <>
                    <div className="absolute inset-0 bg-stripe-indigo/20 rounded-2xl blur-xl animate-pulse"></div>
                    <div className="relative bg-stripe-indigo/10 p-5 rounded-2xl">
                      <FileText className="w-12 h-12 text-stripe-indigo" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-100 p-5 rounded-2xl transition-colors group-hover:bg-stripe-indigo/10">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">
                  {isDragActive ? 'Drop your file here' : 'Upload Your Contract'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag & drop or <span className="text-stripe-indigo font-medium">click to browse</span>
                </p>
                <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-400">
                  <span className="px-2.5 py-1 bg-gray-100 rounded-md font-medium">PDF</span>
                  <span className="px-2.5 py-1 bg-gray-100 rounded-md font-medium">DOCX</span>
                  <span className="text-gray-300">•</span>
                  <span>Max 50MB</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FileUpload;
