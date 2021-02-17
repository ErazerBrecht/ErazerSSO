using System;
using Erazer.API.Session.Stores;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace Erazer.API.Session.DependencyInjection
{
    public static class SessionStore
    {
        public static void AddMongoDbSessionStore(this IServiceCollection services, string connectionString)
        {
            if (connectionString == null) throw new ArgumentNullException(nameof(connectionString));

            // TODO Make configurable and injectable...
            const string dbName = "ErazerSSO_IDSRV";
            const string collectionName = "Sessions";

            BsonClassMap.RegisterClassMap<SessionModel>(cm =>
            {
                cm.MapIdField(x => x.HashedKey);
                cm.AutoMap();
            });

            services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));
            services.AddScoped<ISessionStore>(x =>
            {
                var mongoClient = x.GetService<IMongoClient>();
                return new MongoDbSessionStore(mongoClient, dbName, collectionName);
            });
        }
    }
}