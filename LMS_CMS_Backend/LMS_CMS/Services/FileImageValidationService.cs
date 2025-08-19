
namespace LMS_CMS_PL.Services
{
    public class FileImageValidationService
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png" };
        private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png" };
        
        private readonly Dictionary<string, byte[][]> _fileSignatures = new()
        {
            {
                ".jpg", new byte[][]
                {
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },  // JFIF
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 },  // EXIF
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },  // Canon
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },  // Samsung
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }   // SPIFF
                }
            },
            {
                ".jpeg", new byte[][]
                {
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }
                }
            },
            {
                ".png", new byte[][]
                {
                    new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }  // Full PNG signature
                }
            }
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

                // Determine how many bytes to read based on file type
                int bytesToRead = extension == ".png" ? 8 : 4;
                var header = new byte[bytesToRead];

                // Read the header and reset stream position
                await stream.ReadAsync(header.AsMemory(0, bytesToRead));
                stream.Position = 0; // Reset stream position for future processing

                if (_fileSignatures.TryGetValue(extension, out var signatures))
                {
                    bool signatureValid = false;

                    foreach (var signature in signatures)
                    {
                        if (header.Take(signature.Length).SequenceEqual(signature))
                        {
                            signatureValid = true;
                            break;
                        }
                    }

                    if (!signatureValid)
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
