(function (window) {
  var Mel = window.Mel = {
    Model: {}, View: {}, Collection: {}
  };

  Mel.tmpl = function (name, context) {
    return JST['admin/templates/' + name](context);
  };

  $.fn.serializeObject = function () {
    var ob = {};
    _.each(this.serializeArray(), function (field) {
      ob[field.name] = field.value;
    });
    return ob;
  };

  $(function () {
    var MelView = Mel.View.Mel = Backbone.View.extend({

      el: $('main'),
      $win: $(window),
      $body: $(document.body),
      views: [],

      events: {
        'click button': 'create',
        'click': 'anyClick',
        'keydown .search': 'filter'
      },

      initialize: function () {
        this.setSource('Bank');
      },

      render: function () {

      },

      setSource: function (model) {
        this.dataList = new Mel.Collection[model];
        this.dataRowView = Mel.View[model];
        this.dataEditView = Mel.View[model + "Full"];

        this.listenTo(this.dataList, 'add', this.addOne);
        this.listenTo(this.dataList, 'reset', this.addAll);
        this.listenTo(this.dataList, 'all', this.render);

        this.dataList.fetch();
      },

      addOne: function (ob) {
        var view = new this.dataRowView({model: ob});
        this.$('data').append(view.render().el);
        this.listenTo(view, 'edit', this.editOne);
        this.views.push(view);
      },

      addAll: function () {
        this.dataList.each(this.addOne, this);
      },

      create: function () {
        this.dataList.create();
      },

      editOne: function (ob) {
        var view = new this.dataEditView({model: ob});
        view.render();
        view.$el.hide().css({top: window.scrollY + this.$win.height()});
        this.$el.append(view.el);
        view.$el.show().animate({top: window.scrollY + 80}, 200);
      },

      anyClick: function (e) {
        this.trigger('anyClick', e);
      },

      clear: function () {
        _.each(this.views, function (view) {
          view.remove();
        });
      },

      filter: function (e) {
        var val = this.$('.search').val();
        var list;

        this.clear();

        if (val) {
          list = this.dataList.search(val);
          _.each(list, this.addOne, this);
        }
        else {
          this.addAll();
        }
      }
    });

    Backbone.history.start({pushState: true, root: '/admin/'});
    Mel.App = new Mel.View.Mel;
  });

}(window));
