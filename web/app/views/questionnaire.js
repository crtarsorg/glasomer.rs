window.QuestionnaireView = Backbone.View.extend({
    template: JST["app/templates/questionnaire.hbs"],
    initialize: function () {
        this.render();
    },
    render: function () {
        var q1 = getQuestion("Lorem ipsum dolor sit amet 1?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        var q2 = getQuestion("Lorem ipsum dolor sit amet 2?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        var q3 = getQuestion("Lorem ipsum dolor sit amet 4?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        var q4 = getQuestion("Lorem ipsum dolor sit amet 5?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        var q5 = getQuestion("Lorem ipsum dolor sit amet 6?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        var q6 = getQuestion("Lorem ipsum dolor sit amet 7?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        var q7 = getQuestion("Lorem ipsum dolor sit amet 8?", ["Slažem se", "Ne slažem se", "Nemam stav"]);
        var q8 = getQuestion("Lorem ipsum dolor sit amet 9?", ["Slažem se", "Ne slažem se", "Nemam stav"]);

        Handlebars.registerHelper('setIndex', function (value) {
            this.name = value;
        });

        var questions = new Questions([q1, q2, q3, q4, q5, q6, q7, q8]);
        var jsonString = JSON.stringify(questions.toJSON());
        $(this.el).html(this.template({questions: JSON.parse(jsonString)}));
        return this
    },
    events: {
        "click #btn_save": "saveData",
        "change ": "questionSwitch"
    },
    saveData: function() {

    },
    questionSwitch: function() {


    }

});

function getQuestion(text, answers) {
    var possible_answers = getAnswers(answers);
    return new Question({text: text, possibleAnswers: possible_answers});
}

function getAnswers(answers){
    var answers_collection = new Answers([]);
    for (var i = 0; i < answers.length; i++){
        var answer = new Answer({text: answers[i], value: answers[i].toLowerCase()});
        answers_collection.push(answer);
    }
    return answers_collection;
}