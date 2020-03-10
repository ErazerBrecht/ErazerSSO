using System;
using System.Security.Cryptography;
using System.Text;

namespace Erazer.IdentityProvider.Session.Helpers
{
    internal static class StringExtensions
    {
        /// <summary>
        /// Creates a SHA512 hash of the specified input.
        /// </summary>
        /// <param name="input">The input.</param>
        /// <returns>A hash</returns>
        internal static string ToSha512(this string input)
        {
            if (string.IsNullOrEmpty(input)) return string.Empty;

            using var sha = SHA512.Create();
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = sha.ComputeHash(bytes);

            return Convert.ToBase64String(hash);
        }
    }
}