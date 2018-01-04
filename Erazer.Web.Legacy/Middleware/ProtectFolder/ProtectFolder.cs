using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Erazer.Web.Legacy.Middleware.ProtectFolder
{
    public class ProtectFolder
    {
        private readonly RequestDelegate _next;
        private readonly PathString _path;
        private readonly string _policyName;

        public ProtectFolder(RequestDelegate next, ProtectFolderOptions options)
        {
            _next = next;
            _path = options.Path;
            _policyName = options.PolicyName;
        }

        public async Task Invoke(HttpContext httpContext, IAuthorizationService authorizationService)
        {
            if (httpContext.Request.Path.StartsWithSegments(_path))
            {          
                var authorization = await authorizationService.AuthorizeAsync(httpContext.User, null, _policyName);

                if (!authorization.Succeeded)
                {
                    httpContext.Response.Redirect($"{httpContext.Request.Scheme}://{httpContext.Request.Host}");
                    return;
                }
            }

            await _next(httpContext);
        }
    }
}
