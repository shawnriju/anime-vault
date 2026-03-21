using System.Security.Claims;

namespace AnimeVault.Catalog.Services;

public interface IUserContextService
{
    string GetUserId();
}

public class UserContextService : IUserContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetUserId()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if(user == null) throw new InvalidOperationException("No HttpContext available");

        var userId =  user.FindFirstValue("sub")
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("cognito:username")
            ?? user.FindFirstValue("username");

        if(string.IsNullOrEmpty(userId))
        {
            // Log only claim types present, avoiding PII exposure
            var claimTypes = user.Claims.Select(c => c.Type);
            throw new UnauthorizedAccessException(
                $"No user ID claim found. Available claim types: {string.Join(", ", claimTypes)}"
            );
        }
        return userId;
    }
}