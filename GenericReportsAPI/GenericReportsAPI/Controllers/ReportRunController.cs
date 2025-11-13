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

        public ReportRunController(IReportRunner runner)
        {
            _runner = runner;
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
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var result = _runner.Execute(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (SqlException ex)
            {
                return StatusCode(502, $"Error SQL al ejecutar el procedimiento: {ex.Number}");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
