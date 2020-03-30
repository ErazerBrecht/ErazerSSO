using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Erazer.API.Session.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Erazer.API.Session
{
    public interface ISessionService
    {
        Task<bool> HasValidSession(ClaimsPrincipal principal);
    }
    
    public class SessionService: ISessionService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ISessionStore _sessionStore;
        private readonly ILogger<SessionService> _logger;
        
        public SessionService(IHttpContextAccessor httpContextAccessor, ISessionStore sessionStore, ILogger<SessionService> logger)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _sessionStore = sessionStore ?? throw new ArgumentNullException(nameof(sessionStore));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> HasValidSession(ClaimsPrincipal principal)
        {
            var hasSession = _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("Erazer.SSO.SessionId", out var sessionId);

            if (!hasSession) 
                return false;
            
            var hashedSessionId = sessionId.ToSha512();
            var sessionKey = principal.Claims.SingleOrDefault(c => c.Type == "sessionKey");
            var subjectId = principal.Claims.SingleOrDefault(c => c.Type == "sub")?.Value;
            var currentIpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString();
            var currentUserAgent = _httpContextAccessor.HttpContext.Request.Headers["User-Agent"].FirstOrDefault();
                
            if (string.IsNullOrEmpty(sessionKey?.Value))
            {
                _logger.LogDebug("Session not found, not able to check if the session is valid!");
                return false;
            }

            var session = await _sessionStore.GetSession(sessionKey);

            if (session == null)
            {
                _logger.LogDebug("Session not found, not able to check if the session is valid!");
                return false;
            }

            if (session.HashedKey != hashedSessionId)
            {
                _logger.LogDebug("Session key doesn't match!");
                return false;
            }
            
            if (session.End < DateTimeOffset.UtcNow)
            {
                _logger.LogDebug("Session is expired!");
                return false;
            }

            if (session.IdentityId != subjectId)
            {
                _logger.LogWarning("Session is not of the correct user!");
                return false;
            }

            if (session.IpAddress != currentIpAddress)
            {
                _logger.LogWarning($"Invalid IP address for this session! SessionIP: {session.IpAddress}, RequestIP: {currentIpAddress}");
                return false;
            }

            if (session.UserAgent != currentUserAgent)
            {
                _logger.LogWarning("Invalid UserAgent for this session!");
                return false;
            }

            return true;

        }
    }
}