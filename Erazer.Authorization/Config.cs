// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using IdentityServer4.Models;
using System;
using System.Collections.Generic;

namespace Erazer_Authorization
{
    public static class Config
    {
        public static IEnumerable<IdentityResource> GetIdentityResources()
        {
            return new IdentityResource[]
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
            };
        }

        public static IEnumerable<ApiResource> GetApis()
        {
            return new ApiResource[]
            {
                new ApiResource("api1", "My API #1")
            };
        }

        public static IEnumerable<Client> GetClients()
        {
            return new[]
            {
                // Legacy client (MVC + AngularJS 1.X) using hybrid flow
                new Client
                {
                    ClientId = "legacy",
                    ClientName = "ErazerSSO Legacy",

                    RequireConsent = false,
                    AllowedGrantTypes = GrantTypes.Hybrid,
                    ClientSecrets = { new Secret("49C1A7E1-0C79-4A89-A3D6-A37998FB86B0".Sha256()) },

                    RedirectUris = { "http://localhost:5001/signin-oidc" },
                    FrontChannelLogoutUri = "http://localhost:5001/signout-oidc",
                    PostLogoutRedirectUris = { "http://localhost:5001/signout-callback-oidc" },

                    AccessTokenLifetime = 1800,
                    AbsoluteRefreshTokenLifetime = (int) TimeSpan.FromHours(8).TotalSeconds,
                    RefreshTokenExpiration = TokenExpiration.Absolute,
                    RefreshTokenUsage = TokenUsage.ReUse,
                    AllowOfflineAccess = true,
                    AllowedScopes = { "openid", "profile", "api1" }
                },

                // SPA client using implicit flow
                new Client
                {
                    ClientId = "spa",
                    ClientName = "SPA Client",
                    ClientUri = "http://identityserver.io",

                    AllowedGrantTypes = GrantTypes.Implicit,
                    AllowAccessTokensViaBrowser = true,

                    RedirectUris =
                    {
                        "http://localhost:5002/index.html",
                        "http://localhost:5002/callback.html",
                        "http://localhost:5002/silent.html",
                        "http://localhost:5002/popup.html",
                    },

                    PostLogoutRedirectUris = { "http://localhost:5002/index.html" },
                    AllowedCorsOrigins = { "http://localhost:5002" },

                    AllowedScopes = { "openid", "profile", "api1" }
                },

                new Client
                {
                    ClientId = "thirdparty",
                    ClientName = "Thirdparty",

                    RequireConsent = true,
                    AllowedGrantTypes = GrantTypes.Code,
                    ClientSecrets = { new Secret("EC095F67-66AB-40E5-A140-6E4806194CD9".Sha256()) },

                    RedirectUris = { "http://localhost:9999/signin-oidc" },
                    FrontChannelLogoutUri = "http://localhost:9999/signout-oidc",
                    PostLogoutRedirectUris = { "http://localhost:9999/signout-callback-oidc" },

                    AllowedScopes = { "openid", "profile" }
                },
            };
        }
    }
}