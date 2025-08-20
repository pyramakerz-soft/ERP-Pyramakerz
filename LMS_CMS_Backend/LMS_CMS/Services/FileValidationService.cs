
using System.Text;
using System.Threading;

namespace LMS_CMS_PL.Services
{
    public class FileValidationService
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
      
        private readonly string[] _dangerousPatterns = {
            "<?php", "<?=", "<%", "%>",
            "<script", "javascript:", "vbscript:",
            "eval(", "exec(", "system(", "passthru(", "shell_exec(",
            "powershell", "cmd.exe", "/bin/bash", "/bin/sh",
            "union select", "drop table", "insert into", "select *",
            "document.cookie", "localStorage", "sessionStorage"
        };

        private readonly long _maxFileSize = 25 * 1024 * 1024;

        public async Task<string?> ValidateFileWithTimeoutAsync(IFormFile file)
        {
            try
            {
                // 5-second timeout
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                return await ValidateFileInternalAsync(file, cts.Token);
            }
            catch (OperationCanceledException)
            {
                return "File validation timed out";
            }
        }

        public async Task<string?> ValidateFileInternalAsync(IFormFile file, CancellationToken cancellationToken)
        { 
            // 1. Null and basic file checks
            if (file == null || file.Length == 0)
                return "No file provided or file is empty.";
             
            if (file.Length > _maxFileSize)
                return $"File size exceeds maximum allowed size of {_maxFileSize / (1024 * 1024)}MB.";

            // 2. File name security checks
            var fileName = Path.GetFileName(file.FileName);
            if (string.IsNullOrWhiteSpace(fileName))
                return "Invalid file name.";

            // Check for path traversal attempts
            if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
                return "Invalid file name - path traversal detected.";

            // Check for null byte injection
            if (fileName.Contains('\0') || fileName.Contains("%00"))
                return "Invalid file name - null byte injection detected.";

            // Check for potentially dangerous characters
            if (fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
                return "Invalid file name - contains illegal characters.";

            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(extension))
                return "File has no extension.";

            var contentType = file.ContentType?.ToLowerInvariant();

            // 3. Extension validation
            if (!_allowedExtensions.Contains(extension))
                return "Invalid file type. Only image, document, Excel, or video files are allowed.";

            // 4. MIME type validation
            if (string.IsNullOrEmpty(contentType) || !_allowedMimeTypes.Contains(contentType))
                return "Invalid file format. Allowed formats are: images, documents, Excel, and video files.";

            // 5. File signature validation (magic number check)
            try
            {
                using var stream = file.OpenReadStream();

                // Read enough bytes for the longest signature (usually 8 bytes)
                var header = new byte[8];
                var bytesRead = await stream.ReadAsync(header, 0, 8, cancellationToken);

                if (bytesRead < 4)
                    return "File is too small for signature validation.";

                // Check for executable content first
                if (IsExecutableContent(header))
                {
                    return "File contains executable content";
                }

                // Validate file signature
                if (_fileSignatures.TryGetValue(extension, out var signatures) && signatures.Any())
                {
                    if (signatures.Count == 1 && signatures[0].Length == 0)
                    {
                        // Skip signature validation but still scan content
                    }
                    else
                    {
                        bool signatureValid = signatures.Any(signature =>
                            header.Take(signature.Length).SequenceEqual(signature));

                        if (!signatureValid)
                            return $"File content doesn't match its extension. Expected {extension} file.";
                    }
                }

                // Reset stream for content scanning
                stream.Position = 0;

                // Scan for dangerous patterns
                if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
                {
                    return "File contains potentially dangerous content";
                }
            }
            catch (Exception ex)
            {
                return $"Unable to verify file content: {ex.Message}";
            }

            // 6. Additional security checks
            if (IsPotentialMaliciousFile(fileName, extension))
                return "File appears to be potentially malicious."; 


            return null; // Validation passed
        }

        private bool IsPotentialMaliciousFile(string fileName, string extension)
        {
            // Check for double extensions (e.g., "file.jpg.exe")
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
            if (Path.HasExtension(nameWithoutExtension))
                return true;

            // Check for executable extensions masquerading as other types
            var executableExtensions = new[] { ".exe", ".dll", ".bat", ".cmd", ".ps1", ".sh", ".js", ".vbs" };
            if (executableExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
                return true;

            return false;
        }

        private async Task<bool> ContainsDangerousContentAsync(Stream fileStream, string extension, CancellationToken cancellationToken)
        {
            if (fileStream.Length > 25 * 1024 * 1024)
            {
                return false;  
            }

            // For binary files (images, videos), don't scan entire content
            var binaryExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".avi", ".mkv", ".mov" };

            if (binaryExtensions.Contains(extension))
            {
                // For binary files, only scan first 1KB for embedded scripts
                return await ScanLimitedContentAsync(fileStream, 1024, cancellationToken);
            }
            else
            {
                // For text-based files, scan entire content
                return await ScanFullContentAsync(fileStream, cancellationToken);
            }
        }

        private async Task<bool> ScanLimitedContentAsync(Stream stream, int maxBytes, CancellationToken cancellationToken)
        {
            stream.Position = 0;
            var buffer = new byte[maxBytes];

            var bytesRead = await stream.ReadAsync(buffer, 0, maxBytes, cancellationToken);

            var content = Encoding.UTF8.GetString(buffer, 0, bytesRead);

            return _dangerousPatterns.Any(pattern =>
                content.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0);
        }

        private async Task<bool> ScanFullContentAsync(Stream stream, CancellationToken cancellationToken)
        {
            stream.Position = 0;
            using var reader = new StreamReader(stream);

            // This doesn't directly support CancellationToken, but we can check it periodically
            var content = await reader.ReadToEndAsync();

            // Check if cancellation was requested
            cancellationToken.ThrowIfCancellationRequested();

            return _dangerousPatterns.Any(pattern =>
                content.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0);
        }

        private bool IsExecutableContent(byte[] fileHeader)
        {
            // Check for executable file signatures
            var executableSignatures = new[]
            {
                new byte[] { 0x4D, 0x5A }, // MZ (EXE, DLL)
                new byte[] { 0x7F, 0x45, 0x4C, 0x46 }, // ELF (Linux binary)
                new byte[] { 0x23, 0x21 }, // Shebang (#!) for scripts
            };

            return executableSignatures.Any(signature =>
                fileHeader.Take(signature.Length).SequenceEqual(signature));
        }
    }
}
