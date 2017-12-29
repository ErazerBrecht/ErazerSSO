﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Erazer.Web.Legacy.Controllers
{
    public class DashboardController : Controller
    {

        // Dynamic AngularJS 1.X dashboard
        // Requires to be logged in!
        [Authorize]
        public IActionResult Index(string returnRoute)
        {
            if(!string.IsNullOrEmpty(returnRoute) && Url.IsLocalUrl(returnRoute))
                return Redirect(returnRoute);

            return Redirect("/portal");
        }
    }
}