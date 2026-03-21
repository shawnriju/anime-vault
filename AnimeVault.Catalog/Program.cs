using Amazon.DynamoDBv2;
using Amazon.S3;
using AnimeVault.Catalog.Services;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

var awsAccessKey = builder.Configuration["AWS:AccessKey"];
var awsSecretKey = builder.Configuration["AWS:SecretKey"];
var awsRegion    = builder.Configuration["AWS:Region"];

if (!string.IsNullOrEmpty(awsAccessKey) && !string.IsNullOrEmpty(awsSecretKey))
{
    // Explicit credentials — used on Render and other non-AWS hosting
    var credentials = new Amazon.Runtime.BasicAWSCredentials(awsAccessKey, awsSecretKey);
    var awsOptions   = new Amazon.Extensions.NETCore.Setup.AWSOptions
    {
        Credentials = credentials,
        Region      = Amazon.RegionEndpoint.GetBySystemName(awsRegion)
    };
    builder.Services.AddDefaultAWSOptions(awsOptions);
}
else
{
    // Falls back to instance role or named profile — used on Beanstalk and locally
    builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
}

builder.Services.AddAWSService<IAmazonDynamoDB>();
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddScoped<Amazon.DynamoDBv2.DataModel.IDynamoDBContext, Amazon.DynamoDBv2.DataModel.DynamoDBContext>();

builder.Services.AddScoped<IDynamoDbService, DynamoDbService>();
builder.Services.AddScoped<IS3Service, S3Service>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();


builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        // This tells the middleware WHERE to find Cognito's public keys.
        options.Authority = builder.Configuration["Cognito:Authority"];
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer           = true,
            ValidateAudience         = false,  // Cognito access tokens don't include audience
            ValidateLifetime         = true,

            NameClaimType = "sub",  // This maps the 'sub' claim to User.Identity.Name
            RoleClaimType = "cognito:groups",  // If you use roles/groups
        };
    });

// Allow React dev server to call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
        policy.WithOrigins(builder.Configuration["Cors:AllowedOrigin"]!)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("DevPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();