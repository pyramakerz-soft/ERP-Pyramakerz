namespace LMS_CMS_PL.Services.FileValidations
{
    public class FileImageValidationService : BaseFileValidationService
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png" };
        private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png" };

        private readonly Dictionary<string, byte[][]> _fileSignatures = new()
        {
            {
                ".jpg", new byte[][]
                {
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 }, new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }
                }
            },
            {
                ".jpeg", new byte[][]
                {
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 }, new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE8 }
                }
            },
            {
                ".png", new byte[][]
                {
                    new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }
                }
            }
        };

        public async Task<string?> ValidateImageFileAsync(IFormFile file)
        {
            return await ValidateWithTimeoutAsync(file, ValidateImageInternalAsync);
        }

        public async Task<string?> ValidateImageInternalAsync(IFormFile file, CancellationToken cancellationToken)
        {
            var basicCheck = await ValidateBasicChecksAsync(file, _allowedExtensions, _allowedMimeTypes);
            if (basicCheck != null) return basicCheck;

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();

            try
            {
                using var stream = file.OpenReadStream();
                var headerSize = extension == ".png" ? 8 : 4;
                var header = new byte[headerSize];
                var bytesRead = await stream.ReadAsync(header, 0, headerSize, cancellationToken);

                if (bytesRead < headerSize)
                    return "File is too small for signature validation.";

                if (IsExecutableContent(header))
                    return "File contains executable content";

                //if (_fileSignatures.TryGetValue(extension, out var signatures))
                //{
                //    bool signatureValid = signatures.Any(signature =>
                //        header.Take(signature.Length).SequenceEqual(signature));

                //    if (!signatureValid)
                //        return $"File content doesn't match its extension. Expected {extension} file.";
                //}

                stream.Position = 0;
                //if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
                //    return "File contains potentially dangerous content";

            }
            catch (Exception ex)
            {
                return $"Unable to verify image content: {ex.Message}";
            }

            return null;
        }
    }
}
