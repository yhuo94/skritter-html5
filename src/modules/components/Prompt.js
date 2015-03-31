/**
 * @module Application
 * @submodule Components
 */
define([
    'require.text!templates/components/prompt.html',
    'core/modules/GelatoComponent',
    'modules/components/PromptDetail',
    'modules/components/PromptGrading',
    'modules/components/PromptNavigation',
    'modules/components/PromptToolbar',
    'modules/components/WritingCanvas'
], function(Template, GelatoComponent, PromptDetail, PromptGrading, PromptNavigation, PromptToolbar, WritingCanvas) {

    /**
     * @class Prompt
     * @extends GelatoComponent
     */
    var Prompt = GelatoComponent.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.canvas = new WritingCanvas();
            this.detail = new PromptDetail({prompt: this});
            this.grading = new PromptGrading({prompt: this});
            this.gradingColors = app.user.settings.get('gradingColors');
            this.navigation = new PromptNavigation({prompt: this});
            this.part = 'rune';
            this.position = 1;
            this.result = null;
            this.toolbar = new PromptToolbar({prompt: this});
            this.vocab = null;
            this.listenTo(this.canvas, 'canvas:click', this.handleClickCanvas);
            this.listenTo(this.canvas, 'input:up', this.handleInputUp);
            this.on('resize', this.resize);
        },
        /**
         * @method render
         * @returns {Prompt}
         */
        render: function() {
            this.renderTemplate(Template);
            this.canvas.setElement('.writing-canvas-container').render();
            this.detail.setElement('.prompt-detail-container').render();
            this.grading.setElement('.prompt-grading-container').render();
            this.navigation.setElement('.prompt-navigation-container').render();
            this.toolbar.setElement('.prompt-toolbar-container').render();
            this.resize();
            return this;
        },
        /**
         * @method renderPrompt
         * @returns {Prompt}
         */
        renderPrompt: function() {
            this.canvas.reset();
            switch (this.part) {
                case 'defn':
                    this.renderPromptDefn();
                    break;
                case 'rdng':
                    this.renderPromptRdng();
                    break;
                case 'rune':
                    this.renderPromptRune();
                    break;
                case 'tone':
                    this.renderPromptTone();
                    break;
            }
            return this;
        },
        /**
         * @method renderPromptDefn
         * @returns {Prompt}
         */
        renderPromptDefn: function() {
            this.canvas.disableGrid();
            this.detail.showCharacters();
            this.detail.showReading();
            if (this.active().get('complete')) {
                this.$('.answer-text').html(this.vocab.getDefinition());
                this.$('.question-text').css('visibility', 'hidden');
            } else {
                this.$('.question-text').text("What's the definition?");
                this.$('.question-text').css('visibility', 'visible');
            }
            this.$('.question-word').text(this.vocab.get('writing'));
            this.$('.text-overlay').show();
            return this;
        },
        /**
         * @method renderPromptRdng
         * @returns {Prompt}
         */
        renderPromptRdng: function() {
            this.canvas.disableGrid();
            this.detail.hideReading();
            this.detail.showCharacters();
            if (this.active().get('complete')) {
                this.$('.answer-text').html(this.vocab.getReading());
                this.$('.question-text').css('visibility', 'hidden');
            } else {
                this.$('.question-text').text("What's the reading?");
                this.$('.question-text').css('visibility', 'visible');
            }
            this.$('.question-word').text(this.vocab.get('writing'));
            this.$('.text-overlay').show();
            return this;
        },
        /**
         * @method renderPromptRune
         * @returns {Prompt}
         */
        renderPromptRune: function() {
            var character = this.character().getShape();
            this.canvas.enableGrid();
            this.canvas.drawShape('surface', character);
            this.detail.selectCharacter(this.position);
            this.detail.showReading();
            this.$('.text-overlay').hide();
            if (this.character().isComplete()) {
                this.canvas.disableInput();
                this.canvas.injectLayerColor('surface', this.getGradingColor());
                this.active().set('complete', true);
            } else {
                this.active().set('complete', false);
                this.canvas.enableInput();
            }
            return this;
        },
        /**
         * @method renderPromptTone
         * @returns {Prompt}
         */
        renderPromptTone: function() {
            var writing = this.vocab.getCharacters()[this.position - 1];
            this.canvas.disableGrid();
            this.canvas.drawShape('surface', this.character().getShape());
            this.canvas.drawCharacter('surface-background2', writing, {color: '#ebeaf0'});
            this.detail.selectReading(this.position);
            this.detail.showCharacters();
            this.$('.text-overlay').hide();
            if (this.character().isComplete()) {
                this.canvas.disableInput();
                this.canvas.injectLayerColor('surface', this.getGradingColor());
                this.detail.showReading(this.position);
                this.active().set('complete', true);
            } else {
                this.active().set('complete', false);
                this.canvas.enableInput();
            }
            return this;
        },
        /**
         * @method active
         * @returns {PromptResult}
         */
        active: function() {
            return this.result.at(this.position - 1);
        },
        /**
         * @method character
         * @returns {CanvasCharacter}
         */
        character: function() {
            return this.active().get('character');
        },
        /**
         * @method getGradingColor
         * @returns {String}
         */
        getGradingColor: function() {
            return this.gradingColors[this.active().get('score')];
        },
        /**
         * @method handleClickCanvas
         */
        handleClickCanvas: function() {
            if (this.active().get('complete')) {
                this.next();
            } else if (this.part === 'defn') {
                this.active().set('complete', true);
                this.renderPrompt();
            } else if (this.part === 'rdng') {
                this.active().set('complete', true);
                this.renderPrompt();
            }
        },
        /**
         * @method handleInputUp
         * @param {Array} points
         * @param {createjs.Shape} shape
         */
        handleInputUp: function(points, shape) {
            switch (this.part) {
                case 'rune':
                    this.recognizeRune(points, shape);
                    break;
                case 'tone':
                    this.recognizeTone(points, shape);
                    break;
            }
        },
        /**
         * @method recognizeRune
         * @param {Array} points
         * @param {createjs.Shape} shape
         */
        recognizeRune: function(points, shape) {
            var stroke = this.character().recognize(points, shape);
            if (stroke) {
                var targetShape = stroke.getShape();
                var userShape = stroke.getUserShape();
                this.canvas.tweenShape('surface', userShape, targetShape);
                if (this.character().isComplete()) {
                    this.active().set('complete', true);
                    this.canvas.disableInput();
                    this.canvas.injectLayerColor('surface', this.getGradingColor());
                    this.detail.showCharacters(this.position);
                }
            }
        },
        /**
         * @method recognizeTone
         * @param {Array} points
         * @param {createjs.Shape} shape
         */
        recognizeTone: function(points, shape) {
            var stroke = this.character().recognize(points, shape);
            if (stroke) {
                var tones = this.vocab.getToneNumbers()[this.position - 1];
                if (tones.indexOf(stroke.get('tone')) > -1) {
                    var targetShape = stroke.getShape();
                    var userShape = stroke.getUserShape();
                    this.canvas.tweenShape('surface', userShape, targetShape);
                } else {
                    this.character().reset();
                    this.character().add(this.character().getTone(tones[0]).clone());
                    this.canvas.drawShape('surface', this.character().at(0).getShape());
                }
                if (this.character().isComplete()) {
                    this.active().set('complete', true);
                    this.canvas.disableInput();
                    this.canvas.injectLayerColor('surface', this.getGradingColor());
                    this.detail.showReading(this.position);
                }
            }
        },
        /**
         * @method hideBannerNew
         * @returns {Prompt}
         */
        hideBannerNew: function() {
            this.$('.prompt-banner-new').hide();
            return this;
        },
        /**
         * @method isFirst
         * @returns {Boolean}
         */
        isFirst: function() {
            return this.position === 1;
        },
        /**
         * @method isLast
         * @returns {Boolean}
         */
        isLast: function() {
            return this.position >= this.result.length;
        },
        /**
         * @method next
         * @returns {Prompt}
         */
        next: function() {
            if (this.isLast()) {
                console.log('POSITION', 'LAST');
                this.trigger('prompt:complete');
            } else {
                this.position++;
                this.renderPrompt();
            }
            return this;
        },
        /**
         * @method previous
         * @returns {Prompt}
         */
        previous: function() {
            if (this.isFirst()) {
                console.log('POSITION', 'FIRST');
            } else {
                this.position--;
                this.renderPrompt();
            }
            return this;
        },
        /**
         * @method remove
         * @returns {Prompt}
         */
        remove: function() {
            this.canvas.remove();
            return GelatoComponent.prototype.remove.call(this);
        },
        /**
         * @method resize
         * @returns {Prompt}
         */
        resize: function() {
            this.canvas.resize(this.$('.center-column').width());
            if (this.result) {
                this.renderPrompt();
            }
            return this;
        },
        /**
         * @method set
         * @param {DataVocab} vocab
         * @param {String} part
         * @param {Boolean} isNew
         * @returns {Prompt}
         */
        set: function(vocab, part, isNew) {
            console.log('PROMPT:', vocab.id, part, vocab);
            this.result = vocab.getPromptResult(part);
            this.part = part;
            this.vocab = vocab;
            this.position = 1;
            if (isNew) {
                this.showBannerNew();
            } else {
                this.hideBannerNew();
            }
            this.detail.renderFields();
            this.renderPrompt();
            return this;
        },
        /**
         * @method showBannerNew
         * @returns {Prompt}
         */
        showBannerNew: function() {
            this.$('.prompt-banner-new').show();
            return this;
        }
    });

    return Prompt;

});