using System.Text;

namespace LMS_CMS_PL.Services.FileValidations
{
    public class FileWordPdfValidationService : BaseFileValidationService
    {
        private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx", ".txt" };
        private readonly string[] _allowedMimeTypes = {
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        };

        private readonly Dictionary<string, byte[]> _fileSignatures = new()
        {
            { ".pdf", new byte[] { 0x25, 0x50, 0x44, 0x46 } },
            { ".doc", new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } },
            { ".docx", new byte[] { 0x50, 0x4B, 0x03, 0x04 } }
        };

        public async Task<string?> ValidateDocumentFileAsync(IFormFile file)
        {
            return await ValidateWithTimeoutAsync(file, ValidateDocumentInternalAsync);
        }

        private async Task<string?> ValidateDocumentInternalAsync(IFormFile file, CancellationToken cancellationToken)
        {
            var basicCheck = await ValidateBasicChecksAsync(file, _allowedExtensions, _allowedMimeTypes);
            if (basicCheck != null) return basicCheck;

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();

            try
            {
                using var stream = file.OpenReadStream();

                if (extension == ".txt")
                {
                    // Text files - just scan content
                    stream.Position = 0;
                    if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
                        return "File contains potentially dangerous content";
                    return null;
                }

                var headerSize = _fileSignatures[extension].Length;
                var header = new byte[headerSize];
                var bytesRead = await stream.ReadAsync(header, 0, headerSize, cancellationToken);

                if (bytesRead < headerSize)
                    return "File is too small for signature validation.";

                if (IsExecutableContent(header))
                    return "File contains executable content";

                //if (_fileSignatures.TryGetValue(extension, out var signature))
                //{
                //    if (!header.Take(signature.Length).SequenceEqual(signature))
                //        return $"File content doesn't match its extension. Expected {extension} document.";
                //}

                stream.Position = 0;
                //if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
                //    return "File contains potentially dangerous content";

                // Document-specific validation
                if (extension == ".docx")
                {
                    if (!await IsValidDocx(stream))
                        return "The DOCX file appears to be incomplete or corrupted.";
                }
                else if (extension == ".pdf")
                {
                    if (!await HasValidPdfStructure(stream))
                        return "The PDF file appears to be incomplete or corrupted.";
                }

            }
            catch (Exception ex)
            {
                return $"Unable to verify document content: {ex.Message}";
            }

            return null;
        }

        private async Task<bool> IsValidDocx(Stream stream)
        {
            try
            {
                stream.Position = 0;
                using var zipArchive = new System.IO.Compression.ZipArchive(stream, System.IO.Compression.ZipArchiveMode.Read, true);
                return zipArchive.Entries.Any(e => e.FullName.StartsWith("word/"));
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> HasValidPdfStructure(Stream stream)
        {
            try
            {
                stream.Seek(-128, SeekOrigin.End);
                var buffer = new byte[128];
                await stream.ReadAsync(buffer, 0, buffer.Length);
                return Encoding.ASCII.GetString(buffer).Contains("%%EOF");
            }
            catch
            {
                return false;
            }
        }
    }
}
