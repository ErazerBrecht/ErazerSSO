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

namespace Erazer.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvcCore()
                .AddAuthorization()
                .AddCors()
                .AddJsonFormatters();

            services.AddScoped<ISessionService, SessionService>();
            services.AddHttpContextAccessor();

            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            services.AddAuthentication("Bearer")
                .AddJwtSessionBearer("Bearer", options =>
                {
                    options.Authority = $"{Configuration["baseUrl"]}:5000";
                    options.RequireHttpsMetadata = false;
                    options.Audience = "api";
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseCors(builder => builder.WithOrigins("http://localhost:8888", "http://localhost:4201")
                    .AllowAnyHeader().AllowAnyMethod().AllowCredentials());
            }
            else
            {
                app.UseCors(builder =>
                    builder.WithOrigins($"{Configuration["baseUrl"]}:8888").AllowAnyHeader().AllowAnyMethod());
            }

            app.UseAuthentication();
            app.UseMvc();
        }
    }
}