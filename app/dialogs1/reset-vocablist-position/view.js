var GelatoDialog = require('gelato/dialog');
var Vocablists = require('collections/vocablists');

/**
 * @class ResetVocablistPositionDialog
 * @extends {GelatoDialog}
 */
var ResetVocablistPositionDialog = GelatoDialog.extend({
  /**
   * @method initialize
   * @param {Object} options
   */
  initialize: function(options) {
    this.vocablists = new Vocablists();
  },
  /**
   * @property events
   * @type {Object}
   */
  events: {
    'click #button-cancel': 'handleClickButtonCancel',
    'click #button-reset': 'handleClickButtonReset'
  },
  /**
   * @property template
   * @type {Function}
   */
  template: require('./template'),
  /**
   * @method render
   * @returns {ResetVocablistPositionDialog}
   */
  render: function() {
    this.renderTemplate();
    return this;
  },
  /**
   * @method handleClickButtonCancel
   * @param {Event} event
   */
  handleClickButtonCancel: function(event) {
    event.preventDefault();
    this.close();
  },
  /**
   * @method handleClickButtonReset
   * @param {Event} event
   */
  handleClickButtonReset: function(event) {
    var self = this;
    event.preventDefault();
    async.series(
      [
        function(callback) {
          self.loadVocablists(callback);
        },
        function(callback) {
          self.vocablists.resetAllPositions(callback);
        }
      ],
      function() {
        self.close()
      }
    );
  },
  /**
   * @method loadVocablists
   */
  loadVocablists: function(callback) {
    var self = this;
    async.parallel(
      [
        function(callback) {
          self.vocablists.fetch({
            data: {
              sort: 'studying'
            },
            remove: false,
            error: function(error) {
              callback(error);
            },
            success: function() {
              callback();
            }
          });
        }
      ],
      callback
    );
  }
});

module.exports = ResetVocablistPositionDialog;
