
using LMS_CMS_PL.Services.FileValidations;
using System.Text;
using System.Threading;

namespace LMS_CMS_PL.Services
{
    public class FileValidationService : BaseFileValidationService
    {
        private readonly string[] _allowedExtensions =
        {
            ".jpg", ".jpeg", ".png", ".gif", // Images
            ".pdf", ".doc", ".docx", ".txt", // Documents
            ".xls", ".xlsx", ".csv",         // Excel/CSV
            ".mp4", ".avi", ".mkv", ".mov"   // Video
        };

        private readonly string[] _allowedMimeTypes =
        {
            "image/jpeg", "image/png", "image/gif",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
            "video/mp4", "video/x-msvideo", "video/x-matroska", "video/quicktime"
        };

        private readonly Dictionary<string, List<byte[]>> _fileSignatures = new()
        {
            // Images
            { ".jpg", new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 } } },
            { ".jpeg", new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 } } },
            { ".png", new List<byte[]> { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
            { ".gif", new List<byte[]> { new byte[] { 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 }, new byte[] { 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 } } },

            // Documents
            { ".pdf", new List<byte[]> { new byte[] { 0x25, 0x50, 0x44, 0x46 } } },
            { ".doc", new List<byte[]> { new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } } },
            { ".docx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 } } },
            { ".txt", new List<byte[]> { new byte[] { } } }, // Text files can have any content

            // Excel
            { ".xls", new List<byte[]> { new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } } },
            { ".xlsx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 } } },
            { ".csv", new List<byte[]> { new byte[] { } } }, // CSV files can have any content

            // Videos
            { ".mp4", new List<byte[]> {
                new byte[] { 0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70 },
                new byte[] { 0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70 }
            } },
            { ".avi", new List<byte[]> { new byte[] { 0x52, 0x49, 0x46, 0x46 } } },
            { ".mkv", new List<byte[]> { new byte[] { 0x1A, 0x45, 0xDF, 0xA3 } } },
            { ".mov", new List<byte[]> { new byte[] { 0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70 } } }
        };

        public async Task<string?> ValidateFileWithTimeoutAsync(IFormFile file)
        {
            return await ValidateWithTimeoutAsync(file, ValidateFileInternalAsync);
        }

        private async Task<string?> ValidateFileInternalAsync(IFormFile file, CancellationToken cancellationToken)
        {
            // 1. Basic checks (from base class)
            //var basicCheck = await ValidateBasicChecksAsync(file, _allowedExtensions, _allowedMimeTypes);
            //if (basicCheck != null) return basicCheck;

            //var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            //var contentType = file.ContentType?.ToLowerInvariant();

            //// 2. File signature validation (magic number check)
            //try
            //{
            //    using var stream = file.OpenReadStream();

            //    // Read enough bytes for the longest signature (usually 8 bytes)
            //    var header = new byte[8];
            //    var bytesRead = await stream.ReadAsync(header, 0, 8, cancellationToken);

            //    if (bytesRead < 4)
            //        return "File is too small for signature validation.";

            //    // Check for executable content first
            //    if (IsExecutableContent(header))
            //        return "File contains executable content";

            //    // Validate file signature
            //    if (_fileSignatures.TryGetValue(extension, out var signatures) && signatures.Any())
            //    {
            //        if (!(signatures.Count == 1 && signatures[0].Length == 0)) // Not a text file
            //        {
            //            bool signatureValid = signatures.Any(signature =>
            //                header.Take(signature.Length).SequenceEqual(signature));

            //            if (!signatureValid)
            //                return $"File content doesn't match its extension. Expected {extension} file.";
            //        }
            //    }

            //    // Reset stream for content scanning
            //    stream.Position = 0;

            //    // Scan for dangerous patterns
            //    //if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
            //    //    return "File contains potentially dangerous content";
            //}
            //catch (Exception ex)
            //{
            //    return $"Unable to verify file content: {ex.Message}";
            //}

            return null; // Validation passed
        }
    }
}
