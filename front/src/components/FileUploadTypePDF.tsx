import React from 'react';
import axios from "axios";
import { FaFilePdf } from 'react-icons/fa';
import { useChatSessionStore } from "@store/ChatSessionStore";

const FileUploadTypePDF: React.FC = () => {
  const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);
  const setIsAllDisabled = useChatSessionStore((state) => state.setIsAllDisabled);
  const baseUrl = useChatSessionStore.getState().baseUrl;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) {
      console.warn("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", event.target.files[0]);

    setIsAllDisabled(true);

    try {
      const response = await axios.post(`${baseUrl}/chat/pdf-to-text`, formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "pdf_pages_and_text.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error uploading and processing PDF file:", error);
      alert("An error occurred during PDF processing. Please try again.");
    } finally {
      setIsAllDisabled(false);
    }
  };

  return (
    <div className="fixed bottom-48 left-0 p-4" style={{ zIndex: 10000 }}>
      <div className="relative group flex flex-col items-center">
        <label className="cursor-pointer text-white-500 hover:text-blue-400 flex items-center">
          <FaFilePdf size={38} />
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={isAllDisabled}
          />
        </label>
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-700 
          rounded-lg shadow-lg transition-opacity opacity-0 group-hover:opacity-100 delay-0 
          whitespace-normal break-words max-w-xs text-center text-white">
          Upload PDF
        </div>
      </div>
    </div>
  );
};

export default FileUploadTypePDF;
