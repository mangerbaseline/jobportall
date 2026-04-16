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
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Upload Resume
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">📄 {fileName}</span>
          <button
            onClick={handleRemove}
            type="button"
            className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
