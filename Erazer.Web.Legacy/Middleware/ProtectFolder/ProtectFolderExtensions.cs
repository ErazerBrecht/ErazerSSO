using Microsoft.AspNetCore.Builder;

namespace Erazer.Web.Legacy.Middleware.ProtectFolder
{
    public static class ProtectFolderExtensions
    {
        public static IApplicationBuilder UseProtectFolder(this IApplicationBuilder builder, ProtectFolderOptions options)
        {
            return builder.UseMiddleware<ProtectFolder>(options);
        }
    }
}
