﻿using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Erazer.IdentityProvider
{
    public class LogHeadersMiddleware 
    {
        private readonly RequestDelegate next;
        
        public LogHeadersMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task Invoke(HttpContext context, ILogger<LogHeadersMiddleware> logger)
        {
            var json = JsonSerializer.Serialize(context.Request.Headers.ToDictionary(x => x.Key, y => y.Value));
            logger.LogError(json);

            await next.Invoke(context);
        }
    }
}