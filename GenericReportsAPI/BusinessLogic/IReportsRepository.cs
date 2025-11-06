using DataObjects;

namespace BusinessLogic
{
    public interface IReportsRepository
    {
        List<ReportDefinition> GetAllAsync();
        ReportDefinition GetByIdAsync(int id);
        int CreateAsync(ReportDefinition report);
        bool UpdateAsync(ReportDefinition report);
        bool DeleteAsync(int id);
    }
}
