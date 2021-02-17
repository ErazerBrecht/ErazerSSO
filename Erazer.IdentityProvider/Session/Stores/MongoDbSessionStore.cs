using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace Erazer.IdentityProvider.Session.Stores
{
    public class MongoDbSessionStore : ISessionStore
    {
        private readonly IMongoClient _mongoClient;
        private readonly string _dbName;
        private readonly string _collectionName;

        public MongoDbSessionStore(IMongoClient mongoClient, string dbName, string collectionName)
        {
            _mongoClient = mongoClient ?? throw new ArgumentNullException(nameof(mongoClient));
            _dbName = dbName ?? throw new ArgumentNullException(nameof(dbName));
            _collectionName = collectionName ?? throw new ArgumentNullException(nameof(collectionName));
        }

        public Task<Session> Get(string key, CancellationToken ct = default)
        {
            return _mongoClient.GetDatabase(_dbName)
                .GetCollection<Session>(_collectionName)
                .AsQueryable()
                .Where(s => s.HashedKey == key)
                .SingleOrDefaultAsync(ct);
        }

        public async Task<IList<Session>> GetAllByIdentityId(string userId, CancellationToken ct = default)
        {
            return await _mongoClient.GetDatabase(_dbName)
                .GetCollection<Session>(_collectionName)
                .AsQueryable()
                .Where(s => s.IdentityId == userId)
                .ToListAsync(ct);
        }

        public Task Upsert(Session session, CancellationToken ct = default)
        {
            return _mongoClient.GetDatabase(_dbName)
                .GetCollection<Session>(_collectionName)
                .ReplaceOneAsync(s => s.HashedKey == session.HashedKey, session,
                    new ReplaceOptions
                    {
                        IsUpsert = true
                    }, ct);
        }

        public async Task UpsertMany(IEnumerable<Session> sessions, CancellationToken ct = default)
        {
            var mongoDbTransaction = _mongoClient.StartSession();
            var collection = _mongoClient.GetDatabase(_dbName).GetCollection<Session>(_collectionName);
            try
            {
                foreach (var session in sessions)
                {
                    await collection.ReplaceOneAsync(mongoDbTransaction, s => s.HashedKey == session.HashedKey, session,
                        new ReplaceOptions
                        {
                            IsUpsert = true
                        }, ct);
                }

                await mongoDbTransaction.CommitTransactionAsync(ct);
            }
            catch
            {
                await mongoDbTransaction.AbortTransactionAsync(ct);
            }
        }
    }
}