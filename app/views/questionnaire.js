window.QuestionnaireView = Backbone.View.extend({
    template: JST["app/templates/questionnaire.hbs"],
    initialize: function () {
        this.render();
    },
    render: function () {
        var q1 = new Question({name: "Lorem ipsum dolor sit amet 1?"});
        var q2 = new Question({name: "Lorem ipsum dolor sit amet 2?"});
        var q3 = new Question({name: "Lorem ipsum dolor sit amet 3?"});
        var q4 = new Question({name: "Lorem ipsum dolor sit amet 4?"});

        var questions = new Questions([q1, q2, q3, q4]);
        $(this.el).html(this.template({questions: questions.toJSON()}));
        return this
    }
});