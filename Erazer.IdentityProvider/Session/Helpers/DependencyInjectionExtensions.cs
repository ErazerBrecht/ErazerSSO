using System;
using Erazer.IdentityProvider.Session.Stores;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace Erazer.IdentityProvider.Session.Helpers
{
    public static class DependencyInjectionExtensions
    {
        public static void AddInMemorySessionStore(this IServiceCollection services)
        {
            services.AddSingleton<ISessionStore, InMemorySessionStore>();
        }

        public static void AddMongoDbSessionStore(this IServiceCollection services, string connectionString)
        {
            if (connectionString == null) throw new ArgumentNullException(nameof(connectionString));

            // TODO Make configurable and injectable...
            const string dbName = "ErazerSSO_IDSRV";
            const string collectionName = "Sessions";

            BsonClassMap.RegisterClassMap<Session>(cm =>
            {
                cm.MapIdField(x => x.HashedKey);
                cm.AutoMap();
            });

            services.AddSingleton<IMongoClient>(_ =>
            {
                var mongoClient = new MongoClient(connectionString);
                
                // TODO Move initialization logic...
                var db = mongoClient.GetDatabase(dbName);
                var collections = db.ListCollectionNames().ToList();

                if (!collections.Contains(collectionName))
                {
                    db.CreateCollection(collectionName);
                    var collection = db.GetCollection<Session>(collectionName);
                    var indexOptions = new CreateIndexOptions();
                    var indexKeys = Builders<Session>.IndexKeys.Ascending(x => x.IdentityId);
                    var indexModel = new CreateIndexModel<Session>(indexKeys, indexOptions);
                    collection.Indexes.CreateOne(indexModel);
                }

                return mongoClient;

            });
            services.AddScoped<ISessionStore>(x =>
            {
                var mongoClient = x.GetService<IMongoClient>();
                return new MongoDbSessionStore(mongoClient, dbName, collectionName);
            });
        }
    }
}