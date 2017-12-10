using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
