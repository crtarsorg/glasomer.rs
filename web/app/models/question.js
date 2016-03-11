var Question = Backbone.Model.extend({
    defaults: {
		text: "",
        possibleAnswers: Answers
    },
    initialize: function(){}
});

var Questions = Backbone.Collection.extend({
    model: Question
});
