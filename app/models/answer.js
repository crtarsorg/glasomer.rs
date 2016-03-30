var Answer = Backbone.Model.extend({
    model_name: 'Answer',
    defaults: {
		text: "",
        value: ["Slažem se", "Ne slažem se", "Nemam stav"]
    },
    initialize: function(){}
});

var Answers = Backbone.Collection.extend({
    model: Answer
});
