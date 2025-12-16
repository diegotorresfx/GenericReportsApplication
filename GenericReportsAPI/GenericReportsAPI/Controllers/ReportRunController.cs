using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogic;
using DataObjects;
using Microsoft.Data.SqlClient;

namespace GenericReportsAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public sealed class ReportRunController : ControllerBase
    {
        private readonly IReportRunner _runner;
        private readonly IReportsRepository _repo;

        public ReportRunController(IReportRunner runner, IReportsRepository repo)
        {
            _runner = runner;
            _repo = repo;
        }

        [HttpPost("metadata", Name = "GetReportMetadata")]
        [ProducesResponseType(typeof(ReportNameMetadataDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<ReportNameMetadataDto> GetReportMetadata([FromBody] ExecuteAnyReportRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var md = _runner.GetMetadata(request);
                return Ok(md);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("execute", Name = "ExecuteAnyReport")]
        [ProducesResponseType(typeof(ExecuteReportResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public ActionResult<ExecuteReportResponse> ExecuteAnyReport([FromBody] ExecuteAnyReportRequest request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            // obtener definición para aplicar default values
            var all = _repo.GetAllAsync();
            var def = all.FirstOrDefault(r => r.StoredProcedure.Equals(request.StoredProcedure, StringComparison.OrdinalIgnoreCase));

            if (def != null && def.ParametersDefinition != null)
            {
                foreach (var p in def.ParametersDefinition)
                {
                    if (!request.Parameters.ContainsKey(p.ParamName) ||
                        request.Parameters[p.ParamName] == null ||
                        string.IsNullOrWhiteSpace(request.Parameters[p.ParamName]?.ToString()))
                    {
                        if (!string.IsNullOrWhiteSpace(p.DefaultValue))
                            request.Parameters[p.ParamName] = p.DefaultValue;
                    }
                }
            }

            try
            {
                var result = _runner.Execute(request);
                return Ok(result);
            }
            catch (SqlException ex)
            {
                return StatusCode(502, $"SQL Error: {ex.Message}");
            }
        }
    }
}
