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


@mod_api.route('/get/matches/first', methods=['GET'])
def get_first_matches():

    first_matches = mongo_utils.get_top_matches('first')
    return Response(response=json_util.dumps(first_matches), status=200, mimetype="application/json")


@mod_api.route('/get/matches/second', methods=['GET'])
def get_second_matches():

    second_matches = mongo_utils.get_top_matches('second')
    return Response(response=json_util.dumps(second_matches), status=200, mimetype="application/json")


@mod_api.route('/get/matches/third', methods=['GET'])
def get_third_matches():

    third_matches = mongo_utils.get_top_matches('third')
    return Response(response=json_util.dumps(third_matches), status=200, mimetype="application/json")


@mod_api.route('/get/budget/counts', methods=['GET'])
def budget_balance():
    result = mongo_utils.get_counts_on_budget_increase_decrease()
    return Response(response=json_util.dumps(result), status=200, mimetype="application/json")

@mod_api.route('/get/insights', methods=['GET'])
def get_insight():

    docs = mongo_utils.get_insights()
    return Response(response=json_util.dumps(docs), status=200, mimetype="application/json")

