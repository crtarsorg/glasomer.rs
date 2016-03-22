window.QuestionnaireView = Backbone.View.extend({
    template: JST["app/templates/questionnaire.hbs"],
    initialize: function () {
        this.render();
    },
    render: function () {
        initCategoriesWithQuestions($(this.el), this.template);
        //var q1 = getQuestion("Lorem ipsum dolor sit amet 1?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //var q2 = getQuestion("Lorem ipsum dolor sit amet 2?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //var q3 = getQuestion("Lorem ipsum dolor sit amet 4?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //var q4 = getQuestion("Lorem ipsum dolor sit amet 5?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //var q5 = getQuestion("Lorem ipsum dolor sit amet 6?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //var q6 = getQuestion("Lorem ipsum dolor sit amet 7?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //var q7 = getQuestion("Lorem ipsum dolor sit amet 8?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //var q8 = getQuestion("Lorem ipsum dolor sit amet 9?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        //
        Handlebars.registerHelper('setIndex', function (value) {
            this.name = value;
        });
        //
        //var questions = new Questions([q1, q2, q3, q4, q5, q6, q7, q8]);
        //
        //var category1 = new Category({"name": "Ekonomija", "questions": questions});
        //var category2 = new Category({"name": "Ekologija", "questions": questions});
        //var categories = new Categories([category1, category2]);
        //var jsonString = JSON.stringify(categories.toJSON());
        //console.log(JSON.parse(jsonString));
        //$(this.el).html(this.template({categories: JSON.parse(jsonString)}));
        return this
    },
    events: {
        "click #btn_save": "saveData",
        "change ": "questionSwitch"
    },
    saveData: function () {

    },
    questionSwitch: function () {


    }

});

function initCategoriesWithQuestions(el, template) {
    readTextFile("app/static/questions.json", function (text) {
        var json_data = JSON.parse(text);
        var questions_json = {};
        console.log(json_data);
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
    }
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