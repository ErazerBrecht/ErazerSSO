using Microsoft.AspNetCore.Mvc;

namespace Erazer.Web.Legacy.Controllers
{
    public class HomeController : Controller
    {
        // Static landing page
        public IActionResult Index()
        {
            return Redirect("/landing");
        }
    }
}
