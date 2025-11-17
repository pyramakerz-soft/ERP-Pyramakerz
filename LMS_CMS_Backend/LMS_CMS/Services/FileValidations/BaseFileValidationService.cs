using System.Text;

namespace LMS_CMS_PL.Services.FileValidations
{
    public class BaseFileValidationService
    {
        protected readonly long _maxFileSize = 25 * 1024 * 1024;

        protected readonly string[] _dangerousPatterns = {
            "<?php", "<?=", "<%", "%>", 
            "<script", "javascript:", "vbscript:",
            "eval(", "exec(", "system(", "passthru(", "shell_exec(", "powershell",
            "cmd.exe", "/bin/bash", "/bin/sh", "union select", "drop table",
            "insert into", "select *", "document.cookie", "localStorage", "sessionStorage"
        };

        protected async Task<string?> ValidateBasicChecksAsync(IFormFile file, string[] allowedExtensions, string[] allowedMimeTypes)
        {
            if (file == null || file.Length == 0)
                return "No file provided or file is empty.";

            if (file.Length > _maxFileSize)
                return $"File size exceeds maximum allowed size of {_maxFileSize / (1024 * 1024)}MB.";

            var fileName = Path.GetFileName(file.FileName);
            if (string.IsNullOrWhiteSpace(fileName))
                return "Invalid file name.";

            if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
                return "Invalid file name - path traversal detected.";

            if (fileName.Contains('\0') || fileName.Contains("%00"))
                return "Invalid file name - null byte injection detected.";

            if (fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
                return "Invalid file name - contains illegal characters.";

            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(extension))
                return "File has no extension.";

            if (!allowedExtensions.Contains(extension))
                return $"Invalid file type. Only {string.Join(", ", allowedExtensions)} files are allowed.";

            var contentType = file.ContentType?.ToLowerInvariant();
            if (string.IsNullOrEmpty(contentType) || !allowedMimeTypes.Contains(contentType))
                return $"Invalid file format. Allowed formats are: {string.Join(", ", allowedMimeTypes)}";

            if (IsPotentialMaliciousFile(fileName, extension))
                return "The uploaded file may contain unsafe content.";

            return null;
        }

        protected bool IsPotentialMaliciousFile(string fileName, string extension)
        {
            // Check for double extensions (e.g., "file.jpg.exe")
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
            if (Path.HasExtension(nameWithoutExtension))
                return true;

            var executableExtensions = new[] { ".exe", ".dll", ".bat", ".cmd", ".ps1", ".sh", ".js", ".vbs" };
            return executableExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase); 
        }

        protected async Task<bool> ContainsDangerousContentAsync(Stream fileStream, string extension, CancellationToken cancellationToken)
        {
            if (fileStream.Length > 25 * 1024 * 1024) return false;

            var binaryExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".avi", ".mkv", ".mov" };

            if (binaryExtensions.Contains(extension))
                return await ScanLimitedContentAsync(fileStream, 1024, cancellationToken);
            else
                return await ScanFullContentAsync(fileStream, cancellationToken);
        }

        protected async Task<bool> ScanLimitedContentAsync(Stream stream, int maxBytes, CancellationToken cancellationToken)
        {
            stream.Position = 0;
            var buffer = new byte[maxBytes];
            var bytesRead = await stream.ReadAsync(buffer, 0, maxBytes, cancellationToken);
            var content = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            return _dangerousPatterns.Any(pattern => content.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0);
        }

        protected async Task<bool> ScanFullContentAsync(Stream stream, CancellationToken cancellationToken)
        {
            stream.Position = 0;
            using var reader = new StreamReader(stream);
            var content = await reader.ReadToEndAsync();
            cancellationToken.ThrowIfCancellationRequested();
            return _dangerousPatterns.Any(pattern => content.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0);
        }

        protected bool IsExecutableContent(byte[] fileHeader)
        {
            var executableSignatures = new[]
            {
            new byte[] { 0x4D, 0x5A }, // MZ (EXE, DLL)
            new byte[] { 0x7F, 0x45, 0x4C, 0x46 }, // ELF (Linux binary)
            new byte[] { 0x23, 0x21 }, // Shebang (#!)
        };
            return executableSignatures.Any(signature => fileHeader.Take(signature.Length).SequenceEqual(signature));
        }

        public async Task<string?> ValidateWithTimeoutAsync(IFormFile file, Func<IFormFile, CancellationToken, Task<string?>> validationFunc)
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                return await validationFunc(file, cts.Token);
            }
            catch (OperationCanceledException)
            {
                return "File validation timed out";
            }
        }
    }
}
