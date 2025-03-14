import redis
from app.core.config import settings

redis_client = redis.StrictRedis(
    host=settings.redis_host,
    port=settings.redis_port,
    db=settings.redis_db,
    decode_responses=True
)
