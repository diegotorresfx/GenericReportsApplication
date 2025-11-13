using DataObjects;

namespace BusinessLogic
{
    public interface IReportRunner
    {
        ReportNameMetadataDto GetMetadata(ExecuteAnyReportRequest request);
        ExecuteReportResponse Execute(ExecuteAnyReportRequest request);
    }
}
