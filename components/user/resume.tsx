"use client";

import React, { useState, useRef } from "react";

interface ResumeUploaderProps {
  id: string;
  onFileSelect: (file: File | null) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  id,
  onFileSelect,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        id={`resume-${id}`}
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        style={{ display: "none" }}
      />

      {!fileName ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          className="px-4 py-2 text-sm font-medium text-white brand-gradient rounded-md hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Upload Resume
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">📄 {fileName}</span>
          <button
            onClick={handleRemove}
            type="button"
            className="px-2 py-1 text-xs font-medium text-white bg-destructive rounded hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
