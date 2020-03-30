using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Erazer.IdentityProvider.Session;
using IdentityServer4;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Test;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Erazer.IdentityProvider.Profile
{
    public class ProfileService : TestUserProfileService
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
                
                if (_session.IsActiveSession(session))
                {
                    context.IssuedClaims.Add(new Claim("sessionKey", session.HashedKey));
                }
                else if (context.Client.ClientId == "angular_dev")
                {
                    session = await _session.StartSession(context.Subject.GetSubjectId());
                    context.IssuedClaims.Add(new Claim("sessionKey", session.HashedKey));
                }
            }
        }

        /// <summary>
        /// This method gets called whenever identity server needs to determine if the user is valid or active (e.g. if the user's account has been deactivated since they logged in).
        /// (e.g. during token issuance or validation).
        /// </summary>
        /// <param name="context">The context.</param>
        /// <returns></returns>
        public override async Task IsActiveAsync(IsActiveContext context)
        {
            Logger.LogDebug("IsActive called from: {caller}", context.Caller);

            var user = Users.FindBySubjectId(context.Subject.GetSubjectId());
            context.IsActive = user?.IsActive == true;

            if (context.Client.RequirePkce)
            {
                var session = await _session.GetSession();
                context.IsActive = context.IsActive && _session.IsActiveSession(session);
            }
        }
    }
}