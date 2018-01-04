using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;

namespace Erazer.Web.Legacy.Controllers
{
    public class LogoutController: Controller
    {
        public async Task Index()
        {
            // TODO CONST!!
            await HttpContext.SignOutAsync("Cookies");
            await HttpContext.SignOutAsync("oidc");
        }
    }
}
