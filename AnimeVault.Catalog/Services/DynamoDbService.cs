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

    public async Task<bool> UpdateAsync(string id,string userId, Anime updated)
    {
        var existing = await _context.LoadAsync<Anime>(id); 
        if(existing == null){
            throw new KeyNotFoundException($"Anime with ID:{id} not found");
        }
        if(existing.UserId != userId){
            throw new UnauthorizedAccessException($"You are not authorized to update this anime");
        }
        
        // Id, UserId, and CreatedAt are intentionally preserved
        existing.Title        = updated.Title;
        existing.Genre        = updated.Genre;
        existing.Description  = updated.Description;
        existing.ReleaseYear  = updated.ReleaseYear;
        existing.Status       = updated.Status;

        // Only update the cover image if a new one was provided
        if (!string.IsNullOrEmpty(updated.CoverImageUrl))
        {
            existing.CoverImageUrl = updated.CoverImageUrl;
        }

        await _context.SaveAsync(existing);
        return true;

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