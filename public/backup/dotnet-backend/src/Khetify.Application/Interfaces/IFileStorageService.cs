namespace Khetify.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string bucket);
    Task DeleteFileAsync(string fileUrl, string bucket);
    string GetPublicUrl(string filePath, string bucket);
}
