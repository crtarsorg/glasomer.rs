window.QuestionnaireView = Backbone.View.extend({
    template: JST["app/templates/questionnaire.hbs"],
    initialize: function () {
        this.render();
    },
    render: function () {
        initCategoriesWithQuestions($(this.el), this.template);

        Handlebars.registerHelper('setIndex', function (value) {
            this.name = value;
        });

        Handlebars.registerHelper('if_eq', function (a, b, opts) {
            if (a == b)
                return opts.fn(this);
            else
                return opts.inverse(this);
        });
        return this
    },
    events: {
        "click #btn_save": "dataHandler",
        "change #category": "categorySwitch"
    },
    dataHandler: function () {

        var category = $("#category").val();
        var answers_array = [];
        $(".question").each(function () {
            var answers_json = {};
            var name = $(this).find("div").find("h2").text().trim();

            var selected_answer = $("input[name='" + name + "']:checked").val();

            answers_json = {
                question: name,
                answer: selected_answer
            };

            $(':radio:checked', '.question-fieldset').map(function() {

                var tmp_val;
                if(answers_json.answer != undefined){
                    tmp_val = this.value;
                }
                else{
                    tmp_val = undefined;
                }
                answers_json['importance_level'] = tmp_val;

            }).get();

            if(answers_json['question'] != ""){
                answers_array.push(answers_json);
            }

        });

        var checkboxes = [];
        $('input:checkbox.css-checkbox', ".increase_budget_chb").each(function () {

            var checkedValue = (this.checked ? $(this).val() : "");
            if (checkedValue != ""){
                checkboxes.push(checkedValue);
            }
        });

        var ch_b_json = {
            question: "Budžetski prioriti",
            answer: checkboxes
        };
        answers_array.push(ch_b_json);

        console.log(answers_array);
        if (answers_array.length == 0) {
            alert("You must fill all of the fields to continue.!");
        }
        else {
            // Switch to results' view
            var resultView = new ResultView({element: "#container", data: answers_array});
        }
    },
    categorySwitch: function () {
        var category = $("#category").val();
        $(".categories").each(function () {
            if ($(this).attr("id") == category){
                $(this).css("display", "block");
            } else {
                $(this).css("display", "none");
            }
        });

    }

});

window.ResultView = Backbone.View.extend({
    template: JST["app/templates/results.hbs"],
    initialize: function(options) {
        this.render(options);
    },
    render: function(options) {

        var matchingResult;
        var template = this.template;

        readTextFile("app/static/questions.json", function (respJson) {
            var json_handler = JSON.parse(respJson);
            var partyMatcher = {
                'Serbian Progressive Party': 0,
                'Socialist party of Serbia': 0,
                'Democratic Party': 0,
                'New Democratic Party': 0
            };
            // Calculate matching result
            for (var item in options.data){
                if(options.data[item]['question'] != '' && options.data[item]['answer'] != undefined){
                    matchingResult = calculateMatchingResult(json_handler, options.data[item]);
                    //console.log(matchingResult);
                    partyMatcher = {
                        'Serbian Progressive Party': partyMatcher['Serbian Progressive Party'] + matchingResult['Serbian Progressive Party'],
                        'Socialist party of Serbia': partyMatcher['Socialist party of Serbia'] + matchingResult['Socialist party of Serbia'],
                        'Democratic Party': partyMatcher['Democratic Party'] + matchingResult['Democratic Party'],
                        'New Democratic Party': partyMatcher['New Democratic Party'] + matchingResult['New Democratic Party']
                    };
                }

            }

            //var top_three_res = returnTopThreeHighestValues(partyMatcher);

            var resultJson = [];
            $.each(partyMatcher, function(key, value){
                var val = Math.round(value);
                var new_json = {
                    "partyName": key,
                    "matchingResult": val.toString() + "%"
                };
                resultJson.push(new_json);

            });
            resultJson = resultJson.sort(function(a, b) { return a.matchingResult < b.matchingResult ? 1 : -1; }).slice(0, 3);


            $(options.element).html(template({results: resultJson}));
        });

        $.ajax({
            type: "POST",
            url: "http://0.0.0.0:5001/api/save",
            data: JSON.stringify(options.data),
            contentType: "application/json"
        }).fail(function(err) {
            console.log('An error occurred!')
        });

    }
});

function calculateMatchingResult(politicianAnswers, userAnswer){

    // Constants used to calculate the matching results
    var SINGLE_MATCHING_QT = 0.943395;
    var DOUBLE_MATCHING_QT = 1.88679;

    var partyMatcher = {
        'Serbian Progressive Party': 0,
        'Socialist party of Serbia': 0,
        'Democratic Party': 0,
        'New Democratic Party': 0
    };

    $.each(politicianAnswers, function(key, item){

        if (item["question"] != "Budžetski prioriti" && userAnswer['question'] != "Budžetski prioriti") {

            $.each(item, function (key, party) {

                if (party['question'] == userAnswer['question']){

                    if (userAnswer['answer'] == party['politiciansAnswers']['Serbian Progressive Party']['answer']){
                        var first_match_qt = SINGLE_MATCHING_QT;
                        if(userAnswer['importance_level'] == party['politiciansAnswers']['Serbian Progressive Party']['importance']){
                            first_match_qt = first_match_qt + SINGLE_MATCHING_QT;
                        }
                        partyMatcher['Serbian Progressive Party'] = first_match_qt;
                    }

                    if (userAnswer['answer'] == party['politiciansAnswers']['Socialist party of Serbia']['answer']){

                        var first_match_qt = SINGLE_MATCHING_QT;
                        if (userAnswer['importance_level'] == party['politiciansAnswers']['Socialist party of Serbia']['importance']){
                            first_match_qt = first_match_qt + SINGLE_MATCHING_QT;
                        }
                        partyMatcher['Socialist party of Serbia'] = first_match_qt;
                    }

                    if (userAnswer['answer'] == party['politiciansAnswers']['Democratic Party']['answer']){
                        var first_match_qt = SINGLE_MATCHING_QT;
                        if (userAnswer['importance_level'] == party['politiciansAnswers']['Democratic Party']['importance']){
                            first_match_qt = first_match_qt + SINGLE_MATCHING_QT;
                        }
                        partyMatcher['Democratic Party'] = first_match_qt;
                    }

                    if (userAnswer['answer'] == party['politiciansAnswers']['New Democratic Party']['answer']){

                        var first_match_qt = SINGLE_MATCHING_QT;
                        if (userAnswer['importance_level'] == party['politiciansAnswers']['New Democratic Party']['importance']){
                            first_match_qt = first_match_qt + SINGLE_MATCHING_QT;
                        }

                        partyMatcher['New Democratic Party'] = first_match_qt;

                    }
                }
            });
        }
        else if (item["question"] == "Budžetski prioriti" && userAnswer['question'] == "Budžetski prioriti"){
            //console.log(item);
            //console.log(userAnswer);
            $.each(item['politiciansAnswers'], function (key, party) {

                $.each(party['increase'], function(indx, val){
                    if (isInArray(val, userAnswer['answer'])){
                        partyMatcher[key] = partyMatcher[key] + DOUBLE_MATCHING_QT;
                    }
                });
            });
        }
    });

    return partyMatcher;

}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function initCategoriesWithQuestions(el, template) {
    readTextFile("app/static/questions.json", function (text) {
        var json_data = JSON.parse(text);

        var categories = new Categories([]);
        for (var category in json_data){

            var questions = [];
            for (var question in json_data[category]){

                var question_text = json_data[category][question]['question'];
                var question = getQuestion(question_text, ["Slažem se", "Ne slažem se", "Nemam stav"]);
                questions.push(question);
            }
            var question_category = new Category({"name": category, "questions": questions});
            categories.push(question_category);
        }

        var jsonString = JSON.stringify(categories.toJSON());
        el.html(template({categories: JSON.parse(jsonString)}));

    })
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}

function getQuestion(text, answers) {
    var possible_answers = getAnswers(answers);
    return new Question({text: text, possibleAnswers: possible_answers});
}

function getAnswers(answers) {
    var answers_collection = new Answers([]);
    for (var i = 0; i < answers.length; i++) {
        var answer = new Answer({text: answers[i], value: answers[i]});
        answers_collection.push(answer);
    }
    return answers_collection;
}
