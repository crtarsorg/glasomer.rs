var Question = Backbone.Model.extend({
    defaults: {
		name: ""
    },
    initialize: function(){}
});

var Questions = Backbone.Collection.extend({
    model: Question
});
