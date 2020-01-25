using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace Erazer.API.Session
{
    public interface ISessionService
    {
        bool HasValidSession(ClaimsPrincipal principal);
    }
    
    public class SessionService: ISessionService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public SessionService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public bool HasValidSession(ClaimsPrincipal principal)
        {
            var hasSession = _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("Erazer.SSO.SessionId", out var sessionId);

            if (!hasSession) 
                return false;
            
            var hashedSessionId = sessionId; // TODO Hash
            var sessionData = principal.Claims.SingleOrDefault(c => c.Type == "SessionData");
            var subjectId = principal.Claims.SingleOrDefault(c => c.Type == "sub")?.Value;
            var currentIpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString();
            var currentUserAgent = _httpContextAccessor.HttpContext.Request.Headers["User-Agent"].FirstOrDefault();
                
            if (string.IsNullOrEmpty(sessionData?.Value))
                return false;

            var session = JsonConvert.DeserializeObject<Session>(sessionData.Value);

            if (session == null)
                return false;
            if (session.End < DateTimeOffset.UtcNow)
                return false;
            if (session.HashedKey != hashedSessionId)
                return false;
            if (session.IdentityId != subjectId)
                return false;
            if (session.IpAddress != currentIpAddress)
                return false;
            if (session.UserAgent != currentUserAgent)
                return false;

            return true;

        }
    }
}