from flask import Blueprint, Response, request
from flask import render_template
from flask import current_app


mod_api = Blueprint('api', __name__, url_prefix='/api')


@mod_api.route('/', methods=['GET'])
def index():
    return render_template('index.html')