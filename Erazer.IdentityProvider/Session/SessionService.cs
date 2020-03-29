﻿using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
 using Erazer.IdentityProvider.Session.Helpers;
 using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Erazer.IdentityProvider.Session
{
    public interface ISessionService
    {
        Task<Session> StartSession(string identityId);
        
        Task<Session> GetSession();
        Task<Session> GetSession(string sessionId);

        bool IsActiveSession(Session session);
        bool IsValidSession(Session session, string hashedKey);
        
        Task End();
    }
    
    public class SessionService: ISessionService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        private readonly ISessionStore _store;
        
        public SessionService(ISessionStore store, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _store = store ?? throw new ArgumentNullException(nameof(store));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }
        
        public async Task<Session> StartSession(string identityId)
        {
            var key = GenerateKey();

            var session = new Session
            {
                IdentityId = identityId,
                HashedKey = key.ToSha512(),
                Start = DateTimeOffset.UtcNow,
                End = DateTimeOffset.UtcNow.AddMonths(3),          // TODO Get expire time cookie from options
                IpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                UserAgent = _httpContextAccessor.HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            };
                
            await _store.Upsert(session);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = session.End
            };

            if (!string.IsNullOrWhiteSpace(_configuration["cookie_domain"]))
                cookieOptions.Domain = _configuration["cookie_domain"];
            
            _httpContextAccessor.HttpContext.Response.Cookies.Append("Erazer.SSO.SessionId", key, cookieOptions);
            return session;
        }

        public Task<Session> GetSession()
        {
            var hasSession = _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("Erazer.SSO.SessionId", out var sessionId);
            return !hasSession ? null : GetSession(sessionId);
        }

        public Task<Session> GetSession(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
                return Task.FromResult<Session>(null);

            var hashedSessionId = sessionId.ToSha512();
            return _store.Get(hashedSessionId);
        }

        public bool IsActiveSession(Session session)
        {
            if (session == null) return false;
            
            var ipAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString(); 
            return session.End > DateTimeOffset.UtcNow && session.IpAddress == ipAddress;
        }
        
        public bool IsValidSession(Session session, string hashedKey)
        {
            if (string.IsNullOrWhiteSpace(hashedKey) || session == null)
                return false;

            return IsActiveSession(session) && hashedKey == session.HashedKey;
        }

        public async Task End()
        {
            var hasSession = _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("Erazer.SSO.SessionId", out var sessionId);

            if (hasSession)
            {
                var hashedSessionId = sessionId.ToSha512();
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
            using RandomNumberGenerator rng = new RNGCryptoServiceProvider();
            var tokenData = new byte[128];
            rng.GetBytes(tokenData);

            return Convert.ToBase64String(tokenData);
        }
    }
}