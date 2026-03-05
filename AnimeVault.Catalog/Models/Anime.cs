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

    public string Title { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public string Status { get; set; } = "Unknown"; 
    public string CoverImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}