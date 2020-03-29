using Microsoft.AspNetCore.Authentication;

namespace Erazer.IdentityProvider.Session.Helpers
{
    public static class AuthenticationPropertiesExtensions
    {
        private const string StartNewSessionParameter = "Erazer.SSO.Authentication.StartNewSession";

        public static void MarkNewSession(this AuthenticationProperties authenticationProperties)
        {
            authenticationProperties.SetParameter(StartNewSessionParameter, true);
        }
        
        public static bool ShouldCreateNewSession(this AuthenticationProperties authenticationProperties)
        {
            return authenticationProperties.GetParameter<bool>(StartNewSessionParameter);
        }
    }
}