import flask_pymongo
from flask_pymongo import ObjectId

class MongoCommentsUtils():

    def __init__(self, mongo):
        self.mongo = mongo
        self.collection_name = 'comments'
