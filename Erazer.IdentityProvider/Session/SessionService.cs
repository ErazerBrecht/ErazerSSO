using System;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Erazer.IdentityProvider.Session
{
    public interface ISessionService
    {
        Task<string> StartSession(string identityId);
        Task<Session> GetSession();
        Task<bool> HasValidSession(string key);
        Task End();
    }
    
    public class SessionService: ISessionService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ISessionStore _store;
        
        public SessionService(ISessionStore store, IHttpContextAccessor httpContextAccessor)
        {
            _store = store ?? throw new ArgumentNullException(nameof(store));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }
        
        public async Task<string> StartSession(string identityId)
        {
            var key = GenerateKey();
            var hashedKey = key;                            // TODO Hash the key

            var session = new Session
            {
                IdentityId = identityId,
                HashedKey = hashedKey,
                Start = DateTimeOffset.UtcNow,
                End = DateTimeOffset.UtcNow.AddHours(12),          // TODO Get expire time cookie from options
                IpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                UserAgent = _httpContextAccessor.HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            };
                
            await _store.Upsert(session);
            _httpContextAccessor.HttpContext.Response.Cookies.Append("Erazer.SSO.SessionId", key, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.Now.AddMonths(3)
            });

            return key;
        }

        public Task<Session> GetSession()
        {
            var hasSession = _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("Erazer.SSO.SessionId", out var sessionId);

            if (!hasSession)
                return Task.FromResult<Session>(null);

            var hashedSessionId = sessionId;                // TODO Hash
            return _store.Get(hashedSessionId);
        }

        public async Task<bool> HasValidSession(string key)
        {
            var session = await GetSession();
            
            if (string.IsNullOrWhiteSpace(key) || session == null)
                return false;

            var hashedKey = key;                            // TODO Hash
            return session.End > DateTimeOffset.UtcNow && hashedKey == session.HashedKey;
        }

        public async Task End()
        {
            var hasSession = _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("Erazer.SSO.SessionId", out var sessionId);

            if (hasSession)
            {
                var hashedSessionId = sessionId;            // TODO Hash
                var session = await _store.Get(hashedSessionId);

                if (session?.End > DateTimeOffset.UtcNow)
                {
                    session.End = DateTimeOffset.UtcNow;
                    await _store.Upsert(session);
                }
                
                _httpContextAccessor.HttpContext.Response.Cookies.Delete("Erazer.SSO.SessionId");
            }
        }

        private static string GenerateKey()
        {
            using(RandomNumberGenerator rng = new RNGCryptoServiceProvider())
            {
                var tokenData = new byte[64];
                rng.GetBytes(tokenData);

                return Convert.ToBase64String(tokenData);
            }
        }
    }
}