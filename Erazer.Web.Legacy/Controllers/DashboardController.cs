using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Erazer.Web.Legacy.Controllers
{
    public class DashboardController : Controller
    {

        // Dynamic Angular 1.X dashboard
        // Requires to be logged in!
        [Authorize]
        public IActionResult Index(string returnRoute)
        {
            if(string.IsNullOrEmpty(returnRoute))
                return Redirect("/portal");
            return Redirect($"/portal/{returnRoute}");

        }
    }
}