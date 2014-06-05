define([
    'require.text!template/prompt-canvas.html'
], function(template) {
    /**
     * @class PromptCanvas
     */
    var Canvas = Backbone.View.extend({
        /**
         * @method initialize
         */
        initialize: function() {
            this.element = {};
            this.gridColor = '#666666';
            this.lastMouseDownEvent = null;
            this.mouseDownEvent = null;
            this.mouseDownTimer = null;
            this.mouseMoveEvent = null;
            this.mouseUpEvent = null;
            this.size = 600;
            this.stage = {};
            this.strokeSize = 8;
            this.strokeCapStyle = 'round';
            this.strokeColor = '#000000';
            this.strokeJointStyle = 'round';
            this.textColor = '#000000';
            this.textFont = 'Arial';
            this.textSize = '12px';
        },
        /**
         * @method render
         * @returns {Backbone.View}
         */
        render: function() {
            this.$el.append(template);
            this.element.holder = this.$('.canvas-holder')[0];
            this.element.display = this.$('.canvas-display')[0];
            this.element.input = this.$('.canvas-input')[0];
            this.stage.display = this.createDisplayStage();
            this.stage.input = this.createInputStage();
            this.createLayer('grid');
            this.createLayer('background');
            this.createLayer('hint');
            this.createLayer('stroke');
            this.resize();
            createjs.Ticker.addEventListener('tick', this.stage.display);
            createjs.Touch.enable(this.stage.input);
            createjs.Ticker.setFPS(200);
            return this;
        },
        /**
         * @property {Object} events
         */
        events: {
            'vmousedown.Canvas .canvas-input': 'triggerCanvasMouseDown',
            'vmouseup.Canvas .canvas-input': 'triggerCanvasMouseUp'
        },
        /**
         * @method clearLayer
         * @param {String} layerName
         * @returns {Backbone.View}
         */
        clearLayer: function(layerName) {
            this.getLayer(layerName).removeAllChildren();
            this.updateAll();
        },
        /**
         * @method createDisplayStage
         * @returns {CreateJS.Stage}
         */
        createDisplayStage: function() {
            var stage = new createjs.Stage(this.element.display);
            stage.autoClear = true;
            stage.enableDOMEvents(false);
            return stage;
        },
        /**
         * @method createInputStage
         * @returns {CreateJS.Stage}
         */
        createInputStage: function() {
            var stage = new createjs.Stage(this.element.input);
            stage.autoClear = false;
            stage.enableDOMEvents(true);
            return stage;
        },
        /**
         * @method createLayer
         * @param {String} name
         * @returns {CreateJS.Container}
         */
        createLayer: function(name) {
            var layer = new createjs.Container();
            layer.name = 'layer-' + name;
            this.stage.display.addChild(layer);
            return layer;
        },
        /**
         * @method disableInput
         * @returns {Backbone.View}
         */
        disableInput: function() {
            this.$(this.element.input).off('vmousedown.Input');
            this.$(this.element.input).off('vmousemove.Input');
            this.$(this.element.input).off('vmouseout.Input');
            this.$(this.element.input).off('vmouseup.Input');
            return this;
        },
        /**
         * @method drawGrid
         * @param {String} color
         */
        drawGrid: function(color) {
            this.clearLayer('grid');
            var grid = new createjs.Shape();
            color = color ? color : this.gridColor;
            grid.graphics.beginStroke(color).setStrokeStyle(this.gridLineWidth, this.strokeCapStyle, this.strokeJointStyle);
            grid.graphics.moveTo(this.size / 2, 0).lineTo(this.size / 2, this.size);
            grid.graphics.moveTo(0, this.size / 2).lineTo(this.size, this.size / 2);
            grid.graphics.moveTo(0, 0).lineTo(this.size, this.size);
            grid.graphics.moveTo(this.size, 0).lineTo(0, this.size);
            grid.graphics.endStroke();
            this.getLayer('grid').addChild(grid);
            this.stage.display.update();
        },
        /**
         * @method enableInput
         * @returns {Backbone.View}
         */
        enableInput: function() {
            var self = this;
            var stage = this.stage.input;
            var oldPoint, oldMidPoint, points, marker, squig;
            this.disableInput().$(this.element.input).on('vmousedown.Input', down);
            function down() {
                points = [];
                marker = new createjs.Shape();
                squig = new createjs.Shape();
                stage.addChild(marker);
                oldPoint = oldMidPoint = new createjs.Point(stage.mouseX, stage.mouseY);
                self.triggerInputDown(oldPoint);
                self.$(self.element.input).on('vmousemove.Input', move);
                self.$(self.element.input).on('vmouseout.Input', out);
                self.$(self.element.input).on('vmouseup.Input', up);
            }
            function move() {
                var point = {x: stage.mouseX, y: stage.mouseY};
                var midPoint = {x: oldPoint.x + point.x >> 1, y: oldPoint.y + point.y >> 1};
                marker.graphics.clear()
                        .setStrokeStyle(self.strokeSize, self.strokeCapStyle, self.strokeJointStyle)
                        .beginStroke(self.strokeColor)
                        .moveTo(midPoint.x, midPoint.y)
                        .curveTo(oldPoint.x, oldPoint.y, oldMidPoint.x, oldMidPoint.y);
                squig.graphics
                        .setStrokeStyle(self.strokeSize, self.strokeCapStyle, self.strokeJointStyle)
                        .beginStroke(self.strokeColor)
                        .moveTo(midPoint.x, midPoint.y)
                        .curveTo(oldPoint.x, oldPoint.y, oldMidPoint.x, oldMidPoint.y);
                stage.update();
                oldPoint = point;
                oldMidPoint = midPoint;
                points.push(point);
            }
            function out() {
                self.$(self.element.input).off('vmousemove.Input', move);
                self.$(self.element.input).off('vmouseout.Input', out);
                self.$(self.element.input).off('vmouseup.Input', up);
                self.triggerInputUp(null, squig.clone());
                marker.graphics.clear();
                squig.graphics.clear();
                stage.clear();
            }
            function up() {
                self.$(self.element.input).off('vmousemove.Input', move);
                self.$(self.element.input).off('vmouseout.Input', up);
                self.$(self.element.input).off('vmouseup.Input', up);
                self.triggerInputUp(points, squig.clone());
                marker.graphics.clear();
                squig.graphics.clear();
                stage.clear();
            }
            return this;
        },
        /**
         * @method getLayer
         * @param {String} name
         * @returns {CreateJS.Container}
         */
        getLayer: function(name) {
            return this.stage.display.getChildByName('layer-' + name);
        },
        /**
         * @method remove
         */
        remove: function() {
            createjs.Touch.disable(this.stage.input);
            createjs.Ticker.removeEventListener('tick', this.stage.display);
            this.stopListening();
            this.undelegateEvents();
            this.$el.empty();
        },
        /**
         * @method resize
         * @param {Number} size
         * @returns {Backbone.View}
         */
        resize: function(size) {
            this.size = size ? size : skritter.settings.getCanvasSize();
            this.element.holder.style.height = this.size + 'px';
            this.element.holder.style.width = this.size + 'px';
            this.element.display.height = this.size;
            this.element.display.width = this.size;
            this.element.input.height = this.size;
            this.element.input.width = this.size;
            this.drawGrid();
            return this;
        },
        /**
         * @method triggerClick
         * @param {Object} event
         */
        triggerCanvasClick: function(event) {
            this.trigger('canvas:click', event);
        },
        /**
         * @method triggerCanvasClickHold
         * @param {Object} event
         */
        triggerCanvasClickHold: function(event) {
            this.trigger('canvas:clickhold', event);
        },
        /**
         * @method triggerCanvasDoubleClick
         * @param {Object} event
         */
        triggerCanvasDoubleClick: function(event) {
            console.log('clicked');
            this.trigger('canvas:doubleclick', event);
        },
        /**
         * @method triggerCanvasMouseDown
         * @param {Object} event
         */
        triggerCanvasMouseDown: function(event) {
            this.mouseDownEvent = event;
            this.trigger('canvas:mousedown', event);
            if (this.lastMouseDownEvent) {
                var elapsed = this.mouseDownEvent.timeStamp - this.lastMouseDownEvent.timeStamp;
                if (elapsed > 20 && elapsed < 400) {
                    var lastPostion = {x: this.lastMouseDownEvent.pageX, y: this.lastMouseDownEvent.pageY};
                    var currentPosition = {x: this.mouseDownEvent.pageX, y: this.mouseDownEvent.pageY};
                    if (skritter.fn.getDistance(lastPostion, currentPosition) <= 10) {
                        this.triggerCanvasDoubleClick(event);
                    }
                }
            }
            this.$('#canvas-input').on('vmousemove.Canvas', _.bind(function(event) {
                this.mouseMoveEvent = event;
            }, this));
            this.mouseDownTimer = window.setTimeout(_.bind(function() {
                var distance = 0;
                if (this.mouseMoveEvent) {
                    var startPosition = {x: this.mouseDownEvent.pageX, y: this.mouseDownEvent.pageY};
                    var endPosition = {x: this.mouseMoveEvent.pageX, y: this.mouseMoveEvent.pageY};
                    distance = skritter.fn.getDistance(startPosition, endPosition);
                }
                if (distance <= 10) {
                    this.triggerCanvasClickHold(event);
                }
            }, this), 1000);
        },
        /**
         * @method triggerClick
         * @param {Object} event
         */
        triggerCanvasMouseUp: function(event) {
            window.clearTimeout(this.mouseDownTimer);
            this.$('#canvas-input').off('vmousemove.Canvas');
            this.lastMouseDownEvent = this.mouseDownEvent;
            this.mouseMoveEvent = null;
            this.mouseUpEvent = event;
            if (this.mouseDownEvent) {
                var startPosition = {x: this.mouseDownEvent.pageX, y: this.mouseDownEvent.pageY};
                var endPosition = {x: this.mouseUpEvent.pageX, y: this.mouseUpEvent.pageY};
                var distance = skritter.fn.getDistance(startPosition, endPosition);
                var duration = this.mouseUpEvent.timeStamp - this.mouseDownEvent.timeStamp;
                if (distance <= 10 && (duration > 20 && duration < 400)) {
                    this.triggerCanvasClick(event);
                } else {
                    this.trigger('canvas:mouseup', event);
                }
            }
        },
        /**
         * Enables the view to fire events when the canvas has been touched.
         * 
         * @method triggerInputDown
         * @param {Object} point
         */
        triggerInputDown: function(point) {
            this.trigger('input:down', point);
        },
        /**
         * Enables the view to fire events when the canvas touch has been released.
         * 
         * @method triggerInputUp
         * @param {Array} points
         * @param {CreateJS.Shape} shape
         */
        triggerInputUp: function(points, shape) {
            this.trigger('input:up', points, shape);
        },
        /**
         * @method updateAll
         */
        updateAll: function() {
            this.stage.display.clear();
            this.stage.input.clear();
            this.stage.display.update();
            this.stage.input.update();
        }
    });

    return Canvas;
});