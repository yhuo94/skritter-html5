/**
 * @module Application
 */
define([
    'framework/BaseView'
], function(BaseView) {
    /**
     * @class Prompt
     * @extends {BaseView}
     */
    var Prompt = BaseView.extend({
        /**
         * @method initialize
         * @param {Object} [options]
         * @param {PromptController} controller
         * @param {DataReview} review
         * @constructor
         */
        initialize: function(options, controller, review) {
            this.canvas = controller.canvas;
            this.controller = controller;
            this.gradingButtons = controller.gradingButtons;
            this.item = undefined;
            this.position = 1;
            this.review = review;
            this.vocab = undefined;
        },
        /**
         * @property el
         * @type String
         */
        el: '.detail-container',
        /**
         * @method render
         * @returns {Prompt}
         */
        render: function() {
            this.item = this.review.getBaseItem();
            this.position = this.review.getPosition();
            this.vocab = this.review.getBaseVocab();
            this.renderElements();
            if (this.review.getAt('answered')) {
                this.renderAnswer();
            } else {
                this.renderQuestion();
            }
            this.reset().resize();
            return this;
        },
        /**
         * @method renderAnswer
         * @returns {Prompt}
         */
        renderAnswer: function() {
            app.timer.stop();
            this.review.setAt({
                answered: true,
                reviewTime: app.timer.getReviewTime(),
                thinkingTime: app.timer.getThinkingTime()
            });
            this.gradingButtons.select(this.review.getAt('score')).show();
            return this;
        },
        /**
         * @method renderElements
         * @returns {Prompt}
         */
        renderElements: function() {
            this.elements.fieldAnswer = this.$('.field-answer');
            this.elements.fieldDefinition = this.$('.field-definition');
            this.elements.fieldQuestion = this.$('.field-question');
            this.elements.fieldReading = this.$('.field-reading');
            this.elements.fieldWriting = this.$('.field-writing');
            return this;
        },
        /**
         * @method renderQuestion
         * @returns {Prompt}
         */
        renderQuestion: function() {
            app.timer.setLapOffset(this.review.getAt('reviewTime'));
            app.timer.start();
            this.review.setAt('answered', false);
            this.gradingButtons.hide();
            return this;
        },
        /**
         * @method events
         * @returns {Object}
         */
        events: _.extend({}, BaseView.prototype.events, {
            'vclick': 'handlePromptClicked'
        }),
        /**
         * @method enableCanvasListeners
         * @returns {Prompt}
         */
        enableListeners: function() {
            this.listenTo(this.canvas, 'canvas:click', this.handleCanvasClicked);
            this.listenTo(this.canvas, 'canvas:clickhold', this.handleCanvasHeld);
            this.listenTo(this.canvas, 'canvas:doubleclick', this.handleCanvasDoubleClicked);
            this.listenTo(this.canvas, 'canvas:swipeup', this.handleCanvasSwipeUp);
            this.listenTo(this.canvas, 'input:down', this.handleInputDown);
            this.listenTo(this.canvas, 'input:up', this.handleInputUp);
            this.listenTo(this.gradingButtons, 'complete', this.handleGradingButtonsCompleted);
            this.listenTo(this.gradingButtons, 'selected', this.handleGradingButtonsSelected);
            return this;
        },
        /**
         * @method handleGradingButtonsCompleted
         */
        handleGradingButtonsCompleted: function() {
            this.next();
        },
        /**
         * @method handleGradingButtonsSelected
         */
        handleGradingButtonsSelected: function(grade) {
            this.review.setAt('score', grade);
        },
        /**
         * @method handlePromptClicked
         * @param {Event} event
         */
        handlePromptClicked: function(event) {
            event.preventDefault();
        },
        /**
         * @method next
         */
        next: function() {
            if (this.review.isLast()) {
                this.controller.triggerNext();
            } else {
                this.review.next();
                this.render();
            }
        },
        /**
         * @method previous
         */
        previous: function() {
            if (this.review.isFirst()) {
                this.controller.triggerPrevious();
            } else {
                this.review.previous();
                this.render();
            }
        },
        /**
         * @method reset
         * @returns {Prompt}
         */
        reset: function() {
            this.stopListening();
            this.enableListeners();
            return this;
        },
        /**
         * @method resize
         * @returns {Prompt}
         */
        resize: function() {
            return this;
        }
    });

    return Prompt;
});
