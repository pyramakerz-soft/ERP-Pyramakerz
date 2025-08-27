namespace LMS_CMS_PL.Services.FileValidations
{
    public class FileExcelValidationService : BaseFileValidationService
    {
        private readonly string[] _allowedExtensions = { ".xls", ".xlsx", ".csv" };
        private readonly string[] _allowedMimeTypes = {
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv"
        };

        private readonly Dictionary<string, byte[]> _fileSignatures = new()
        {
            { ".xls", new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } },
            { ".xlsx", new byte[] { 0x50, 0x4B, 0x03, 0x04 } }
        };

        public async Task<string?> ValidateExcelFileAsync(IFormFile file)
        {
            return await ValidateWithTimeoutAsync(file, ValidateExcelInternalAsync);
        }

        public async Task<string?> ValidateExcelInternalAsync(IFormFile file, CancellationToken cancellationToken)
        {
            var basicCheck = await ValidateBasicChecksAsync(file, _allowedExtensions, _allowedMimeTypes);
            if (basicCheck != null) return basicCheck;

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();

            try
            {
                using var stream = file.OpenReadStream();

                if (extension == ".csv")
                {
                    // CSV files don't have signatures, just scan content
                    stream.Position = 0;
                    if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
                        return "File contains potentially dangerous content";
                    return null;
                }

                var headerSize = extension == ".xlsx" ? 4 : 8;
                var header = new byte[headerSize];
                var bytesRead = await stream.ReadAsync(header, 0, headerSize, cancellationToken);

                if (bytesRead < headerSize)
                    return "File is too small for signature validation.";

                if (IsExecutableContent(header))
                    return "File contains executable content";

                if (_fileSignatures.TryGetValue(extension, out var signature))
                {
                    if (!header.Take(signature.Length).SequenceEqual(signature))
                        return $"File content doesn't match its extension. Expected {extension} file.";
                }

                stream.Position = 0;
                //if (await ContainsDangerousContentAsync(stream, extension, cancellationToken))
                //    return "File contains potentially dangerous content";

                // Excel-specific validation
                if (extension == ".xlsx")
                {
                    try
                    {
                        using var zipArchive = new System.IO.Compression.ZipArchive(stream, System.IO.Compression.ZipArchiveMode.Read, true);
                        if (!zipArchive.Entries.Any(e => e.FullName.StartsWith("xl/")))
                            return "The XLSX file appears to be missing required Excel components.";
                    }
                    catch
                    {
                        return "The file is not a valid XLSX format (invalid ZIP structure).";
                    }
                }

            }
            catch (Exception ex)
            {
                return $"Unable to verify Excel content: {ex.Message}";
            }

            return null;
        }
    }
}
