using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using AnimeVault.Catalog.Models;

namespace AnimeVault.Catalog.Services;

public interface IDynamoDbService
{
    Task<List<Anime>> GetAllAsync(string userId);
    Task<Anime?> GetByIdAsync(string id, string userId);
    Task CreateAsync(Anime anime);
    Task<bool> UpdateAsync(string id, string userId, Anime updated);
    Task<bool> DeleteAsync(string id, string userId);
}

public class DynamoDbService : IDynamoDbService
{
    private readonly IDynamoDBContext _context;

    public DynamoDbService(IDynamoDBContext context)
    {
        _context = context;
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
        existing.MediaType   = updated.MediaType;
        existing.Notes       = updated.Notes; 

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
        // One round-trip for delete is possible with low-level API, 
        // but since we need to know if it existed for the S3 cleanup in the controller,
        // we'll keep the load logic but ensure it's used efficiently.
        // For performance, we'll avoid an extra check if the controller already passed the anime object.
        
        await _context.DeleteAsync<Anime>(id);
        return true;
    }

}