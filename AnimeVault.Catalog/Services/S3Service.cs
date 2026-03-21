using Amazon.S3;
using Amazon.S3.Transfer;

namespace AnimeVault.Catalog.Services;

public interface IS3Service
{
    Task<string> UploadCoverAsync(Stream fileStream, string contentType);
    Task DeleteCoverAsync(string coverImageUrl);
}


public class S3Service : IS3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _region;

    public S3Service(IAmazonS3 s3Client, IConfiguration config)
    {
        _s3Client   = s3Client;
        _bucketName = config["S3:BucketName"]!;
        _region     = config["AWS:Region"]!;
    }

    public async Task<string> UploadCoverAsync(Stream fileStream, string contentType)
    {
        // Generate a unique key so uploads never overwrite each other
        var extension = contentType.Split('/').Last();
        var key       = $"covers/{Guid.NewGuid()}.{extension}";

        var transferUtility = new TransferUtility(_s3Client);

        await transferUtility.UploadAsync(new TransferUtilityUploadRequest
        {
            InputStream  = fileStream,
            BucketName   = _bucketName,
            Key          = key,
            ContentType  = contentType,
        });

        // Return the public URL — this gets stored in DynamoDB
        return $"https://{_bucketName}.s3.{_region}.amazonaws.com/{key}";
    }

    public async Task DeleteCoverAsync(string coverImageUrl)
    {
        if (string.IsNullOrEmpty(coverImageUrl)) return;

        // Extract the S3 key from the full URL
        var uri      = new Uri(coverImageUrl);
        var coverKey = uri.AbsolutePath.TrimStart('/');

        // Derive the thumbnail key 
        var thumbnailKey = coverKey.Replace("covers/", "thumbnails/");

        // Delete original cover
        await _s3Client.DeleteObjectAsync(_bucketName, coverKey);

        // Delete thumbnail — may not exist for older entries, so we catch any error
        try
        {
            await _s3Client.DeleteObjectAsync(_bucketName, thumbnailKey);
        }
        catch
        {
            // Thumbnail didn't exist — not a problem, continue
        }
    }

}