var GelatoPage = require('gelato/page');
var Vocabs = require('collections/vocabs');
var Prompt = require('components1/study/prompt/view');
var Navbar = require('navbars/default/view');

/**
 * @class Scratchpad
 * @extends {GelatoPage}
 */
module.exports = GelatoPage.extend({
    /**
     * @method initialize
     * @param {Object} options
     * @constructor
     */
    initialize: function(options) {
        this.navbar = new Navbar();
        this.part = options.part;
        this.prompt = new Prompt();
        this.vocabs = new Vocabs();
        this.vocabId = options.vocabId;
        this.load();
    },
    /**
     * @property events
     * @type Object
     */
    events: {},
    /**
     * @property template
     * @type {Function}
     */
    template: require('./template'),
    /**
     * @property title
     * @type {String}
     */
    title: 'Scratchpad - Skritter',
    /**
     * @method render
     * @returns {Scratchpad}
     */
    render: function() {
        this.renderTemplate();
        this.navbar.setElement('#navbar-container').render();
        this.prompt.setElement('#study-prompt-container').render();
        return this;
    },
    /**
     * @method load
     */
    load: function() {
        async.waterfall([
            _.bind(function(callback) {
                this.vocabs.fetch({
                    data: {
                        include_decomps: true,
                        include_sentences: true,
                        include_strokes: true,
                        ids: this.vocabId
                    },
                    error: function(vocabs, error) {
                        callback(error);
                    },
                    success: function(vocabs) {
                        callback(null, vocabs.at(0));
                    }
                });
            }, this),
            _.bind(function(vocab, callback) {
                if (vocab.has('containedVocabIds')) {
                    this.vocabs.fetch({
                        data: {
                            include_decomps: true,
                            include_sentences: true,
                            include_strokes: true,
                            ids: vocab.get('containedVocabIds').join('|')
                        },
                        error: function(error) {
                            callback(error);
                        },
                        remove: false,
                        success: function() {
                            callback(null, vocab);
                        }
                    });
                } else {
                    callback(null, vocab);
                }
            }, this)
        ],_.bind(function(error, vocab) {
            if (error) {
                //TODO: display error message to user
                console.error('SCRATCHPAD LOAD ERROR:', error);
            } else {
                this.reviews = vocab.getPromptReviews(this.part || 'rune');
                this.prompt.set(this.reviews);
            }
        }, this));
    },
    /**
     * @method remove
     * @returns {Study}
     */
    remove: function() {
        this.navbar.remove();
        this.prompt.remove();
        return GelatoPage.prototype.remove.call(this);
    }
});