"use client"; // This component must be a client component

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { set } from "mongoose";
import { useRef, useState } from "react";

interface FileUploadProps {
  onSuccess: (response: any) => void;
  onProgress: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Invalid file type. Please upload a video.");
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit.");
    }
    return true;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if(!file || !validateFile(file)) {
      return;
    }

    setUploading(true);
    setError(null);

    try{
        const authres = await fetch("/api/auth/imagekit-auth");
        const auth = await authres.json();

        const res = await upload({
            file,
            fileName: file.name,
            publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
            signature: auth.signature,
            expire: auth.expire,
            token: auth.token,
            onProgress: (event) => {
                if(event.lengthComputable && onProgress) {
                    const percent = (event.loaded / event.total) * 100;
                    onProgress(Math.round(percent));
                }
            }
        })

        onSuccess(res);

    }catch (error){
        console.error("Upload failed:", error);
    }finally {
        setUploading(false);
    }
  }



  return (
    <>
      <input type="file" accept={fileType === "video" ? "video/*" : "image/*"} onChange={handleFileChange} />
      {uploading && (
        <span>Loading....</span>
      )}
      
    
    </>
  );
};

export default FileUpload;
