using DataObjects;

namespace BusinessLogic
{
    public interface IReportsRepository
    {
        Task<IEnumerable<ReportDefinition>> GetAllAsync();
        Task<ReportDefinition?> GetByIdAsync(int id);
        Task<int> CreateAsync(ReportDefinition report);
        Task<bool> UpdateAsync(ReportDefinition report);
        Task<bool> DeleteAsync(int id);
    }
}
