from flask import Flask, request
import os
import tweepy
import ConfigParser
from flask.ext.pymongo import PyMongo
from logging.handlers import RotatingFileHandler
from flask.ext.cors import CORS
from utils.utils import Utils
from utils.mongo_harassments_utils import MongoHarassmentsUtils
from utils.mongo_utils import MongoCommentsUtils
from flask.ext.babel import Babel
from flask.ext.basicauth import BasicAuth
import tldextract

babel = Babel()
basic_auth = BasicAuth()

# Create MongoDB database object.
mongo = PyMongo()
mongo_harassments_utils = MongoHarassmentsUtils(mongo)
mongo_comments_utils = MongoCommentsUtils(mongo)
utils = Utils()

def create_app():

    # here we create flask app
    app = Flask(__name__)

    # we load configurations
    load_config(app)

    # configure logging
    configure_logging(app)

    # init BasicAuth
    basic_auth.init_app(app)

    # init internationalization
    babel.init_app(app)

    #Import blueprint modules
    from mod_api.views import mod_api

    #Initialize the app to work with MongoDB
    mongo.init_app(app, config_prefix='MONGO')

    # Allow cross-domain access to API.
    CORS(app, resources={r"/api/": {"origins": "*"}})

    return app


def load_config(app):
    ''' Reads the config file and loads configuration properties into the Flask app.
    :param app: The Flask app object.
    '''
    # Get the path to the application directory, that's where the config file resides.
    par_dir = os.path.join(__file__, os.pardir)
    par_dir_abs_path = os.path.abspath(par_dir)
    app_dir = os.path.dirname(par_dir_abs_path)

    # Read config file
    config = ConfigParser.RawConfigParser()
    config_filepath = app_dir + '/config.cfg'
    config.read(config_filepath)

    app.config['SERVER_PORT'] = config.get('Application', 'SERVER_PORT')
    app.config['MONGO_DBNAME'] = config.get('Mongo', 'DB_NAME')

    # Basic Auth
    app.config['BASIC_AUTH_USERNAME'] = config.get('BasicAuth', 'USERNAME')
    app.config['BASIC_AUTH_PASSWORD'] = config.get('BasicAuth', 'PASSWORD')

    # Logging path might be relative or starts from the root.
    # If it's relative then be sure to prepend the path with the application's root directory path.
    log_path = config.get('Logging', 'PATH')
    if log_path.startswith('/'):
        app.config['LOG_PATH'] = log_path
    else:
        app.config['LOG_PATH'] = app_dir + '/' + log_path

    app.config['LOG_LEVEL'] = config.get('Logging', 'LEVEL').upper()



def configure_logging(app):
    ''' Configure the app's logging.
     param app: The Flask app object
    '''

    log_path = app.config['LOG_PATH']
    log_level = app.config['LOG_LEVEL']

    # If path directory doesn't exist, create it.
    log_dir = os.path.dirname(log_path)
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Create and register the log file handler.
    log_handler = RotatingFileHandler(log_path, maxBytes=250000, backupCount=5)
    log_handler.setLevel(log_level)
    app.logger.addHandler(log_handler)

    # First log informs where we are logging to. Bit silly but serves  as a confirmation that logging works.
    app.logger.info('Logging to: %s', log_path)
