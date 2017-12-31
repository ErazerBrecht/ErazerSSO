using Erazer.Web.Legacy.Middleware.ProtectFolder;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Rewrite;

namespace Erazer.Web.Legacy.Extensions
{
    public static class CustomStaticFileExtensions
    {
        public static IApplicationBuilder UseCustomStaticFiles(this IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseProtectFolder(new ProtectFolderOptions
            {
                Path = "/portal",
                PolicyName = "Authenticated"
            });

            app.UseRewriter(new RewriteOptions().AddRewrite(@"^portal\/(\/(\w+))*\/?(\.\w{5,})?\??([^.]+)?$", "portal/index.html", skipRemainingRules: true));
            app.UseDefaultFiles();
            app.UseStaticFiles();

            return app;
        }
    }
}
