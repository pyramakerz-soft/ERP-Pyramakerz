using Amazon.S3.Model;
using Amazon.S3;
using Microsoft.AspNetCore.StaticFiles;
using Amazon.SecretsManager.Model;
using Amazon.SecretsManager;
using Newtonsoft.Json;
using Amazon;

namespace LMS_CMS_PL.Services
{
    public class S3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly IAmazonSecretsManager _secretsManager;
        private readonly string _bucketName;
        private readonly string _folder;
        private readonly string _region;

        public S3Service(IAmazonSecretsManager secretsManager)
        {
            _secretsManager = secretsManager;
        }

        public S3Service(IConfiguration config, string region)
        {
            _region = config[region] ?? "";
        }

        public S3Service(IAmazonS3 s3Client, IConfiguration config, string bucketName, string folder)
        {
            _s3Client = s3Client;
            _bucketName = config[bucketName] ?? throw new ArgumentNullException(bucketName);
            _folder = config[folder] ?? "";
        }

        public async Task<bool> UploadFileAsync(string path, string subDirectory, string domain)
        {
            try
            {
                if (File.Exists(path))
                {
                    using var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read);
                    return await UploadFile(fileStream, Path.GetFileName(path), subDirectory, domain);
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> UploadFileAsync(IFormFile file, string subDirectory, string domain)
        {
            try
            {
                if (file != null)
                {
                    //using var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read);
                    return await UploadFile(file, subDirectory, domain);
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> UploadFilesAsync(string path, string subDirectory, string domain)
        {
            try
            {
                if (Directory.Exists(path))
                {
                    var files = Directory.GetFiles(path, "*", SearchOption.AllDirectories);
                    foreach (var file in files)
                    {
                        var relativePath = Path.GetRelativePath(path, file).Replace("\\", "/");
                        using var fileStream = new FileStream(file, FileMode.Open, FileAccess.Read);
                        await UploadFile(fileStream, Path.GetFileName(file), subDirectory, domain);
                    }

                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<bool> UploadFile(FileStream fileStream, string filePath, string subDirectory, string domain)
        {
            if (fileStream == null || fileStream.Length == 0)
            {
            }

            var key = $"{_folder}/{domain}/{subDirectory}";

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = GetContentType(fileStream)
            };

            try
            {
                var response = await _s3Client.PutObjectAsync(request);

                return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (AmazonS3Exception s3Ex)
            {
                Console.Error.WriteLine($"S3 Error: {s3Ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Upload Error: {ex.Message}");
                return false;
            }
        }

        private async Task<bool> UploadFile(IFormFile file, string subDirectory, string domain)
        {
            if (file == null || file.Length == 0)
            {
                Console.Error.WriteLine("Upload Error: File is null or empty.");
                return false;
            }

            var key = $"{_folder}/{domain}/{subDirectory}/{file.FileName}".Replace("//", "/");

            // Save to a temporary file first
            var tempFilePath = Path.GetTempFileName();

            try
            {
                // Copy IFormFile to disk
                await using (var tempFileStream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(tempFileStream);
                }

                // Now use FileStream for S3 upload
                await using var stream = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read);

                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = GetContentType(stream)
                };

                var response = await _s3Client.PutObjectAsync(request);
                return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (AmazonS3Exception s3Ex)
            {
                Console.Error.WriteLine($"S3 Error: {s3Ex.ErrorCode} - {s3Ex.Message}");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Upload Error: {ex.Message}");
            }
            finally
            {
                // Clean up the temp file
                if (File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath);
                }
            }

            return false;
        }
         
        public string GetFileUrl(string key, IConfiguration config)
        {
            key = key.TrimStart('/');
            var region = config["AWS:Region"] ?? "us-east-1";

            return $"https://{_bucketName}.s3.{region}.amazonaws.com/{key}";
        }

        public async Task<bool> DeleteFileAsync(string subDirectory, string domain, string fileName)
        {
            var key = $"{_folder}/{domain}/{subDirectory}/{fileName}".Replace("//", "/");

            try
            {
                var request = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                var response = await _s3Client.DeleteObjectAsync(request);

                // S3 usually returns NoContent (204) for successful delete
                return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
            }
            catch (AmazonS3Exception s3Ex)
            {
                Console.Error.WriteLine($"S3 Delete Error: {s3Ex.ErrorCode} - {s3Ex.Message}");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Delete Error: {ex.Message}");
            }

            return false;
        }


        public async Task<bool> CreateOrUpdateSecretAsync(string secretName, string secretValue)
        {
            try
            {
                UpdateSecretRequest updateRequest = new UpdateSecretRequest
                {
                    SecretId = secretName,
                    SecretString = secretValue,
                };

                UpdateSecretResponse updateResponse = await _secretsManager.UpdateSecretAsync(updateRequest);
                return !string.IsNullOrEmpty(updateResponse.ARN);
            }
            catch (ResourceNotFoundException)
            {
                CreateSecretRequest createRequest = new CreateSecretRequest
                {
                    Name = secretName,
                    SecretString = secretValue,
                };

                CreateSecretResponse createResponse = await _secretsManager.CreateSecretAsync(createRequest);
                return !string.IsNullOrEmpty(createResponse.ARN);
            }
            catch (Amazon.SecretsManager.Model.InvalidRequestException)
            {
                CreateSecretRequest createRequest = new CreateSecretRequest
                {
                    Name = secretName,
                    SecretString = secretValue,
                };

                CreateSecretResponse createResponse = await _secretsManager.CreateSecretAsync(createRequest);
                return !string.IsNullOrEmpty(createResponse.ARN);
            }
            catch (Exception ex)
            {
                // Wrap the exception to provide context.
                throw new Exception($"Error creating or updating secret {secretName}: {ex.Message}", ex);
            }
        }

        public async Task<string> GetSecret(string secretName)
        {
            IAmazonSecretsManager client = new AmazonSecretsManagerClient(RegionEndpoint.GetBySystemName(_region));

            GetSecretValueRequest request = new GetSecretValueRequest
            {
                SecretId = secretName,
                VersionStage = "AWSCURRENT",
            };

            GetSecretValueResponse response;

            try
            {
                response = await client.GetSecretValueAsync(request);
            }
            catch (Exception e)
            {
                throw e;
            }

            return response.SecretString;
        }

        private string GetContentType(FileStream fileStream)
        {
            var provider = new FileExtensionContentTypeProvider();

            provider.Mappings[".pem"] = "application/x-pem-file";
            provider.Mappings[".csr"] = "application/pkcs10";
            provider.Mappings[".xml"] = "application/xml";
            provider.Mappings[".json"] = "application/json";

            if (!provider.TryGetContentType(fileStream.Name, out string contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }
         
        public async Task<bool> CopyFileAsync(string sourceKey, string destinationKey, string domainPath)
        {
            try
            {
                var fullSourceKey = $"{_folder}/{domainPath}/{sourceKey}".Replace("//", "/");
                var fullDestinationKey = $"{_folder}/{domainPath}/{destinationKey}".Replace("//", "/");
                 
                var copyRequest = new CopyObjectRequest
                {
                    SourceBucket = _bucketName,
                    DestinationBucket = _bucketName,
                    SourceKey = fullSourceKey,
                    DestinationKey = fullDestinationKey
                };

                await _s3Client.CopyObjectAsync(copyRequest);
                return true;
            }
            catch (AmazonS3Exception ex)
            {
                Console.WriteLine($"AWS Error: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General Error: {ex.Message}");
                return false;
            }
        }

    }
}
