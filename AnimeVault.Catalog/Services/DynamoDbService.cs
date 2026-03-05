using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using AnimeVault.Catalog.Models;

namespace AnimeVault.Catalog.Services;

public class DynamoDbService
{
    private readonly DynamoDBContext _context;

    public DynamoDbService(IAmazonDynamoDB client)
    {
        _context = new DynamoDBContextBuilder()
            .WithDynamoDBClient(() => client)
            .Build();
    }

    // Scans the entire AnimeVault table and returns all items.
    // For a small personal catalog this is fine — at scale
    // you would use queries with indexes instead.
    public async Task<List<Anime>> GetAllAsync()
    {
        var conditions = new List<ScanCondition>(); // empty = return everything
        return await _context.ScanAsync<Anime>(conditions).GetRemainingAsync();
    }

    public async Task CreateAsync(Anime anime)
    {
        await _context.SaveAsync(anime);
    }
}