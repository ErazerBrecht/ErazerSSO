using Microsoft.AspNetCore.Http;

namespace Erazer.Web.Legacy.Middleware.ProtectFolder
{
    public class ProtectFolderOptions
    {
        public ProtectFolderOptions(PathString path, string policyName)
        {
            Path = path;
            PolicyName = policyName;
        }
        public PathString Path { get; }
        public string PolicyName { get; }
    }
}
