using System;
using Erazer.IdentityProvider.Profile;
using Erazer.IdentityProvider.Session;
using IdentityServer4;
using IdentityServer4.Quickstart.UI;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace Erazer.IdentityProvider
{
    public class Startup
    {
        private IWebHostEnvironment Environment { get; }
        private IConfiguration Configuration { get; }

        public Startup(IWebHostEnvironment environment, IConfiguration configuration)
        {
            Environment = environment ?? throw new ArgumentNullException(nameof(environment));
            Configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public void ConfigureServices(IServiceCollection services)
        {
            var hostname = Configuration["baseUrl"];

            services.AddControllersWithViews();
            
            var builder = services.AddIdentityServer(options =>
            {
                options.Authentication.CookieLifetime = TimeSpan.FromHours(12);
                options.Authentication.CookieSlidingExpiration = true;
                options.Authentication.CheckSessionCookieName = "Erazer.SSO.CheckSession";

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

            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<ISessionService, SessionService>();
            services.AddSingleton<ISessionStore, InMemorySessionStore>();

            services.AddAuthentication("Erazer.SSO.CookiePlusSession.Authentication")
                .AddScheme<CookieAuthenticationOptions, CookieSessionAuthenticationHandler>(
                    "Erazer.SSO.CookiePlusSession.Authentication", x => x.Cookie.Name = "Erazer.SSO.WebSession");
            
            if (Environment.IsDevelopment())
            {
                builder.AddDeveloperSigningCredential();
            }
            else
            {
                // TODO DON'T DO THIS IN PRODUCTION!!!!!!!
                builder.AddDeveloperSigningCredential();
            }
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseSerilogRequestLogging();

            if (Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseCors(c =>
                    c.WithOrigins("http://localhost:8888", "http://localhost:4201")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                    );
            }

            app.UseStaticFiles();
            app.UseRouting();
            app.UseIdentityServer();
            app.UseAuthorization();

            app.UseEndpoints(endpoints => { endpoints.MapDefaultControllerRoute(); });
        }
    }
}