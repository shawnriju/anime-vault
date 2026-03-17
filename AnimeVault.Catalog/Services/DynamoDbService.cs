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

    // Queries the GSI directly — only returns items belonging to this user
    public async Task<List<Anime>> GetAllAsync(string userId)
    {
        return await _context
            .QueryAsync<Anime>(
                userId,
                new DynamoDBOperationConfig
                {
                    IndexName = "UserId-index"
                })
            .GetRemainingAsync();
    }

    // Loads a single item by ID and verifies it belongs to the requesting user
    public async Task<Anime?> GetByIdAsync(string id, string userId)
    {
        var anime = await _context.LoadAsync<Anime>(id);
        if (anime == null || anime.UserId != userId) return null;
        return anime;
    }

    public async Task CreateAsync(Anime anime)
    {
        await _context.SaveAsync(anime);
    }

    // Get the item first, verify ownership then delete it
    // Returns false if item doesn't exist or doesn't belong to this user
    public async Task<bool> DeleteAsync(string id, string userId)
    {
        var anime = await _context.LoadAsync<Anime>(id);

        if (anime == null)           return false;
        if (anime.UserId != userId)  return false;

        await _context.DeleteAsync<Anime>(id);
        return true;
    }

}