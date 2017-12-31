using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Erazer.Web.Legacy.Controllers
{
    /// <summary>
    /// This controller is used to serve the non-public pages (the actual business application)
    /// </summary>
    [Authorize]
    public class DashboardController : Controller
    {
        public IActionResult Index(string returnRoute)
        {
            if (!string.IsNullOrEmpty(returnRoute) && Url.IsLocalUrl(returnRoute))
                return Redirect(returnRoute);

            return Redirect("/portal");
        }
    }
}