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

                // New client (NodeJS + Angular) using 'code authorization'
                new Client
                {
                    ClientId = "nodejs",
                    ClientName = "ErazerSSO nodejs",
                    
                    AccessTokenLifetime = 3600,
                    AllowOfflineAccess = false,

                    RequireConsent = false,
                    AllowedGrantTypes = GrantTypes.Code,
                    ClientSecrets = { new Secret("C1C47B06-7E3B-41D6-BB2D-F4DF245DBF7C".Sha256()) },

                    RedirectUris = { "http://localhost:8888/auth/signin-oidc" },
                    PostLogoutRedirectUris = { "http://localhost:8888" },

                    AllowedScopes = { "openid", "profile", "api1" }
                },
                new Client
                {
                    ClientId = "nodejs_dev",
                    ClientName = "ErazerSSO nodejs_dev",

                    AccessTokenLifetime = (int) TimeSpan.FromDays(7).TotalSeconds,
                    AllowOfflineAccess = false,

                    RequireConsent = false,
                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,
                    ClientSecrets = { new Secret("425A4639-4079-49E1-9F86-E832F246F5FB".Sha256()) },

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