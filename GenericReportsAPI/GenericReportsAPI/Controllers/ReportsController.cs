using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogic;
using DataObjects;

namespace GenericReportsAPI.Controllers
{
     
    [ApiController]
    [Route("api/[controller]")]
    public sealed class ReportsController : ControllerBase
    {
        private readonly IReportsRepository _repo;

        public ReportsController(IReportsRepository repo)
        {
            _repo = repo;
        }

        [HttpGet(Name = "GetAllReports")]
        public async Task<ActionResult<IEnumerable<ReportDefinition>>> GetAllReports()
        {
            var reports = _repo.GetAllAsync();
            return Ok(reports);
        }

        [HttpGet("{id:int}", Name = "GetReportById")]
        public async Task<ActionResult<ReportDefinition>> GetReportById(int id)
        {
            var report = _repo.GetByIdAsync(id);
            if (report == null)
                return NotFound($"No se encontró el reporte con Id {id}.");
            return Ok(report);
        }

        [HttpPost(Name = "CreateReport")]
        public async Task<ActionResult> CreateReport([FromBody] ReportDefinition report)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var newId = _repo.CreateAsync(report);
            var created = _repo.GetByIdAsync(newId);
            return CreatedAtRoute("GetReportById", new { id = newId }, created);
        }

        [HttpPut("{id:int}", Name = "UpdateReport")]
        public async Task<ActionResult> UpdateReport(int id, [FromBody] ReportDefinition report)
        {
            report.Id = id;
            var exists = _repo.GetByIdAsync(id);
            if (exists == null)
                return NotFound($"No se encontró el reporte con Id {id}.");

            var ok = _repo.UpdateAsync(report);
            if (!ok)
                return StatusCode(500, "No se pudo actualizar el reporte.");

            var updated = _repo.GetByIdAsync(id);
            return Ok(updated);
        }

        [HttpDelete("{id:int}", Name = "DeleteReport")]
        public async Task<ActionResult> DeleteReport(int id)
        {
            var exists = _repo.GetByIdAsync(id);
            if (exists == null)
                return NotFound($"No se encontró el reporte con Id {id}.");

            var ok = _repo.DeleteAsync(id);
            if (!ok)
                return StatusCode(500, "No se pudo eliminar el reporte.");

            return NoContent();
        }
    }
}
