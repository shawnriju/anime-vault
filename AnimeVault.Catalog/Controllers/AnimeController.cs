using Microsoft.AspNetCore.Mvc;
using AnimeVault.Catalog.Data;
using AnimeVault.Catalog.Models;
using AnimeVault.Catalog.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AnimeVault.Catalog.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly DynamoDbService _dynamo;
    private readonly S3Service       _s3;

    public AnimeController(DynamoDbService dynamo, S3Service s3)
    {
        _dynamo = dynamo;
        _s3     = s3;
    }

    private string GetUserId()
    {
        var userId = User.Identity?.Name;
        
        if (!string.IsNullOrEmpty(userId))
        {
            return userId;
        }
        
        // Fallback: try multiple claim types
        userId = User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("cognito:username")
            ?? User.FindFirstValue("username");
        
        if (userId == null)
        {
            // Log all available claims for debugging
            var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}");
            throw new UnauthorizedAccessException(
                $"No user ID claim found. Available claims: {string.Join(", ", claims)}"
            );
        }
        
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var animes = await _dynamo.GetAllAsync(userId);
        return Ok(animes);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] AnimeFormRequest request)
    {
        var userId = GetUserId();

        var anime = new Anime
        {
            UserId      = userId,
            Title       = request.Title,
            MediaType   = request.MediaType,
            Status      = request.Status,
            Genre       = request.Genre       ?? string.Empty,
            Description = request.Description ?? string.Empty,
            Notes       = request.Notes       ?? string.Empty,
            ReleaseYear = request.ReleaseYear ?? 0,
        };

        // Upload cover image to S3 if one was provided
        if (request.CoverImage is { Length: > 0 })
        {
            await using var stream = request.CoverImage.OpenReadStream();
            anime.CoverImageUrl = await _s3.UploadCoverAsync(
                stream,
                request.CoverImage.ContentType
            );
        }

        await _dynamo.CreateAsync(anime);
        return CreatedAtAction(nameof(GetAll), new { id = anime.Id }, anime);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromForm] AnimeFormRequest request)
    {
        var userId = GetUserId();

        // Load existing item to get the current cover URL before updating
        var existing = await _dynamo.GetByIdAsync(id, userId);
        if (existing == null) return NotFound();

        // First upload the new image
        string newImageUrl = null;
        if (request.CoverImage is { Length: > 0 })
        {
            await using var stream = request.CoverImage.OpenReadStream();
            try
            {
                newImageUrl = await _s3.UploadCoverAsync(stream, request.CoverImage.ContentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Failed to upload image");
            }
        }

        // Update the entity with the new URL
        var updated = new Anime
        {
            Title       = request.Title,
            MediaType   = request.MediaType,
            Status      = request.Status,
            Genre       = request.Genre       ?? string.Empty,
            Description = request.Description ?? string.Empty,
            Notes       = request.Notes       ?? string.Empty,
            ReleaseYear = request.ReleaseYear ?? 0,
            CoverImageUrl = newImageUrl ?? existing.CoverImageUrl // Keep old if upload failed
        };

        // Update database
        var success = await _dynamo.UpdateAsync(id, userId, updated);
        if (!success) 
        {
            if (newImageUrl != null)
            {
                try
                {
                    await _s3.DeleteCoverAsync(newImageUrl);
                    //_logger.LogInformation("Cleaned up orphaned image {Url} after failed database update", newImageUrl);
                }
                catch (Exception ex)
                {
                    //_logger.LogError(ex, "Failed to delete orphaned image {Url}", newImageUrl);
                    // Don't throw - we already have a failure to report
                }
            }
            return NotFound();
        }

        //Database update succeeded - NOW we can safely delete the old image
        if (newImageUrl != null && !string.IsNullOrEmpty(existing.CoverImageUrl))
        {
            try
            {
                await _s3.DeleteCoverAsync(existing.CoverImageUrl);
                //_logger.LogInformation("Successfully deleted old image {Url}", existing.CoverImageUrl);
            }
            catch (Exception ex)
            {
                // Log but don't fail the request - database is already updated
                //_logger.LogWarning(ex, "Failed to delete old cover image {Url}, but database update succeeded", existing.CoverImageUrl);
                // Still return success to the user
            }
        }

        return NoContent();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var userId = GetUserId();

        // Load the item first so we can get the image URL before deleting
        var anime = await _dynamo.GetByIdAsync(id, userId);
        if (anime == null) return NotFound();

        // Delete S3 images if they exist
        if (!string.IsNullOrEmpty(anime.CoverImageUrl))
        {
            await _s3.DeleteCoverAsync(anime.CoverImageUrl);
        }

        // Delete from DynamoDB
        await _dynamo.DeleteAsync(id, userId);

        return NoContent();
    }

}

// Separate class for the form request — keeps the model clean
// and handles the file upload field alongside text fields
public class AnimeFormRequest
{
    public string Title       { get; set; } = string.Empty;
    public string MediaType   { get; set; } = "Movie";  
    public string Status      { get; set; } = "Plan to Watch";

    public string? Genre       { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public string? Notes       { get; set; } = string.Empty; 
    public int?    ReleaseYear { get; set; }
    public IFormFile? CoverImage { get; set; }
}
