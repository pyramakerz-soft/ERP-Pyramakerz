using Amazon.S3.Model;
using Amazon.S3;
using Microsoft.AspNetCore.StaticFiles;
using Amazon.SecretsManager.Model;
using Amazon.SecretsManager;
using Newtonsoft.Json;
using Amazon;

namespace LMS_CMS_PL.Services.Zatca
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

        public async Task<bool> UploadAsync(string path, string subDirectory, string domain)
        {
            try
            {
                if (File.Exists(path))
                {
                    using var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read);
                    return await UploadFileAsync(fileStream, Path.GetFileName(path), subDirectory, domain);
                }
                else if (Directory.Exists(path))
                {
                    var files = Directory.GetFiles(path, "*", SearchOption.AllDirectories);
                    foreach (var file in files)
                    {
                        var relativePath = Path.GetRelativePath(path, file).Replace("\\", "/");
                        using var fileStream = new FileStream(file, FileMode.Open, FileAccess.Read);
                        await UploadFileAsync(fileStream, relativePath, subDirectory, domain);
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

        private async Task<bool> UploadFileAsync(FileStream fileStream, string fileName, string subDirectory, string domain)
        {
            var key = $"{domain}/{_folder}{subDirectory}{fileName}";

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

        public async Task<bool> MigrateKeyAsync(string objectKey, string secretName, string? subDirectory = null)
        {
            // Step 1: Read the key from S3
            var getObjectResponse = await _s3Client.GetObjectAsync(_bucketName, $"{_folder}{objectKey}");
            using var reader = new StreamReader(getObjectResponse.ResponseStream);
            var jsonContent = await reader.ReadToEndAsync();
            var pcsid = JsonConvert.DeserializeObject<dynamic>(jsonContent);

            try
            {
                // Step 2: Create or update secret in Secrets Manager
                var putSecretRequest = new CreateSecretRequest
                {
                    Name = secretName,
                    SecretString = pcsid.secret
                };

                await _secretsManager.CreateSecretAsync(putSecretRequest);

                return true;
            }
            catch (ResourceExistsException)
            {
                // Secret already exists: update it
                var updateRequest = new UpdateSecretRequest
                {
                    SecretId = secretName,
                    SecretString = pcsid.secret
                };

                await _secretsManager.UpdateSecretAsync(updateRequest);

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<string> ReadS3ObjectAsync(string bucket, string key)
        {
            var response = await _s3Client.GetObjectAsync(bucket, key);
            using var reader = new StreamReader(response.ResponseStream);
            return await reader.ReadToEndAsync();
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
    }
}
