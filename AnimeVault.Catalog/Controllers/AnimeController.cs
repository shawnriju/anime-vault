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
            Genre       = request.Genre,
            Description = request.Description,
            ReleaseYear = request.ReleaseYear,
            Status      = request.Status,
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
    public string Genre       { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int    ReleaseYear { get; set; }
    public string Status      { get; set; } = "Unknown";
    public IFormFile? CoverImage { get; set; }
}
