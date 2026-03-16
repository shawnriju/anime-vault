using Amazon.DynamoDBv2.DataModel;

namespace AnimeVault.Catalog.Models;


public enum AnimeStatus
{
    Unknown,
    Ongoing,
    Completed,
    Hiatus,     
    Cancelled,
    Upcoming     
}

[DynamoDBTable("AnimeVault")]
public class Anime
{
    [DynamoDBHashKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    // Marks this as the GSI partition key — enables querying by user
    [DynamoDBGlobalSecondaryIndexHashKey("UserId-index")]
    public string UserId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public string Status { get; set; } = "Unknown"; 
    public string CoverImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}