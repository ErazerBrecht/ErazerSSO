using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Erazer.IdentityProvider.Session
{
    public class SessionMiddleware
    {
        
        private readonly RequestDelegate _next;

        public SessionMiddleware(RequestDelegate next)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            
            
            // Call the next delegate/middleware in the pipeline
            await _next(context);
        }
    }
}