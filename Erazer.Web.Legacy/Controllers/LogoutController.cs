using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Session;

namespace Erazer.Web.Legacy.Controllers
{
    public class LogoutController: Controller
    {
        public LogoutController(ISessionStore session)
        {
        }
        
        public async Task Index()
        {
            // TODO CONST!!
            await HttpContext.SignOutAsync("Cookies");
            await HttpContext.SignOutAsync("oidc");
        }
    }
}
