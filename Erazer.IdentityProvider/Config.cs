// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using System;
using System.Collections.Generic;
using IdentityModel;
using IdentityServer4.Models;

namespace Erazer.IdentityProvider
{
    public static class Config
    {
        public static IEnumerable<IdentityResource> GetIdentityResources()
        {
            return new IdentityResource[]
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
                new IdentityResource("role", "Role", new List<string> {JwtClaimTypes.Role})
            };
        }

        public static IEnumerable<ApiResource> GetApis()
        {
            return new ApiResource[]
            {
                new ApiResource("api", "API access", new List<string> {JwtClaimTypes.Role, "session"})
            };
        }

        public static IEnumerable<Client> GetClients(string hostname)
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
                    ClientSecrets = {new Secret("49C1A7E1-0C79-4A89-A3D6-A37998FB86B0".Sha256())},

                    RedirectUris = {$"{hostname}:5001/signin-oidc"},
                    FrontChannelLogoutUri = $"{hostname}:5001/signout-oidc",
                    PostLogoutRedirectUris = {$"{hostname}:5001/signout-callback-oidc"},

                    AccessTokenLifetime = 1800,
                    AbsoluteRefreshTokenLifetime = (int) TimeSpan.FromHours(8).TotalSeconds,
                    RefreshTokenExpiration = TokenExpiration.Absolute,
                    RefreshTokenUsage = TokenUsage.ReUse,
                    AllowOfflineAccess = true,
                    AllowedScopes = {"openid", "profile", "api1"}
                },

                // New client (NodeJS) using 'code authorization'
                new Client
                {
                    ClientId = "nodejs",
                    ClientName = "ErazerSSO NodeJS",

                    AccessTokenLifetime = 60,
                    IdentityTokenLifetime = 60,
                    AllowAccessTokensViaBrowser = false,
                    AllowOfflineAccess = false,

                    RequireConsent = false,
                    AllowedGrantTypes = GrantTypes.Code,
                    ClientSecrets = {new Secret("C1C47B06-7E3B-41D6-BB2D-F4DF245DBF7C".Sha256())},

                    RedirectUris = {$"{hostname}:8888/auth/signin-oidc"},
                    PostLogoutRedirectUris = {$"{hostname}:8888"},

                    AlwaysIncludeUserClaimsInIdToken = true,
                    AllowedScopes = {"openid", "profile", "role"}
                },
                new Client
                {
                    ClientId = "angular",
                    ClientName = "ErazerSSO Angular",

                    AccessTokenLifetime = 300,
                    AllowOfflineAccess = false,

                    RequireClientSecret = false,
                    AllowedGrantTypes = GrantTypes.Code,
                    RequirePkce = true,
                    RequireConsent = false,
                    RedirectUris = new[]
                    {
                        $"{hostname}:4201/index.html",            
                        $"{hostname}:4201/silent-refresh.html",    
                        $"{hostname}:8888/portal/index.html",
                        $"{hostname}:8888/portal/silent-refresh.html"
                    },

                    AllowedScopes = {"openid", "profile", "api"}
                },
                new Client
                {
                    ClientId = "angular_dev",
                    ClientName = "ErazerSSO Angular_DEV",

                    AccessTokenLifetime = (int) TimeSpan.FromDays(14).TotalSeconds,
                    AllowOfflineAccess = false,

                    RequireConsent = false,
                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,
                    ClientSecrets = {new Secret("425A4639-4079-49E1-9F86-E832F246F5FB".Sha256())},

                    AllowedScopes = {"openid", "profile", "role", "api"}
                },
                new Client
                {
                    ClientId = "thirdparty",
                    ClientName = "Thirdparty",

                    RequireConsent = true,
                    AllowedGrantTypes = GrantTypes.Code,
                    ClientSecrets = {new Secret("EC095F67-66AB-40E5-A140-6E4806194CD9".Sha256())},

                    RedirectUris = {$"{hostname}:9999/signin-oidc"},
                    FrontChannelLogoutUri = $"{hostname}:9999/signout-oidc",
                    PostLogoutRedirectUris = {$"{hostname}:9999/signout-callback-oidc"},

                    AllowedScopes = {"openid", "profile"}
                },
            };
        }
    }
}