using Microsoft.AspNetCore.Mvc;

namespace Erazer.Web.Legacy.Controllers
{
    public class HomeController : Controller
    {
        // Static landing page
        public IActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
                return Redirect("/dashboard");
            return Redirect("/landing");
        }
    }
}
