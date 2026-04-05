from typing import Optional

from pymongo import MongoClient
from .config import settings

_client: Optional[MongoClient] = None


def get_db():
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri)
    return _client.get_default_database()
