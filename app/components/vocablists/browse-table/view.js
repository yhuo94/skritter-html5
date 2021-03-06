var GelatoComponent = require('gelato/component');
var Vocablists = require('collections/vocablists');

/**
 * @class VocablistBrowseTable
 * @extends {GelatoComponent}
 */
  module.exports = GelatoComponent.extend({
    /**
     * @property events
     * @typeof {Object}
     */
    events: {
      'click #title-sort': 'handleClickTitleSort',
      'click #popularity-sort': 'handleClickPopularitySort',
      'click .add-to-queue-link': 'handleClickAddToQueueLink'
    },

    /**
     * @property template
     * @type {Function}
     */
    template: require('./template'),

  /**
   * @method initialize
   * @constructor
   */
  initialize: function() {
    this._lists = [];
    this._filterString = '';
    this._filterType = [];
    this._layout = 'list';
    this._sortType = 'popularity';
    this.vocablists = new Vocablists();
    this.listenTo(this.vocablists, 'state', this.render);
    var data = {
      sort: 'official',
      lang: app.getLanguage()
    };
    this.vocablists.fetch({data: data});
    this.listenTo(this.vocablists, 'sync', function() {
      if (this.vocablists.cursor) {
        data.cursor = this.vocablists.cursor;
        this.vocablists.fetch({data: data, remove: false})
      }
    });
  },

  /**
   * @method render
   * @returns {VocablistTable}
   */
  render: function() {
    this.update();
    this.renderTemplate();
    this.$('#grid img').error(this.handleLoadImageError);
    this.delegateEvents();
    return this;
  },

  /**
   * @method handleClickTitleSort
   * @param {Event} event
   */
  handleClickTitleSort: function(event) {
    event.preventDefault();
    this._sortType = 'title';
    this.render();
  },

  /**
   * @method handleClickPopularitySort
   * @param {Event} event
   */
  handleClickPopularitySort: function(event) {
    event.preventDefault();
    this._sortType = 'popularity';
    this.render();
  },

  /**
   * @method handleClickAddToQueueLink
   * @param {Event} event
   */
  handleClickAddToQueueLink: function(event) {
    event.preventDefault();
    var listId = $(event.currentTarget).data('vocablist-id');
    var vocablist = this.vocablists.get(listId);
    if (vocablist.get('studyingMode') === 'not studying') {
      vocablist.justAdded = true;
      vocablist.save({'studyingMode': 'adding'}, {patch: true});
      this.render();
    }
  },

  /**
   * @method handleLoadImageError
   * @param {Event} event
   */
  handleLoadImageError: function(event) {
    $(event.target).remove();
  },

  /**
   * @method setFilterString
   * @param {String} value
   */
  setFilterString: function(value) {
    this._filterString = value.toLowerCase();
    this.render();
  },

  /**
   * @method setLayout
   * @param {String} value
   */
  setLayout: function(value) {
    this._layout = value.toLowerCase();
    this.render();
  },

  /**
   * @method update
   * @returns {VocablistBrowseTable}
   */
  update: function() {
    this._lists = this.vocablists.models;
    this.updateFilter();
    this.updateSort();
    return this;
  },

  /**
   * @method updateFilter
   */
  updateFilter: function() {
    this._lists = _.filter(this._lists, (function(vocablist) {
      if (this._filterString !== '') {
        var name = vocablist.get('name').toLowerCase();
        var shortName = vocablist.get('shortName').toLowerCase();

        if (_.includes(name, this._filterString)) {
          return true;
        }

        return _.includes(shortName, this._filterString);
      }

      if (this._filterType.length) {
        //TODO: support checkbox filters
        return false;
      }
      return true;
    }).bind(this));
  },
    
  /**
   * @method updateSort
   */
  updateSort: function() {
    this._lists = _.sortBy(this._lists, (function(vocablist) {
      if (this._sortType === 'popularity') {
        return -vocablist.get('peopleStudying');
      }
      return vocablist.get('name');
    }).bind(this));
  }
});
