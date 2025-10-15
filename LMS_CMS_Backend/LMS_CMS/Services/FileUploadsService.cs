using Amazon;
using Amazon.S3;
using Microsoft.AspNetCore.Http;

namespace LMS_CMS_PL.Services
{
    public class FileUploadsService
    {
        private readonly IConfiguration _configuration;
        private readonly DomainService _domainService;

        public FileUploadsService(IConfiguration configuration, DomainService domainService)
        {
            _configuration = configuration;
            _domainService = domainService;
        }
         
        public string GetFileUrl(string? filePath, HttpRequest request, HttpContext httpContext)
        {
            if (string.IsNullOrEmpty(filePath))
                return string.Empty;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                var domain = _domainService.GetDomain(httpContext);
                string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();
                string fullPath = $"{_configuration["AWS:Folder"]}{domain}/{subDomain}/{filePath}";

                AmazonS3Client s3Client = new AmazonS3Client();
                S3Service s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");
                return s3Service.GetFileUrl(fullPath, _configuration);
            }
            else
            {
                string serverUrl = $"{request.Scheme}://{request.Host}/";
                return $"{serverUrl}{filePath.Replace("\\", "/")}";
            }
        }

        public async Task<string> UploadFileAsync(IFormFile file, string basePath, long entityId, HttpContext httpContext)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                var domain = _domainService.GetDomain(httpContext);
                string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();
                string fullPath = $"{basePath}/{entityId}";

                AmazonS3Client s3Client = new AmazonS3Client();
                S3Service s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");

                bool uploaded = await s3Service.UploadFileAsync(file, fullPath, $"{domain}/{subDomain}");
                if (uploaded)
                {
                    return $"{fullPath}/{file.FileName}";
                }

                return string.Empty;
            }
            else
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", basePath);
                var entityFolder = Path.Combine(baseFolder, entityId.ToString());

                if (!Directory.Exists(entityFolder))
                {
                    Directory.CreateDirectory(entityFolder);
                }

                var filePath = Path.Combine(entityFolder, file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Path.Combine("Uploads", basePath, entityId.ToString(), file.FileName);
            }
        }

        public async Task<string> ReplaceFileAsync(IFormFile? newFile, string? oldFilePath, string basePath, long entityId, HttpContext httpContext)
        {
            if (newFile == null)
                return oldFilePath ?? string.Empty;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                var domain = _domainService.GetDomain(httpContext);
                string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();

                var s3Client = new AmazonS3Client();
                var s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");

                // Delete old file if exists
                if (!string.IsNullOrEmpty(oldFilePath))
                {
                    await s3Service.DeleteFileAsync($"{basePath}/{entityId}", $"{domain}/{subDomain}", Path.GetFileName(oldFilePath));
                }

                // Upload new one
                bool uploaded = await s3Service.UploadFileAsync(newFile, $"{basePath}/{entityId}", $"{domain}/{subDomain}");
                if (uploaded)
                {
                    return $"{basePath}/{entityId}/{newFile.FileName}";
                    //return $"{_configuration["AWS:Folder"]}{domain}/{subDomain}/{basePath}/{entityId}/{newFile.FileName}";
                }

                return oldFilePath ?? string.Empty;
            }
            else
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", basePath);
                var entityFolder = Path.Combine(baseFolder, entityId.ToString());

                // Clean old folder
                if (Directory.Exists(entityFolder))
                {
                    Directory.Delete(entityFolder, true);
                }

                Directory.CreateDirectory(entityFolder);

                // Save new file
                var filePath = Path.Combine(entityFolder, newFile.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await newFile.CopyToAsync(stream);
                }

                return Path.Combine("Uploads", basePath, entityId.ToString(), newFile.FileName);
            }
        }

        public async Task<string> CopyFileAsync(string sourceFilePath, string basePath, long entityId, HttpContext httpContext)
        {
            if (string.IsNullOrEmpty(sourceFilePath))
                return string.Empty;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                var domain = _domainService.GetDomain(httpContext);
                string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();

                var s3Client = new AmazonS3Client(
                    _configuration["AWS:AccessKey"],
                    _configuration["AWS:SecretKey"],
                    RegionEndpoint.GetBySystemName(_configuration["AWS:Region"])
                );

                var s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");

                string fileName = Path.GetFileName(sourceFilePath);
                string destinationKey = $"{basePath}/{entityId}/{fileName}";
                string sourceKey = sourceFilePath.Replace("\\", "/");

                // Build and normalize paths
                string domainPath = $"{domain}/{subDomain}".Trim('/');
                string folderPrefix = $"{_configuration["AWS:Folder"].TrimEnd('/')}/{domainPath}/";

                // If sourceKey starts with full folder + domain, trim it to make it relative
                if (sourceKey.StartsWith(folderPrefix))
                {
                    sourceKey = sourceKey.Substring(folderPrefix.Length);
                }

                Console.WriteLine($"[S3 Copy] SourceKey (relative): {sourceKey}");
                Console.WriteLine($"[S3 Copy] DestinationKey: {destinationKey}");
                Console.WriteLine($"[S3 Copy] DomainPath: {domainPath}");

                bool copied = await s3Service.CopyFileAsync(sourceKey, destinationKey, domainPath);

                if (copied)
                    return destinationKey;

                return string.Empty;
            }
            else
            {
                // Local file copy (non-production)
                var normalizedSource = sourceFilePath.Replace('\\', Path.DirectorySeparatorChar);
                var originalFilePath = Path.Combine(Directory.GetCurrentDirectory(), normalizedSource);

                if (!System.IO.File.Exists(originalFilePath))
                    throw new FileNotFoundException("File not found.", originalFilePath);

                var destinationFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", basePath, entityId.ToString());

                if (!Directory.Exists(destinationFolder))
                    Directory.CreateDirectory(destinationFolder);

                var fileName = Path.GetFileName(sourceFilePath);
                var destinationFilePath = Path.Combine(destinationFolder, fileName);

                System.IO.File.Copy(originalFilePath, destinationFilePath, overwrite: true);

                return Path.Combine("Uploads", basePath, entityId.ToString(), fileName);
            }
        }

        //public async Task<string> CopyFileAsync(string sourceFilePath, string basePath, long entityId, HttpContext httpContext)
        //{
        //    if (string.IsNullOrEmpty(sourceFilePath))
        //        return string.Empty;

        //    bool isProduction = _configuration.GetValue<bool>("IsProduction");

        //    if (isProduction)
        //    { 
        //        var domain = _domainService.GetDomain(httpContext);
        //        string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();

        //        //var s3Client = new AmazonS3Client();
        //        var s3Client = new AmazonS3Client(
        //           _configuration["AWS:AccessKey"],
        //           _configuration["AWS:SecretKey"],
        //           RegionEndpoint.GetBySystemName(_configuration["AWS:Region"])
        //        );
        //        var s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");

        //        string fileName = Path.GetFileName(sourceFilePath);
        //        string destinationKey = $"{basePath}/{entityId}/{fileName}";
        //        string sourceKey = sourceFilePath.Replace("\\", "/");

        //        bool copied = await s3Service.CopyFileAsync(sourceKey, destinationKey, $"{domain}/{subDomain}");

        //        if (copied)
        //        {
        //            return destinationKey;
        //        }

        //        return string.Empty;
        //    }
        //    else
        //    { 
        //        var normalizedSource = sourceFilePath.Replace('\\', Path.DirectorySeparatorChar);
        //        var originalFilePath = Path.Combine(Directory.GetCurrentDirectory(), normalizedSource);

        //        if (!System.IO.File.Exists(originalFilePath))
        //            throw new FileNotFoundException("File not found.", originalFilePath);

        //        var destinationFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", basePath, entityId.ToString());

        //        if (!Directory.Exists(destinationFolder))
        //            Directory.CreateDirectory(destinationFolder);

        //        var fileName = Path.GetFileName(sourceFilePath);
        //        var destinationFilePath = Path.Combine(destinationFolder, fileName);

        //        System.IO.File.Copy(originalFilePath, destinationFilePath, overwrite: true);

        //        return Path.Combine("Uploads", basePath, entityId.ToString(), fileName);
        //    }
        //}

        public async Task<bool> DeleteFileAsync(string? filePath, string basePath, long entityId, HttpContext httpContext)
        {
            if (string.IsNullOrEmpty(filePath))
                return false;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            try
            {
                if (isProduction)
                {
                    var domain = _domainService.GetDomain(httpContext);
                    string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();

                    var s3Client = new AmazonS3Client();
                    var s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");

                    string fileName = Path.GetFileName(filePath);
                    bool deleted = await s3Service.DeleteFileAsync($"{basePath}/{entityId}", $"{domain}/{subDomain}", fileName);

                    return deleted;
                }
                else
                {
                    var normalizedPath = filePath.Replace('\\', Path.DirectorySeparatorChar);
                    var fullFilePath = Path.Combine(Directory.GetCurrentDirectory(), normalizedPath);

                    if (System.IO.File.Exists(fullFilePath))
                    {
                        System.IO.File.Delete(fullFilePath);
                    }

                    var folderPath = Path.GetDirectoryName(fullFilePath);
                    if (!string.IsNullOrEmpty(folderPath) && Directory.Exists(folderPath))
                    {
                        if (!Directory.EnumerateFileSystemEntries(folderPath).Any())
                        {
                            Directory.Delete(folderPath);
                        }
                    }

                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting file: {ex.Message}");
                return false;
            }
        }
    }
}
