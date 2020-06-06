using System;
using System.IdentityModel.Tokens.Jwt;
using Erazer.IdentityProvider.Profile;
using Erazer.IdentityProvider.Session;
using Erazer.IdentityProvider.Session.Helpers;
using IdentityServer4;
using IdentityServer4.Quickstart.UI;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
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
            services.AddControllersWithViews();
            services.AddCloudflareForwardHeaderOptions();

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
            builder.AddInMemoryClients(Config.GetClients(Configuration));
            builder.AddTestUsers(TestUsers.Users);
            builder.AddInMemoryPersistedGrants();

            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<ISessionService, SessionService>();
            services.AddMongoDbSessionStore(Configuration["mongodb_connectionString"]);

            var azureAdOptions = new AzureAdOptions();
            Configuration.Bind("AzureAd", azureAdOptions);
            
            services.AddAuthentication()
                .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, "AzureAD ErazerSSO", options =>
                {
                    options.ClaimActions.MapAll();
                    options.SignInScheme = IdentityServerConstants.ExternalCookieAuthenticationScheme;
                    options.ClientId = azureAdOptions.ClientId;
                    options.ClientSecret = azureAdOptions.ClientSecret;
                    options.Authority = new Uri(new Uri(azureAdOptions.Instance), azureAdOptions.TenantId).ToString();
                    options.CallbackPath = azureAdOptions.CallbackPath ?? options.CallbackPath;
                    options.SignedOutCallbackPath = azureAdOptions.SignedOutCallbackPath ?? options.SignedOutCallbackPath;
                });    
            
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();
            
            services.AddAuthentication("Erazer.SSO.CookiePlusSession.Authentication")
                .AddScheme<CookieAuthenticationOptions, CookieSessionAuthenticationHandler>(
                    "Erazer.SSO.CookiePlusSession.Authentication", x =>
                    {
                        x.Cookie.Name = "Erazer.SSO.WebSession";
                        x.Cookie.SecurePolicy = Environment.IsProduction()
                            ? CookieSecurePolicy.Always
                            : CookieSecurePolicy.SameAsRequest;
                    });

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
            app.UseForwardedHeaders();
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
            else
            {
                app.UseCors(c =>
                    c.WithOrigins(Configuration["nodejs_hostname"])
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