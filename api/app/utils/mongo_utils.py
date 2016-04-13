import datetime
from bson import SON


class MongoUtils:

    def __init__(self, mongo):
        self.mongo = mongo
        self.collection_name = 'answers'

    def save_to_database(self, data):
        self._insert(data)

    def _insert(self, data):
        json_doc = {
            'answers': data['answers'],
            'topMatches': data['matched_parties'],
            'budget': data['budget'],
            'timestamp': datetime.datetime.utcnow()
        }

        self.mongo.db[self.collection_name].insert(json_doc)

    def get_total_count(self):

        total = self.mongo.db[self.collection_name].count()

        return total

    def get_top_matches(self, place):

        query = '$topMatches.' + place + '.name'
        top_docs = self.mongo.db[self.collection_name].aggregate(
            [
                {'$group': {'_id': query, 'count': {'$sum': 1}}},
                {'$sort': SON([('count', 1)])}

            ]
        )

        return top_docs['result']
