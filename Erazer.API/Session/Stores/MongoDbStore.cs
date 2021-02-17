using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace Erazer.API.Session.Stores
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

        public Task<SessionModel> GetSession(Claim sessionClaim, CancellationToken ct = default)
        {
            if (sessionClaim == null) throw new ArgumentNullException(nameof(sessionClaim));
            var sessionKey = sessionClaim.Value;

            return _mongoClient.GetDatabase(_dbName)
                .GetCollection<SessionModel>(_collectionName)
                .AsQueryable()
                .Where(s => s.HashedKey == sessionKey)
                .SingleOrDefaultAsync(ct);
        }
    }
}