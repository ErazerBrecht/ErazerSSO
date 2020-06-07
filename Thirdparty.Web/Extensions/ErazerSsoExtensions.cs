using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;

namespace Thirdparty.Web.Extensions
{
    public static class ErazerSSOExtensions
    {
        // TODO: Use config / Usersecrets options
        // TODO: Enable RequireHttpsMetadata on PROD
        public static AuthenticationBuilder AddErazerSSO(this AuthenticationBuilder auth)
        {
            return auth.AddOpenIdConnect("ErazerSSO", "ErazerSSO", options =>
            {
                options.Authority = "http://localhost:5000";
                options.ResponseType = "code";
                options.RequireHttpsMetadata = false;
                options.ClientId = "thirdparty";
                options.ClientSecret = "EC095F67-66AB-40E5-A140-6E4806194CD9";
            });
        }
    }
}