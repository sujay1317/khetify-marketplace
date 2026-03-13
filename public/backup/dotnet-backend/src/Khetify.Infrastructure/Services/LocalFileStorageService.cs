using Khetify.Application.Interfaces;

namespace Khetify.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;

    public LocalFileStorageService(string basePath = "wwwroot/uploads")
    {
        _basePath = basePath;
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string bucket)
    {
        var directory = Path.Combine(_basePath, bucket);
        Directory.CreateDirectory(directory);

        var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var filePath = Path.Combine(directory, uniqueName);

        using var file = File.Create(filePath);
        await fileStream.CopyToAsync(file);

        return $"/uploads/{bucket}/{uniqueName}";
    }

    public Task DeleteFileAsync(string fileUrl, string bucket)
    {
        var filePath = Path.Combine(_basePath, fileUrl.TrimStart('/').Replace("uploads/", ""));
        if (File.Exists(filePath))
            File.Delete(filePath);
        return Task.CompletedTask;
    }

    public string GetPublicUrl(string filePath, string bucket) => filePath;
}
