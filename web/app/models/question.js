var Question = Backbone.Model.extend({
    model_name: "category",
    defaults: {
		text: "",
        possibleAnswers: Answers
    },
    initialize: function(){}
});

var Questions = Backbone.Collection.extend({
    model: Question
});
