using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using AnimeVault.Catalog.Services;
using AnimeVault.Catalog.Models;
using AnimeVault.Catalog.Controllers;

public class AnimeControllerTests
{
    private readonly Mock<IDynamoDbService> _mockDynamoDbService;
    private readonly Mock<IS3Service> _mockS3Service;
    private readonly Mock<IUserContextService> _mockUserContextService;
    private readonly AnimeController _sut;

    public AnimeControllerTests()
    {
        _mockDynamoDbService = new Mock<IDynamoDbService>();
        _mockS3Service = new Mock<IS3Service>();
        _mockUserContextService = new Mock<IUserContextService>();

        _sut = new AnimeController(_mockDynamoDbService.Object, _mockS3Service.Object, _mockUserContextService.Object);
    }

    protected void SetupAuthenticatedUser(string userId = "test-user")
    {
        _mockUserContextService.Setup(s => s.GetUserId())
            .Returns(userId);
    }

    protected void SetupUnauthenticatedUser()
    {
        _mockUserContextService.Setup(s => s.GetUserId())
            .Throws(new UnauthorizedAccessException("No user ID claim found"));
    }

    public class GetAllTests : AnimeControllerTests
    {
        [Fact]
        public async Task GetAll_ReturnsOk_WhenEntriesExist()
        {
            SetupAuthenticatedUser("test-user");
            var expected = new List<Anime>
            {
                new Anime { Id = "1", Title = "Anime 1", UserId = "test-user" },
                new Anime { Id = "2", Title = "Anime 2", UserId = "test-user" }
            };

            _mockDynamoDbService.Setup(s => s.GetAllAsync("test-user"))
                .ReturnsAsync(expected);

            var result = await _sut.GetAll();
            var okResult = Assert.IsType<OkObjectResult>(result);
            var actual = Assert.IsAssignableFrom<List<Anime>>(okResult.Value);
            Assert.Equal(expected.Count, actual.Count);
        }

        [Fact]
        public async Task GetAll_ReturnsOk_WithEmptyList_WhenNoEntries()
        {
            SetupAuthenticatedUser("test-user1");
            _mockDynamoDbService.Setup(s => s.GetAllAsync("test-user1"))
                .ReturnsAsync(new List<Anime>());

            var result = await _sut.GetAll();
            var okResult = Assert.IsType<OkObjectResult>(result);
            var actual = Assert.IsAssignableFrom<List<Anime>>(okResult.Value);
            Assert.Empty(actual);
        }

        [Fact]
        public async Task GetAll_ReturnsUnauthorized_WhenUserNotAuthenticated()
        {
            SetupUnauthenticatedUser();

            var result = await _sut.GetAll();
            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }

    public class CreateTests : AnimeControllerTests
    {
        [Fact]
        public async Task Create_ReturnsCreated_WhenValid()
        {
            SetupAuthenticatedUser("test-user");
            var request = new AnimeFormRequest { Title = "New Anime", MediaType = "TV", Status = "Planned" };

            var result = await _sut.Create(request);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var actual = Assert.IsType<Anime>(createdResult.Value);
            Assert.Equal("New Anime", actual.Title);
            _mockDynamoDbService.Verify(s => s.CreateAsync(It.IsAny<Anime>()), Times.Once);
        }

        [Fact]
        public async Task Create_ReturnsUnauthorized_WhenUserNotAuthenticated()
        {
            SetupUnauthenticatedUser();
            var result = await _sut.Create(new AnimeFormRequest { Title = "Test" });
            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }

    public class UpdateTests : AnimeControllerTests
    {
        [Fact]
        public async Task Update_ReturnsNoContent_WhenSuccessful()
        {
            SetupAuthenticatedUser("test-user");
            var existing = new Anime { Id = "1", UserId = "test-user", Title = "Old Title" };
            _mockDynamoDbService.Setup(s => s.GetByIdAsync("1", "test-user")).ReturnsAsync(existing);
            _mockDynamoDbService.Setup(s => s.UpdateAsync("1", "test-user", It.IsAny<Anime>())).ReturnsAsync(true);

            var result = await _sut.Update("1", new AnimeFormRequest { Title = "Updated Title", MediaType = "Movie", Status = "Completed" });

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenAnimeDoesNotExist()
        {
            SetupAuthenticatedUser("test-user");
            _mockDynamoDbService.Setup(s => s.GetByIdAsync("1", "test-user")).ReturnsAsync((Anime?)null);

            var result = await _sut.Update("1", new AnimeFormRequest { Title = "Test" });

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsUnauthorized_WhenUserNotAuthenticated()
        {
            SetupUnauthenticatedUser();
            var result = await _sut.Update("1", new AnimeFormRequest { Title = "Updated" });
            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }

    public class DeleteTests : AnimeControllerTests
    {
        [Fact]
        public async Task Delete_ReturnsNoContent_WhenSuccessful()
        {
            SetupAuthenticatedUser("test-user");
            var anime = new Anime { Id = "1", UserId = "test-user" };
            _mockDynamoDbService.Setup(s => s.GetByIdAsync("1", "test-user")).ReturnsAsync(anime);
            _mockDynamoDbService.Setup(s => s.DeleteAsync("1", "test-user")).ReturnsAsync(true);

            var result = await _sut.Delete("1");

            Assert.IsType<NoContentResult>(result);
            _mockDynamoDbService.Verify(s => s.DeleteAsync("1", "test-user"), Times.Once);
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenAnimeDoesNotExist()
        {
            SetupAuthenticatedUser("test-user");
            _mockDynamoDbService.Setup(s => s.GetByIdAsync("1", "test-user")).ReturnsAsync((Anime?)null);

            var result = await _sut.Delete("1");

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsUnauthorized_WhenUserNotAuthenticated()
        {
            SetupUnauthenticatedUser();

            var result = await _sut.Delete("1");
            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }
}