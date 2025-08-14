
namespace LMS_CMS_PL.Services
{
    public class FileVideoValidationService
    {

        private readonly string[] _allowedVideoExtensions = { ".mp4", ".avi", ".mkv" };
        private readonly string[] _allowedVideoMimeTypes = { "video/mp4", "video/x-msvideo", "video/x-matroska" };
        
        private readonly Dictionary<string, (byte[] signature, int offset)> _fileSignatures = new()
        {
            { ".mp4", (new byte[] { 0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70 }, 4) }, // MP4 with 'ftyp' at offset 4
            { ".avi", (new byte[] { 0x52, 0x49, 0x46, 0x46 }, 0) }, // 'RIFF' at start
            { ".mkv", (new byte[] { 0x1A, 0x45, 0xDF, 0xA3 }, 0) }  // Matroska start
        };

        private async Task<bool> ContainsMp4MoovAtom(Stream stream)
        {
            try
            {
                stream.Seek(0, SeekOrigin.Begin);
                var buffer = new byte[4096];
                await stream.ReadAsync(buffer.AsMemory(0, buffer.Length));

                // Look for 'moov' in the file (simplified check)
                return System.Text.Encoding.ASCII.GetString(buffer).Contains("moov");
            }
            catch
            {
                return false;
            }
        }

        public async Task<string?> ValidateVideoFileAsync(IFormFile file)
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

            if (!_allowedVideoExtensions.Contains(extension))
            {
                return "Only video files (mp4, avi, mkv) are allowed.";
            }

            if (!_allowedVideoMimeTypes.Contains(file.ContentType))
            {
                return "Invalid video file type. Allowed types are: mp4, avi, mkv.";
            }

            try
            {
                using var stream = file.OpenReadStream();
                var signatureInfo = _fileSignatures[extension];
                var header = new byte[signatureInfo.signature.Length + signatureInfo.offset];

                await stream.ReadAsync(header.AsMemory(0, header.Length));

                var actualSignature = header.Skip(signatureInfo.offset)
                                           .Take(signatureInfo.signature.Length)
                                           .ToArray();

                if (!actualSignature.SequenceEqual(signatureInfo.signature))
                {
                    return $"File content doesn't match its extension. Expected {extension} video file.";
                }

                // 5. Additional video-specific validation
                if (extension == ".mp4")
                {
                    // Verify MP4 has valid moov atom (may require full scan)
                    if (!await ContainsMp4MoovAtom(stream))
                    {
                        return "The MP4 file appears to be incomplete or corrupted (missing moov atom).";
                    }
                }
            }
            catch (Exception ex)
            {
                return $"Unable to verify video file content: {ex.Message}";
            }

            return null;
        }
    }
}
