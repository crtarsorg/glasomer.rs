var Answer = Backbone.Model.extend({
    defaults: {
		text: "",
        value: ""
    },
    initialize: function(){}
});

var Answers = Backbone.Collection.extend({
    model: Answer
});
