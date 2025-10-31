using Microsoft.AspNetCore.Mvc;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PingController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "pong" });
        }
    }
}
