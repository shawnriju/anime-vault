using Microsoft.EntityFrameworkCore;
using AnimeVault.Catalog.Models;

namespace AnimeVault.Catalog.Data;

public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options) { }

    public DbSet<Anime> Animes { get; set; }
}