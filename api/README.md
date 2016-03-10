# Installing and running for the first time
1. Prepare the config.cfg based on the provided template file: `cp config-template.cfg config.cfg`
2. Open the newly created config.cfg file with your favourite Terminal-based text editor: `nano config.cfg`
3. Fill in all the config value. You can ignore the twitter ones, that functionality has not been implemented yet.
4. Install the app: `bash install.sh`
5. Compile the language translation files (We're using [Flask-Babel](https://pythonhosted.org/Flask-Babel/): `bash babel-compile.sh`
6. Run the app: `bash run.sh`

# Running in debug mode
`bash run-debug.sh`

# Adding and translating new textual content to the website
1. In .py files use `gettext('Hello World')` and in jinja2 template files use `{{ _('Hello World') }}`.
2. Create new .po file entries for the newly added text: `bash babel-update.sh`.
3. Translate the new entries created in .po files.
4. Compile .po files into .mo: `bash babel-compile.sh`.

# Adding support for a new language
Create a new .po file for the new language, user the appropriate locale code. e.g. for French:
```
bash babel-init.sh fr
```

Then update it so that it grabs all the text that needs to be translated:
```
bash babel-update.sh
```

After filling in the new translations, compile the new .po fil to .mo:
```
bash babel-compile.sh
```

# API
This is the API what powers the WalkFreely app's ability to report and analyse cases of sexual harassement. 

## Save Harassment
### POST  /api/harassment/save
Sample POST message body:
```json
{
    "timestamp" : "2016-01-27T14:29:22.091Z",
    "types" :[
        "Stalking",
        "Touching"
    ],
    "location" : "Home",
    "perpetrator": "Stranger",
    "perpetratorGender": "Male",
    "story" : "This is the story of how I was harassed.",
    "latitude": 42.23424364766,
    "longitude": 21.13243546545,
    "victim": {
        "region": "Kosovo",
        "locality": "Ferizaj",
        "nationality": "Kosovo",
        "gender": "Female",
        "ethnicity": "Albanian",
        "birthday": "1998-01-15",
        "language": "English",
        "appVersion": 1,
        "deviceId": "iak9as0djn239hcsd79hfb723h"
    }
}
``` 

## Bulk Save Multiple Harassments
### POST  /api/harassment/save/bulk
Sample POST message body:
```json 
{
    "victim": {
        "region": "Kosovo",
        "locality": "Ferizaj",
        "nationality": "Kosovo",
        "gender": "Female",
        "ethnicity": "Other",
        "birthday": "1998-01-02",
        "language": "English",
        "appVersion": 1,
        "deviceId": "iak9as0djn239hcsd79hfb723h"
    },
    "harassments": [
        {
            "timestamp" : "2016-01-25T14:29:22.091Z",
            "types" :[
                "Commenting"
            ],
            "location" : "School",
            "perpetrator": "Friend",
            "perpetratorGender": "Female",
            "story" : "This is the story of how I was harassed, part I.",
            "latitude": 42.23424364766,
            "longitude": 21.13243546545
            
        },
        {
            "timestamp" : "2016-01-26T14:29:22.091Z",
            "types" :[
                "Whistling"
            ],
            "location" : "Work",
            "perpetrator": "Co-worker",
            "perpetratorGender": "Male",
            "story" : "This is the story of how I was harassed, part II.",
            "latitude": 42.24424364766,
            "longitude": 21.14243546545
        },
        {
            "timestamp" : "2016-01-27T14:29:22.091Z",
            "types" :[
                "Stalking"
            ],
            "location" : "Public Space",
            "perpetrator": "Stranger",
            "perpetratorGender": "Male",
            "story" : "This is the story of how I was harassed, part III.",
            "latitude": 42.25424364766,
            "longitude": 21.15243546545
        }
    ]
}
``` 

## Fetch Harassments
### POST  /api/harassment/get

##### URL geolocation property

| Property      | Type          | Description                                                   |
| ------------- |---------------| --------------------------------------------------------------|
| geolocated    | Boolean       | A flag to include geo or non-geo located harassments.         |

e.g. /api/harassment/all/?geolocated=1
e.g. /api/harassment/all/?geolocated=0

##### JSON request body filter parameters 
| Property      | Type          | Description                                                   |
| ------------- |---------------| --------------------------------------------------------------|
| types         | List<String>  | The harassment types that are to be included in the result.   |
| locations     | List<String>  | The location types that are to be included in the result.     |
| perpetrators  | List<String>  | The prepetrator types that are to be included in the result.  |
| perpetratorGenders  | List<String>  | The prepetrator genders that are to be included in the result.  |
| from          | Date String   | How far back to query. Must be formatted as yyyy-mm-dd.       |
| to            | Date String   | Until which date to query. Must be formatted as yyyy-mm-dd.   |
| country       | String        | The victim's country of residence.                            |
| region        | String        | The victim's region of residence.                             |
| city          | String        | The victim's city of residence.                               |
| ethnicity     | String        | The victim's ethnicity.                                       |
| nationality   | String        | The victim's nationality.                                     |
| gender        | String        | The victim's gender.                                          |



# Retrieve Distribution
Retrieving distribution data of reported harassment are POST requests.
Each POST requests include a JSON message body that contains filter parameters (e.g. date range).

### POST  /api/harassment/distribution/type
| Property      | Type          | Description                                                   |
| ------------- |---------------| --------------------------------------------------------------|
| locations     | List<String>  | The location types that are to be included in the result.     |
| perpetrators  | List<String>  | The prepetrator types that are to be included in the result.  |
| perpetratorGenders  | List<String>  | The prepetrator genders that are to be included in the result.  |
| from          | Date String   | How far back to query. Must be formatted as yyyy-mm-dd.       |
| to            | Date String   | Until which date to query. Must be formatted as yyyy-mm-dd.   |
| region        | String        | The victim's region.                                          |
| locality      | String        | The victim's locality.                                        |
| ethnicity     | String        | The victim's ethnicity.                                       |
| nationality   | String        | The victim's nationality.                                     |
| gender        | String        | The victim's gender.                                          |

Sample POST message body:
```json
{
    "locations": ["School", "University"],
    "perpetrators": ["Teacher / Professor"],
    "from": "2016-01-01",
    "to": "2016-01-31",
    "region": "Kosovo",
    "locality": "Ferizaj",
    "ethnicity": "Albanian",
    "nationality": "Kosovo",
    "gender": "Female",
    "language": "English"
}
```

### POST  /api/harassment/distribution/location

| Property      | Type          | Description                                                   |
| ------------- |---------------| --------------------------------------------------------------|
| types         | List<String>  | The harassment types that are to be included in the result.   |
| perpetrators  | List<String>  | The prepetrator types that are to be included in the result.  |
| perpetratorGenders  | List<String>  | The prepetrator genders that are to be included in the result.  |
| from          | Date String   | How far back to query. Must be formatted as yyyy-mm-dd.       |
| to            | Date String   | Until which date to query. Must be formatted as yyyy-mm-dd.   |
| region        | String        | The victim's region.                                          |
| locality      | String        | The victim's locality.                                        |
| ethnicity     | String        | The victim's ethnicity.                                       |
| nationality   | String        | The victim's nationality.                                     |
| gender        | String        | The victim's gender.                                          |

Sample POST message body:
```json
{
    "types": ["Stalking", "Touching"],
    "perpetrators": ["Teacher / Professor"],
    "from": "2016-01-01",
    "to": "2016-01-31",
    "region": "Kosovo",
    "locality": "Ferizaj",
    "ethnicity": "Albanian",
    "nationality": "Kosovo",
    "gender": "Female",
    "language": "English"
}
```

### POST  /api/harassment/distribution/perpetrator

| Property      | Type          | Description                                                   |
| ------------- |---------------| --------------------------------------------------------------|
| types         | List<String>  | The harassment types that are to be included in the result.   |
| locations     | List<String>  | The location types that are to be included in the result.     |
| perpetratorGenders  | List<String>  | The prepetrator genders that are to be included in the result.  |
| from          | Date String   | How far back to query. Must be formatted as yyyy-mm-dd.       |
| to            | Date String   | Until which date to query. Must be formatted as yyyy-mm-dd.   |
| region        | String        | The victim's region.                                          |
| locality      | String        | The victim's locality.                                        |
| ethnicity     | String        | The victim's ethnicity.                                       |
| nationality   | String        | The victim's nationality.                                     |
| gender        | String        | The victim's gender.                                          |

Sample POST message body:
```json
{
    "types": ["Stalking", "Touching"],
    "locations": ["School", "University"],
    "from": "2016-01-01",
    "to": "2016-01-31",
    "region": "Kosovo",
    "locality": "Ferizaj",
    "ethnicity": "Albanian",
    "nationality": "Kosovo",
    "gender": "Female",
    "language": "English"
}
```

### POST  /api/harassment/distribution/period (Not Implemented)
| Property      | Type          | Description                                                   |
| ------------- |---------------| --------------------------------------------------------------|
| types         | List<String>  | The harassment types that are to be included in the result.   |
| locations     | List<String>  | The location types that are to be included in the result.     |
| perpetrators  | List<String>  | The prepetrator types that are to be included in the result.  |
| perpetratorGenders  | List<String>  | The prepetrator genders that are to be included in the result.  |
| from          | Date String   | How far back to query. Must be formatted as yyyy-mm-dd.       |
| to            | Date String   | Until which date to query. Must be formatted as yyyy-mm-dd.   |
| period        | String        | The type of period to distribute harassments.                 |
| region        | String        | The victim's region.                                          |
| locality      | String        | The victim's locality.                                        |
| ethnicity     | String        | The victim's ethnicity.                                       |
| nationality   | String        | The victim's nationality.                                     |
| gender        | String        | The victim's gender.                                          |

Sample POST message body:
```json
{
    "types": ["Stalking", "Touching"],
    "locations": ["School", "University"],
    "perpetrators": ["Teacher / Professor"],
    "from": "2016-01-01",
    "to": "2016-01-31",
    "period": "season",
    "region": "Kosovo",
    "locality": "Ferizaj",
    "ethnicity": "Albanian",
    "nationality": "Kosovo",
    "gender": "Female",
    "language": "English"
}
```

The options for 'period' are:
 - hour
 - day
 - month
 - season

### POST  /api/harassment/distribution/victim

| Property      | Type          | Description                                                   |
| ------------- |---------------| --------------------------------------------------------------|
| types         | List<String>  | The harassment types that are to be included in the result.   |
| locations     | List<String>  | The location types that are to be included in the result.     |
| perpetrators  | List<String>  | The prepetrator types that are to be included in the result.  |
| perpetratorGenders  | List<String>  | The prepetrator genders that are to be included in the result.  |
| from          | Date String   | How far back to query. Must be formatted as yyyy-mm-dd.       |
| to            | Date String   | Until which date to query. Must be formatted as yyyy-mm-dd.   |
| property      | String        | The victim property to based the distribution with.           |
| region        | String        | The victim's region.                                          |
| locality      | String        | The victim's locality.                                        |
| ethnicity     | String        | The victim's ethnicity.                                       |
| nationality   | String        | The victim's nationality.                                     |
| gender        | String        | The victim's gender.                                          |

The options for 'property' are:
 - age
 - birthday
 - region
 - locality
 - ethnicity
 - gender
 - language
 - nationality
 - region

Sample POST message body:
```json
{
    "types": ["Stalking", "Touching"],
    "locations": ["School", "University"],
    "perpetrators": ["Teacher / Professor"],
    "from": "2016-01-01",
    "to": "2016-01-31",
    "property": "age",
    "region": "Kosovo",
    "locality": "Ferizaj",
    "ethnicity": "Albanian",
    "nationality": "Kosovo",
    "gender": "Female",
    "language": "English"
}
```
