﻿// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using System;
using System.Collections.Generic;
using IdentityModel;
using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using Serilog;

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
                new ApiResource("api", "API access", new List<string> {JwtClaimTypes.Role, "session"}),
                new ApiResource("api:dev", "DEV API access", new List<string> {JwtClaimTypes.Role})
            };
        }

        public static IEnumerable<Client> GetClients(IConfiguration configuration)
        {
            var legacyHostname = configuration["legacy_hostname"];
            var nodejsHostname = configuration["nodejs_hostname"];
            var thirdpartyHostname = configuration["thirdparty_hostname"];

            Log.Logger.Information($"Legacy hostname: {legacyHostname}");
            Log.Logger.Information($"NodeJS hostname: {nodejsHostname}");
            Log.Logger.Information($"Thirdparty hostname: {thirdpartyHostname}");
            
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

                    RedirectUris = {$"{legacyHostname}/signin-oidc"},
                    FrontChannelLogoutUri = $"{legacyHostname}/signout-oidc",
                    PostLogoutRedirectUris = {$"{legacyHostname}:5001/signout-callback-oidc"},

                    AccessTokenLifetime = 1800,
                    AbsoluteRefreshTokenLifetime = (int) TimeSpan.FromHours(8).TotalSeconds,
                    RefreshTokenExpiration = TokenExpiration.Absolute,
                    RefreshTokenUsage = TokenUsage.ReUse,
                    AllowOfflineAccess = true,
                    AllowedScopes = {"openid", "profile", "api"}
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

                    RedirectUris = {$"{nodejsHostname}/auth/signin-oidc"},
                    PostLogoutRedirectUris = {nodejsHostname},

                    AlwaysIncludeUserClaimsInIdToken = true,
                    AllowedScopes = {"openid", "profile", "role"}
                },
                new Client
                {
                    ClientId = "angular",
                    ClientName = "ErazerSSO Angular",

                    AccessTokenLifetime = 90,
                    AllowOfflineAccess = false,

                    RequireClientSecret = false,
                    AllowedGrantTypes = GrantTypes.Code,
                    RequirePkce = true,
                    RequireConsent = false,
                    RedirectUris = new[]
                    {
                        $"{nodejsHostname}/index.html",
                        $"{nodejsHostname}/silent-refresh.html"
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

                    AllowedScopes = {"openid", "profile", "api"}
                },
                new Client
                {
                    ClientId = "thirdparty",
                    ClientName = "Thirdparty",

                    RequireConsent = true,
                    AllowedGrantTypes = GrantTypes.Code,
                    ClientSecrets = {new Secret("EC095F67-66AB-40E5-A140-6E4806194CD9".Sha256())},

                    RedirectUris = {$"{thirdpartyHostname}/signin-oidc"},
                    FrontChannelLogoutUri = $"{thirdpartyHostname}/signout-oidc",
                    PostLogoutRedirectUris = {$"{thirdpartyHostname}/signout-callback-oidc"},

                    AllowedScopes = {"openid", "profile"}
                },
            };
        }
    }
}