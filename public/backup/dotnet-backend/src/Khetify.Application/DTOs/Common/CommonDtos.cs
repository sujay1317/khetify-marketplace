namespace Khetify.Application.DTOs.Common;

public record PaginatedResult<T>(List<T> Data, int Total, int Page, int PageSize);
public record ApiResponse<T>(bool Success, T? Data, string? Message);
public record ErrorResponse(string Error);
