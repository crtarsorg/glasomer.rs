from flask import Blueprint, Response, render_template, request
import json
from app import mongo_utils
from bson import json_util

mod_api = Blueprint('api', __name__)


@mod_api.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@mod_api.route('/save', methods=['POST'])
def save_data():
    if len(request.json) > 0:
        mongo_utils.save_to_database(request.json)
        return Response(status=200)
    else:
        Response(status=400)


@mod_api.route('/get/total-count', methods=['GET'])
def counts():
    total = mongo_utils.get_total_count()
    return Response(response=json_util.dumps({"totalNumberOfAnswers": total}), status=200, mimetype="application/json")
