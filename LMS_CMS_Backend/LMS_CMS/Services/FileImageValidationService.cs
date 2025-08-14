
namespace LMS_CMS_PL.Services
{
    public class FileImageValidationService
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png" };
        private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png" };

        private readonly Dictionary<string, byte[]> _fileSignatures = new()
        {
            { ".jpg", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 } },  
            { ".jpeg", new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 } },  
            { ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47 } }   
        };

        public async Task<string?> ValidateImageFileAsync(IFormFile file)
        {
            if (file.FileName.Contains('\0') || file.FileName.Contains("%00"))
            {
                return "Invalid file name - potential security threat detected.";
            }

            var extension = Path.GetExtension(file.FileName)?.ToLower();
            
            if (string.IsNullOrEmpty(extension))
            {
                return "File has no extension.";
            }

            if (!_allowedExtensions.Contains(extension))
            {
                return "Only image files (jpg, jpeg, png) are allowed.";
            }

            if (!_allowedMimeTypes.Contains(file.ContentType))
            {
                return "Invalid image type. Allowed types are: jpg, jpeg, png.";
            }

            try
            {
                using var stream = file.OpenReadStream();
                var header = new byte[4]; // Read first 4 bytes for signature

                // Read the header (async for better performance)
                await stream.ReadAsync(header.AsMemory(0, 4));

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
