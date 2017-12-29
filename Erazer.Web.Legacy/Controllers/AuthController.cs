using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

namespace Erazer.Web.Legacy.Controllers
{
    [Route("auth")]
    [Produces("application/json")]
    public class AuthController: ControllerBase
    {
        const string ssoUrl = "http://localhost:5000";
        const string clientId = "legacy";
        const string clientSecret = "49C1A7E1-0C79-4A89-A3D6-A37998FB86B0";
        const string cookieScheme = "Cookies";
        const string accessTokenName = "access_token";
        const string refreshTokenName = "refresh_token";
        const string expiresAtTokenName = "expires_at";

        [HttpGet("token")]
        public async Task<IActionResult> RequestNewToken()
        {
            // User doesn't have a valid cookie anymore
            if (!User.Identity.IsAuthenticated)
                return StatusCode(419);

            // Check if current access token is still valid!
            // If access token is 'halfway' it's lifetime refresh the access_token 'just to be sure'...
            var expire = await HttpContext.GetTokenAsync(expiresAtTokenName);
            if (!string.IsNullOrWhiteSpace(expire))
            {
                var expireDate = DateTime.ParseExact(expire, "o", CultureInfo.InvariantCulture);
                if (expireDate > DateTime.UtcNow + TimeSpan.FromMinutes(60 / 2))
                {
                    return new JsonResult(await HttpContext.GetTokenAsync(accessTokenName));
                }
            }

            // Try to refresh access token
            var tokenClient = new TokenClient($"{ssoUrl}/connect/token", clientId, clientSecret);
            var refreshToken = await HttpContext.GetTokenAsync(refreshTokenName);
            var tokenResult = await tokenClient.RequestRefreshTokenAsync(refreshToken);          

            // Refresh failed
            if (tokenResult.IsError)
            {
                // TODO Log!!
                return StatusCode(419);
            }

            // Save new (refreshed) tokens in the cookie
            // Return ACCESS_TOKEN as JSON to client
            var newAccessToken = tokenResult.AccessToken;
            var newRefreshToken = tokenResult.RefreshToken;
            var expiresAt = DateTime.UtcNow + TimeSpan.FromSeconds(tokenResult.ExpiresIn);

            var tokens = new List<AuthenticationToken>
            {
                new AuthenticationToken {Name = accessTokenName, Value = newAccessToken},
                new AuthenticationToken {Name = refreshTokenName, Value = newRefreshToken},
                new AuthenticationToken {Name = expiresAtTokenName, Value = expiresAt.ToString("o", CultureInfo.InvariantCulture)}
            };

            var info = await HttpContext.AuthenticateAsync(cookieScheme);
            info.Properties.StoreTokens(tokens);
            await HttpContext.SignInAsync(cookieScheme, info.Principal, info.Properties);
            return new JsonResult(newAccessToken);
        }
    }
}
