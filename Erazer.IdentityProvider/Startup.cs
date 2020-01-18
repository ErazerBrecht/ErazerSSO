using System;
using System.Reflection;
using IdentityServer4.Quickstart.UI;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Erazer.IdentityProvider
{
    public class Startup
    {
        private IHostingEnvironment Environment { get; }
        private IConfiguration Configuration { get; }

        public Startup(IHostingEnvironment environment, IConfiguration configuration)
        {
            Environment = environment ?? throw new ArgumentNullException(nameof(environment));
            Configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public void ConfigureServices(IServiceCollection services)
        {
            var hostname = Configuration["baseUrl"];
            services.AddMvc();

            var builder = services.AddIdentityServer(options =>
            {
                options.Authentication.CookieLifetime = TimeSpan.FromHours(12);
                options.Authentication.CookieSlidingExpiration = true;
                options.Authentication.CheckSessionCookieName = "Erazer.SSO.Idsr";

                // TODO Check if I don't have to disable them in non-dev environment
                options.Events.RaiseErrorEvents = true;
                options.Events.RaiseInformationEvents = true;
                options.Events.RaiseFailureEvents = true;
                options.Events.RaiseSuccessEvents = true;
            });
             
            builder.AddInMemoryIdentityResources(Config.GetIdentityResources());
            builder.AddInMemoryApiResources(Config.GetApis());
            builder.AddInMemoryClients(Config.GetClients(hostname));
            builder.AddTestUsers(TestUsers.Users);
            builder.AddInMemoryPersistedGrants();

            if (Environment.IsDevelopment())
            {
                builder.AddDeveloperSigningCredential();
            }
            else
            {
                // TODO DON'T DO THIS IN PRODUCTION!!!!!!!
                builder.AddDeveloperSigningCredential();
            }

            services.AddAuthentication();
        }

        public void Configure(IApplicationBuilder app)
        {
            if (Environment.IsDevelopment())
            {
                app.UseCors(c => c.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
                app.UseDeveloperExceptionPage();
            }

            app.UseIdentityServer();
            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();
        }
    }
}