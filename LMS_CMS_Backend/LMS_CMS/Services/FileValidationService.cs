
namespace LMS_CMS_PL.Services
{
    public class FileValidationService
    {
        private readonly string[] _allowedExtensions =
        {
            ".jpg", ".jpeg", ".png", // Images
            ".pdf", ".doc", ".docx", // Documents
            ".xls", ".xlsx",         // Excel
            ".mp4", ".avi", ".mkv"   // Video
        };

        private readonly string[] _allowedMimeTypes =
        {
            "image/jpeg", "image/png",                          // Images
            "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Documents
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel
            "video/mp4", "video/x-msvideo", "video/x-matroska"  // Video
        };

        private readonly Dictionary<string, byte[]> _fileSignatures = new()
        {
            // Images
            { ".jpg", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 } },
            { ".jpeg", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 } },
            { ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } },
    
            // Documents
            { ".pdf", new byte[] { 0x25, 0x50, 0x44, 0x46 } }, 
            { ".doc", new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } }, 
            { ".docx", new byte[] { 0x50, 0x4B, 0x03, 0x04 } },  
    
            // Excel
            { ".xls", new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } }, 
            { ".xlsx", new byte[] { 0x50, 0x4B, 0x03, 0x04 } },  
    
            // Videos
            { ".mp4", new byte[] { 0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70 } }, 
            { ".avi", new byte[] { 0x52, 0x49, 0x46, 0x46 } },  
            { ".mkv", new byte[] { 0x1A, 0x45, 0xDF, 0xA3 } }  
        };

        public async Task<string?> ValidateFileAsync(IFormFile file)
        {
            // 1. Null byte injection check
            if (file.FileName.Contains("\0") || file.FileName.Contains("%00"))
            {
                return "Invalid file name - null byte injection detected.";
            }

            var extension = Path.GetExtension(file.FileName)?.ToLower();
            if (string.IsNullOrEmpty(extension))
            {
                return "File has no extension.";
            }

            var contentType = file.ContentType;

            // 2. Extension validation
            if (!_allowedExtensions.Contains(extension))
            {
                return "Invalid file type. Only image, document, Excel, or video files are allowed.";
            }

            // 3. MIME type validation
            if (!_allowedMimeTypes.Contains(contentType))
            {
                return "Invalid file format. Allowed formats are: images (jpg, jpeg, png), documents (pdf, doc, docx), Excel (xls, xlsx), and video (mp4, avi, mkv).";
            }

            // 4. Content verification (check file signatures)
            try
            {
                using var stream = file.OpenReadStream();
                var header = new byte[4]; // Read first 4 bytes for signature
                await stream.ReadAsync(header, 0, 4);

                if (_fileSignatures.TryGetValue(extension, out var signature))
                {
                    if (!header.Take(signature.Length).SequenceEqual(signature))
                    {
                        return $"File content doesn't match its extension. Expected {extension} file.";
                    }
                }
            }
            catch
            {
                return "Unable to verify file content.";
            }


            return null;  
        }
    }
}
