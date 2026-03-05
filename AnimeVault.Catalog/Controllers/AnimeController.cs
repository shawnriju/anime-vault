using Microsoft.AspNetCore.Mvc;
using AnimeVault.Catalog.Data;
using AnimeVault.Catalog.Models;
using AnimeVault.Catalog.Services;
using Microsoft.AspNetCore.Authorization;

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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var animes = await _dynamo.GetAllAsync();
        return Ok(animes);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] AnimeFormRequest request)
    {
        var anime = new Anime
        {
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
