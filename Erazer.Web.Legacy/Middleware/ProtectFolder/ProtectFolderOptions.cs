using Microsoft.AspNetCore.Http;

namespace Erazer.Web.Legacy.Middleware.ProtectFolder
{
    public class ProtectFolderOptions
    {
        public PathString Path { get; set; }
        public string PolicyName { get; set; }
    }
}
