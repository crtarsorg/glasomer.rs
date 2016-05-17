# coding=utf-8
import datetime
from bson import SON
import string


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
                {"$sort": SON([("count", -1), ("_id", -1)])}

            ]
        )

        return top_docs['result']

    def get_counts_on_budget_increase_decrease(self):

        increase_budget = self.mongo.db[self.collection_name].aggregate(
            [
                {'$unwind': '$budget.increase'},
                {'$group': {'_id': '$budget.increase', 'count': {'$sum': 1}}},
                {"$sort": SON([("count", -1), ("_id", -1)])}
            ]
        )

        decrease_budget = self.mongo.db[self.collection_name].aggregate(
            [
                {'$unwind': '$budget.decrease'},
                {'$group': {'_id': '$budget.decrease', 'count': {'$sum': 1}}},
                {"$sort": SON([("count", -1), ("_id", -1)])}
            ]
        )



        main_json = {
            'increase': self.structure_sub_json(increase_budget['result']),
            'decrease': self.structure_sub_json(decrease_budget['result'])
        }

        return main_json

    def structure_sub_json(self, item_array):
        json_doc = {}
        for item in item_array:
            json_doc[self.convert_case(item['_id'])] = item['count']

        return json_doc

    def get_insights(self):
        vaz = []
        
        vaz = self.pipeline_build(["Važno"])
        nije_vaz = self.pipeline_build(["Nije važno"])
        manje_vaz = self.pipeline_build(["Manje važno"])
        veoma = self.pipeline_build(["Veoma važno"])
        all_tp = self.pipeline_build(["", "Važno", "Nije važno", "Manje važno", "Veoma važno"])

        # Query
        all_pipe = self.mongo.db[self.collection_name].aggregate(pipeline = [
            {
                "$unwind": "$answers"
            },
            {
                "$group": {
                    "_id": {"qst":"$answers.question"},
                    "counter": {"$sum": 1}
                }
            },
            {
                "$sort": SON([("counter", 1), ("_id.qst", 1)])
            },
            {
                "$project": {
                    "_id": 0,
                    "question": "$_id.qst",
                    "importance": "$_id.importance",
                    "totalAnswers": "$counter"
                }
            }
        ])
        vazno = self.mongo.db[self.collection_name].aggregate(vaz)
        nije_vazno = self.mongo.db[self.collection_name].aggregate(nije_vaz)
        manje_vazno = self.mongo.db[self.collection_name].aggregate(manje_vaz)
        veoma_vazno = self.mongo.db[self.collection_name].aggregate(veoma)

        for ind, itm in enumerate(all_pipe['result']):

            counter = 0
            # Vazno
            for elem in vazno['result']:
                if itm['question'] == elem['question']:
                    itm["vazno"] = elem['totalAnswers']
                    counter += elem['totalAnswers'] 
                    all_pipe['result'][ind] = itm

            # nije_vazno
            for elem in nije_vazno['result']:
                if itm['question'] == elem['question']:
                    itm["NijeVazno"] = elem['totalAnswers']
                    counter += elem['totalAnswers']
                    all_pipe['result'][ind] = itm
            # manje_vazno
            for elem in manje_vazno['result']:
                if itm['question'] == elem['question']:
                    itm["manjeVazno"] = elem['totalAnswers']
                    counter += elem['totalAnswers'] 
                    all_pipe['result'][ind] = itm
            # veoma_vazno
            for elem in veoma_vazno['result']:
                if itm['question'] == elem['question']:
                    itm["veomaVazno"] = elem['totalAnswers']
                    counter += elem['totalAnswers']
                    all_pipe['result'][ind] = itm
            itm['noAnswer'] = itm['totalAnswers'] - counter
            all_pipe['result'][ind] = itm

        return all_pipe['result']

    @staticmethod
    def convert_case(name):

        string_key = string.capwords(name).replace(' ', '')

        return string_key[:1].lower() + string_key[1:]

    
    def pipeline_build(self, value):
        pipeline = [
            {
                "$unwind": "$answers"
            },
            {
                "$match": {
                    "answers.parties.Vaš odgovor.importance": {"$in":value}
                }
            },
            {
                "$group": {
                    "_id": {"qst":"$answers.question", "importance": "$answers.parties.Vaš odgovor.importance"},
                    "counter": {"$sum": 1}
                }
            },
            {
                "$sort": SON([("counter", 1), ("_id.qst", 1)])
            },
            {
                "$project": {
                    "_id": 0,
                    "question": "$_id.qst",
                    "importance": "$_id.importance",
                    "totalAnswers": "$counter"
                }
            }
        ]
        return pipeline
