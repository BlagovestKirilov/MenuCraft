/**
 * Extract a user-friendly error message from an Axios error.
 */
export function getErrorMessage(err) {
  if (err?.response?.data) {
    const d = err.response.data;
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    // Validation errors map
    if (typeof d === 'object') {
      const messages = Object.values(d).flat();
      if (messages.length) return messages.join('. ');
    }
  }
  return err?.message || 'An unexpected error occurred';
}

/**
 * Convert a File to a base64 string (without the data-URL prefix).
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mime>;base64,<data>" — strip the prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Trigger a file download from a Blob.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
