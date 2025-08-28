using System.Text;

namespace LMS_CMS_PL.Services.FileValidations
{
    public class FileVideoValidationService : BaseFileValidationService
    {

        private readonly string[] _allowedExtensions = { ".mp4", ".avi", ".mkv", ".mov" };
        private readonly string[] _allowedMimeTypes = {
            "video/mp4", "video/x-msvideo", "video/x-matroska", "video/quicktime"
        };

        private readonly Dictionary<string, (byte[] signature, int offset)> _fileSignatures = new()
        {
            { ".mp4", (new byte[] { 0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70 }, 4) },
            { ".avi", (new byte[] { 0x52, 0x49, 0x46, 0x46 }, 0) },
            { ".mkv", (new byte[] { 0x1A, 0x45, 0xDF, 0xA3 }, 0) },
            { ".mov", (new byte[] { 0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70 }, 4) }
        };

        public async Task<string?> ValidateVideoFileAsync(IFormFile file)
        {
            return await ValidateWithTimeoutAsync(file, ValidateVideoInternalAsync);
        }


        private async Task<bool> ContainsMp4MoovAtom(Stream stream)
        {
            try
            {
                stream.Position = 0;
                var buffer = new byte[4096];
                await stream.ReadAsync(buffer, 0, buffer.Length);
                return Encoding.ASCII.GetString(buffer).Contains("moov");
            }
            catch
            {
                return false;
            }
        }

        public async Task<string?> ValidateVideoInternalAsync(IFormFile file, CancellationToken cancellationToken)
        {
            var basicCheck = await ValidateBasicChecksAsync(file, _allowedExtensions, _allowedMimeTypes);
            if (basicCheck != null) return basicCheck;

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();

            try
            {
                using var stream = file.OpenReadStream();
                var signatureInfo = _fileSignatures[extension];
                var headerSize = signatureInfo.signature.Length + signatureInfo.offset;
                var header = new byte[headerSize];

                var bytesRead = await stream.ReadAsync(header, 0, headerSize, cancellationToken);

                if (bytesRead < headerSize)
                    return "File is too small for signature validation.";

                if (IsExecutableContent(header))
                    return "File contains executable content";

                var actualSignature = header.Skip(signatureInfo.offset)
                                           .Take(signatureInfo.signature.Length)
                                           .ToArray();

                if (!actualSignature.SequenceEqual(signatureInfo.signature))
                    return $"File content doesn't match its extension. Expected {extension} video file.";

                stream.Position = 0;
                //if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
                //    return "File contains potentially dangerous content";

                // Video-specific validation
                if (extension == ".mp4" && !await ContainsMp4MoovAtom(stream))
                    return "The MP4 file appears to be incomplete or corrupted (missing moov atom).";

            }
            catch (Exception ex)
            {
                return $"Unable to verify video content: {ex.Message}";
            }

            return null;
        }
    }
}
