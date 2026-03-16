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

    public async Task CreateAsync(Anime anime)
    {
        await _context.SaveAsync(anime);
    }
}