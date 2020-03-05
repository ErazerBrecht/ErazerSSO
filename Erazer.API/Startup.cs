using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IdentityModel.Tokens.Jwt;
using Erazer.API.Session;
using Erazer.API.Session.AuthenticationHandlers;
using Erazer.API.Session.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace Erazer.API
{
    public class Startup
    {
        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddCloudflareForwardHeaderOptions();
            
            services.AddScoped<ISessionService, SessionService>();
            services.AddHttpContextAccessor();

            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            services.AddAuthentication("Bearer")
                .AddJwtSessionBearer("Bearer", options =>
                {
                    options.Authority = $"{_configuration["idsrv_hostname"]}";
                    options.RequireHttpsMetadata = false;
                    options.Audience = "api";
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();
            app.UseSerilogRequestLogging();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseCors(builder => builder.WithOrigins("http://localhost:8888", "http://localhost:4201")
                    .AllowAnyHeader().AllowAnyMethod().AllowCredentials());
            }
            else
            {
                app.UseCors(builder => builder.WithOrigins($"{_configuration["nodejs_hostname"]}")
                    .AllowAnyHeader().AllowAnyMethod().AllowCredentials());
            }
            
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints => { endpoints.MapDefaultControllerRoute(); });
        }
    }
}