import datetime
class MongoUtils:

    def __init__(self, mongo):
        self.mongo = mongo
        self.collection_name = 'answers'

    def save_to_database(self, data):
        self._insert(data)

    def _insert(self, data):
        json_doc = {
            'answers': data,
            'timestamp': datetime.datetime.utcnow()
        }

        self.mongo.db[self.collection_name].insert(json_doc)
