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

        return this
    },
    events: {
        "click #btn_save": "dataHandler",
        "change #category": "categorySwitch"
    },
    dataHandler: function () {

        var answers_json = {};

        var answers_array = [];
        $(".question").each(function () {
            var name = $(".question").find("div").find("h2").text().trim();
            var selected_answer = $("input[name='" + name + "']:checked").prop("value");
            answers_json[name] = selected_answer;
            answers_array.push(selected_answer);
//                alert($(':radio:checked').map(function() {
//                return this.name + ': '+  this.value;
//                }).get());;
        });
        if (answers_array.indexOf(undefined) != -1) {
            alert("You must fill all of the fields to continue.!");
        }
        else {
            // Switch to result view
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
        $(options.element).html(this.template({options: options.data}));
    }
});

function initCategoriesWithQuestions(el, template) {
    readTextFile("app/static/questions.json", function (text) {
        var json_data = JSON.parse(text);
        var questions_json = {};

        var categories = new Categories([]);
        for (var category in json_data){
            var questions = new Questions([]);
            //console.log(category);
            for (var question in json_data[category]){
                var question_text = json_data[category][question]['question'];
                var question = getQuestion(question_text, ["Slažem se", "Ne slažem se", "Nemam stav"]);
                questions.push(question);
            }
            var question_category = new Category({"name": category, "questions": questions});
            categories.push(question_category);
        }
        console.log(questions_json);
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
        var answer = new Answer({text: answers[i], value: answers[i].toLowerCase()});
        answers_collection.push(answer);
    }
    return answers_collection;
}
