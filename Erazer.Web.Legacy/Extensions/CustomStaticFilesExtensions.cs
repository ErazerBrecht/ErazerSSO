using Erazer.Web.Legacy.Middleware.ProtectFolder;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Rewrite;

namespace Erazer.Web.Legacy.Extensions
{
    public static class CustomStaticFileExtensions
    {
        /// <summary>
        /// Make sure that Authentication is added before this middleware is added in the pipeline!
        /// </summary>
        /// <param name="app"></param>
        /// <param name="path"></param>
        /// <param name="policy"></param>
        /// <returns></returns>
        public static IApplicationBuilder UseCustomStaticFiles(this IApplicationBuilder app, string path, string policy)
        {
            app.UseProtectFolder(new ProtectFolderOptions(path, policy));

            app.UseRewriter(new RewriteOptions().AddRewrite(@"^portal\/(\/(\w+))*\/?(\.\w{5,})?\??([^.]+)?$", "portal/index.html", skipRemainingRules: true));
            app.UseDefaultFiles();
            app.UseStaticFiles();

            return app;
        }
    }
}
