var Category = Backbone.Model.extend({
    defaults: {
        name: "",
		questions: Questions
    },
    initialize: function(){}
});

var Categories = Backbone.Collection.extend({
    model: Category
});