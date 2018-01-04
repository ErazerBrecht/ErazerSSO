using Erazer.Web.Legacy.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace Erazer.Web.Legacy
{
    public class Startup
    {
        // Abstraction of key-value application settings!
        private IConfiguration _configuration;
        // Path (staticfiles) that will be secured!
        private const string SecuredStaticFilePath = "/portal";
        // Name of policy that is required to access secured path
        private const string SecuredStaticFilePolicyName = "AccessToSecuredFiles";

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        { 
            services.AddMvc();

            #region AuthenticationServices
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

            services.AddAuthentication(options =>
                {
                    options.DefaultScheme = "Cookies";
                    options.DefaultChallengeScheme = "oidc";
                })
                .AddCookie("Cookies", options =>
                {
                    // Make lifetime of cookie the same as the refresh token!
                    options.ExpireTimeSpan = TimeSpan.FromHours(8);
                    options.Cookie.Name = "Erazer.SSO.Legacy";
                })
                .AddOpenIdConnect("oidc", options =>
                {
                    options.SignInScheme = "Cookies";
                    options.Authority = "http://localhost:5000";
                    options.RequireHttpsMetadata = false;
                    options.ClientId = "legacy";
                    options.ClientSecret = "49C1A7E1-0C79-4A89-A3D6-A37998FB86B0";
                    options.ResponseType = "code id_token";
                    options.SaveTokens = true;
                    options.GetClaimsFromUserInfoEndpoint = true;
                    options.Scope.Add("api1");
                    options.Scope.Add("offline_access");
                });
            services.AddAuthorization(options =>
            {
                options.AddPolicy(SecuredStaticFilePolicyName, policy => policy.RequireAuthenticatedUser());
            });
            #endregion
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseAuthentication();
            app.UseCustomStaticFiles(SecuredStaticFilePath, SecuredStaticFilePolicyName);
            app.UseMvcWithDefaultRoute();
        }
    }
}
