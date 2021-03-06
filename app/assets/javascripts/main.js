(function () {
  window.BS = {
    Model: {}, View: {}, List: {}
  };

  BS.tmpl = function (name, context) {
    return JST['templates/' + name](context);
  };

  $(function () {
    var BankSearch = Backbone.View.extend({
      el: $('body'),

      $window: $(window),
      $search: $('.search'),
      query: '',

      events: {
        'keydown .search .query': 'filter',
        'change .search .query': 'filter',
        'change .search-panel input': 'filter',
        'change .search-panel select': 'filter',
        'change .search .address': 'changeAddress',
        'keydown .search .address': 'enterAddress',
        'click .bank-row': 'clickBank',
        'click .bank-info': 'clickBank',
        'click .search-button': 'changeAddress',
        'click .search-panel-open': 'showQs',
        'click .search-panel-hide': 'hideQs',
        'click .bank-more-link a': 'moreInfo',
        'click .bank-less-link a': 'lessInfo'
      },

      initialize: function () {
        var self = this;

        $('.email').each(function () {
          var $el = $(this);
          var text = $el.text();
          var $link = $('<a/>');

          $link.attr('href', 'mailto:' + $el.data('email').replace('ON', '@').replace('DOT', '.'))
            .text(text);

          $el.html($link);
        });

        if (!$('body').hasClass('index')) {
          return;
        }

        this.banks = new BS.List.Bank;
        this.bank_companies = new BS.List.BankCompany;
        this.map = new BS.View.Map({el: $('.g-map'), app: this});

        this.listenTo(this.banks, 'reset', this.filter);
        this.listenTo(this.map, 'clickMarker', this.showBank);

        this.$window.resize(_.bind(_.throttle(this.resize, 100), this));

        $(window).scroll(_.debounce(_.bind(this.scrolled, this), 500));

        // we shouldn't show the dialog until we have spanish copy
        return;
        this.introModal = new BS.View.Modal();
        this.introModal.render();
      },

      fetch: function () {
        var filter = _.after(2, _.bind(this.filter, this));
        this.banks.fetch({success: filter});
        this.bank_companies.fetch({success: filter});
      },

      showQs: function (e) {
        $('.search-panel-open').hide();
        $('.search-panel').show();
        e.preventDefault();
      },
      hideQs: function (e) {
        $('.search-panel').hide();
        $('.search-panel-open').show();
        e.preventDefault();
      },

      clear: function () {

      },

      clearAddress: function () {

      },

      enterAddress: function (e) {
        if (e.which === 13) {
          this.changeAddress(e);
        }
      },

      changeAddress: function (e) {
        var self = this,
            params = this.$search.serializeObject(),
            address = params.address;

        this.address = address;

        if (address) {
          this.map.geocode(this.address, function (info) {
            if (info) {
              self.address = info.address;
              self.$('.search .address').val(info.address);
              self.geopoint = info;
            }
            else {
              self.geopoint = null;
            }

            self.banks.sort();
            self.filter();
          });
        }
        else {
          this.geopoint = null;
          this.banks.sort();
          this.filter();
        }

        e.preventDefault();
      },

      filter: function () {
        var html = '',
            banks = [],
            params = this.$search.serializeObject();

        this.query = params.query;

        if (!params.mb) {
          params.mb = null;
        }
        else {
          params.mb = parseFloat(params.mb);
        }

        params.geopoint = this.geopoint;

        this.filteredBanks = this.banks.search(params);
        banks = this.filteredBanks.slice(0, 300);
        this.slicedBanks = new BS.List.Bank(banks);

        _.each(banks, function (bank) {
          html += BS.tmpl('bank_info', bank.fattributes());
        });

        this.$('.bank-list').html(html);

        if (banks.length) {
          this.currentRow = this.$('.bank-row').eq(0).addClass('selected');
        }

        this.trigger('filtered', this.filteredBanks);

        this.$window.scrollTop(0);
      },

      clickBank: function (e) {
        var $target = $(e.currentTarget),
            id = $target.data('id'),
            bank = this.filteredBanks.get(id);

        this.selectRow($('#bank-row-' + id));
        this.trigger('selectedBank', bank);
      },

      expandBank: function (bank) {
        if (this.bankView) {
          this.bankView.hideAndRemove();
        }

        this.bankView = (new BS.View.Bank({bank: bank})).render();

        //this.$('.bank-list').append(this.bankView.$el);

        this.bankView.show();
        //$(window).scrollTo($bankRow);
      },

      showBank: function (bank) {
        var $row = this.$('#bank-row-' + bank.id);
        var top = $row.addClass('selected').offset().top;

        this.selectRow($row);
        this.$window.scrollTop(top - 85);
      },

      moreInfo: function (e) {
        $(e.target).parents('.bank-more').addClass('on');
      },

      lessInfo: function (e) {
        $(e.target).parents('.bank-more').removeClass('on');
      },

      // this feature is still a little too jumpy
      scrolled: function (e) {
        return;
        var index, mapped, $row;
        var $rows = this.$('.bank-row');
        var top = this.$window.scrollTop();

        mapped = _.map($rows, function (row) {
          return $(row).offset().top;
        });
        index = _.sortedIndex(mapped, top);

        $row = $rows.eq(index);

        this.selectRow($row);
        this.trigger('selectedBank', this.banks.get($row.data('id')));
      },

      selectRow: function ($row) {
        if (this.currentRow) {
          this.currentRow.removeClass('selected');
        }

        this.currentRow = $row.addClass('selected');
      },

      resize: function (e) {
        this.trigger('resize', e);
      }
    });

    BS.App = new BankSearch;
    BS.App.fetch();
  });
}());

