import { useRef, useState } from 'react';

/**
 * Drag-and-drop file upload zone.
 *
 * @param {Function} onFileSelect - (file: File) => void
 * @param {string} accept - e.g. ".pdf"
 * @param {string} label
 */
export default function FileUpload({ onFileSelect, accept = '*', label = 'Drop a file or click to browse' }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`file-upload-zone ${dragging ? 'active' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <p>{label}</p>
      {fileName && <p className="file-name">{fileName}</p>}
    </div>
  );
}
