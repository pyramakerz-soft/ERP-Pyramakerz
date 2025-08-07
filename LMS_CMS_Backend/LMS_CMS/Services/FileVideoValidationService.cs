namespace LMS_CMS_PL.Services
{
    public class FileVideoValidationService
    {

        private readonly string[] _allowedVideoExtensions = { ".mp4", ".avi", ".mkv" };
        private readonly string[] _allowedVideoMimeTypes = { "video/mp4", "video/x-msvideo", "video/x-matroska" };

        public string? ValidateVideoFile(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName)?.ToLower();
            if (!_allowedVideoExtensions.Contains(extension))
            {
                return "Only video files (mp4, avi, mkv) are allowed.";
            }

            if (!_allowedVideoMimeTypes.Contains(file.ContentType))
            {
                return "Invalid video file type. Allowed types are: mp4, avi, mkv.";
            }

            return null;
        }
    }
}
