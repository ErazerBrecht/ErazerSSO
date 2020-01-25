using System;
using Erazer.API.Session.AuthenticationHandlers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace Erazer.API.Session.DependencyInjection
{
    public static class JwtBearerExtensions
    {
        public static AuthenticationBuilder AddJwtSessionBearer(this AuthenticationBuilder builder, string authenticationScheme, Action<JwtBearerOptions> configureOptions)
        {
            builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<IPostConfigureOptions<JwtBearerOptions>, JwtBearerPostConfigureOptions>());
            return builder.AddScheme<JwtBearerOptions, JwtSessionAuthenticationHandler>(authenticationScheme, configureOptions);
        }
    }
}