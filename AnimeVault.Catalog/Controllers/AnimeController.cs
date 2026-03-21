using Microsoft.AspNetCore.Mvc;
using AnimeVault.Catalog.Data;
using AnimeVault.Catalog.Models;
using AnimeVault.Catalog.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace AnimeVault.Catalog.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly IDynamoDbService _dynamo;
    private readonly IS3Service       _s3;
    private readonly IUserContextService _userContextService;

    public AnimeController(IDynamoDbService dynamo, IS3Service s3, IUserContextService userContextService)
    {
        _dynamo = dynamo;
        _s3     = s3;
        _userContextService = userContextService;
    }


    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try{
            var userId = _userContextService.GetUserId();
            var animes = await _dynamo.GetAllAsync(userId);
            return Ok(animes);
        }
        catch(UnauthorizedAccessException ex){
            return Unauthorized(ex.Message);
        }
        catch(Exception ex){
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] AnimeFormRequest request)
    {
        try {
            var userId = _userContextService.GetUserId();

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
        catch(UnauthorizedAccessException ex){
            return Unauthorized(ex.Message);
        }
        catch(Exception ex){
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromForm] AnimeFormRequest request)
    {
        try 
        {
            var userId = _userContextService.GetUserId();

            // Load existing item to get the current cover URL before updating
            var existing = await _dynamo.GetByIdAsync(id, userId);
            if (existing == null) return NotFound();

            // First upload the new image
            string? newImageUrl = null;
            if (request.CoverImage is { Length: > 0 })
            {
                await using var stream = request.CoverImage.OpenReadStream();
                newImageUrl = await _s3.UploadCoverAsync(stream, request.CoverImage.ContentType);
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
                    }
                    catch
                    {
                        // Clean-up failed, not much we can do here
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
                }
                catch
                {
                    // Log would go here - but don't fail the request
                }
            }

            return NoContent();
        }
        catch(UnauthorizedAccessException ex){
            return Unauthorized(ex.Message);
        }
        catch(KeyNotFoundException ex){
            return NotFound(ex.Message);
        }
        catch(Exception ex){
            return StatusCode(500, ex.Message);
        }
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        try {
            var userId = _userContextService.GetUserId();

            // Load the item first so we can get the image URL before deleting
            var anime = await _dynamo.GetByIdAsync(id, userId);
            if (anime == null) return NotFound();

            // Delete S3 and DynamoDB in parallel
            var s3Task = string.IsNullOrEmpty(anime.CoverImageUrl) 
                ? Task.CompletedTask 
                : _s3.DeleteCoverAsync(anime.CoverImageUrl);
                
            var dbTask = _dynamo.DeleteAsync(id, userId);

            await Task.WhenAll(s3Task, dbTask);

            return NoContent();
        }
        catch(UnauthorizedAccessException ex){
            return Unauthorized(ex.Message);
        }
        catch(Exception ex){
            return StatusCode(500, ex.Message);
        }
    }

}

// Separate class for the form request — keeps the model clean
// and handles the file upload field alongside text fields
public class AnimeFormRequest
{
    [Required]
    [MaxLength(100)]
    public string Title       { get; set; } = string.Empty;

    [Required]
    public string MediaType   { get; set; } = "Movie";  
    
    [Required]
    public string Status      { get; set; } = "Plan to Watch";

    [MaxLength(150)]
    public string? Genre       { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes       { get; set; } = string.Empty; 

    public int?    ReleaseYear { get; set; }
    
    public IFormFile? CoverImage { get; set; }
}
