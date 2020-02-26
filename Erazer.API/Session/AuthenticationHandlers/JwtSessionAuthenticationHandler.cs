using System;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Erazer.API.Session.AuthenticationHandlers
{
    public class JwtSessionAuthenticationHandler : JwtBearerHandler
    {
        private readonly ISessionService _session;

        public JwtSessionAuthenticationHandler(
            IOptionsMonitor<JwtBearerOptions> options, ILoggerFactory logger,
            UrlEncoder encoder, ISystemClock clock, ISessionService session) : base(options, logger, encoder, clock)
        {
            _session = session ?? throw new ArgumentNullException(nameof(session));
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var result = await base.HandleAuthenticateAsync();

            // JWT is incorrect no need to check combination with 'Session Cookie'
            if (!result.Succeeded)
                return result;

            var validSession = _session.HasValidSession(result.Principal);
            return !validSession ? AuthenticateResult.Fail("Invalid combination JWT & Session Cookie") : result;
        }
    }
}