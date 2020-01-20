using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Erazer.IdentityProvider.Session;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Test;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Erazer.IdentityProvider.Profile
{
    public class ProfileService : TestUserProfileService, IProfileService
    {
        private readonly ISessionService _session;

        public ProfileService(ISessionService session, ILogger<TestUserProfileService> logger, TestUserStore userStore)
            : base(userStore, logger)
        {
            _session = session ?? throw new ArgumentNullException(nameof(session));
        }

        public override async Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            await base.GetProfileDataAsync(context);

            if (context.RequestedClaimTypes.Contains("session"))
            {
                var session = await _session.GetSession();

                if (session != null && session.End > DateTimeOffset.UtcNow)
                {
                    context.IssuedClaims.Add(new Claim("SessionData", JsonConvert.SerializeObject(session), IdentityServerConstants.ClaimValueTypes.Json));
                }
            }
        }
    }
}