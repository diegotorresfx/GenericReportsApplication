using BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GenericReportsAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GenerateReportsController : ControllerBase
    {
        private readonly IReportsRepository _repo;

        public GenerateReportsController(IReportsRepository repo)
        {
            _repo = repo;
        }
    }
}
