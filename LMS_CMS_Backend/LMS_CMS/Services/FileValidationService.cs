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

        public string? ValidateFile(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName)?.ToLower();
            var contentType = file.ContentType;
             
            if (!_allowedExtensions.Contains(extension))
            {
                return "Invalid file type. Only image, document, Excel, or video files are allowed.";
            }
             
            if (!_allowedMimeTypes.Contains(contentType))
            {
                return "Invalid file format. Allowed formats are: images (jpg, jpeg, png), documents (pdf, doc, docx), Excel (xls, xlsx), and video (mp4, avi, mkv).";
            }

            return null;  
        }
    }
}
