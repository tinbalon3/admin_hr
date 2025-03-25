import redis
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from app.core.config import settings

# pool = redis.ConnectionPool(
#     host=settings.redis_host,
#     port=settings.redis_port,
#     db=settings.redis_db,
#     decode_responses=True,
#     max_connections=50,
#     socket_timeout=5
# )

# redis_client = redis.Redis(connection_pool=pool)

pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
redis_client = redis.Redis(connection_pool=pool)

def check_token(token):
    result = redis_client.get(token)
    return result
