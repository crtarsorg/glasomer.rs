window.QuestionnaireView = Backbone.View.extend({
    template: JST["app/templates/questionnaire.hbs"],
    initialize: function () {
        this.render();
    },
    render: function () {
        var q1 = getQuestion("Lorem ipsum dolor sit amet 1?", ["Yes", "No", "No Answer"]);
        var q2 = getQuestion("Lorem ipsum dolor sit amet 2?", ["Yes", "No"]);

        Handlebars.registerHelper('setIndex', function (value) {
            this.name = value;
        });

        var questions = new Questions([q1, q2]);
        var jsonString = JSON.stringify(questions.toJSON());
        $(this.el).html(this.template({questions: JSON.parse(jsonString)}));
        return this
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