from flask import Blueprint, Response, render_template, request
import json
from app import mongo_utils

mod_api = Blueprint('api', __name__)


@mod_api.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@mod_api.route('/api/save', methods=['POST'])
def save_data():
    if len(request.json) > 0:
        mongo_utils.save_to_database(request.json)
        return Response(status=200)
    else:
        Response(status=400)
