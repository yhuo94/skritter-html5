define([
    'view/Home',
    'view/Landing',
    'view/Login',
    'view/Study',
    'view/study/Settings',
    'view/Test',
    'view/vocab/Info'
], function(HomeView, LandingView, LoginView, StudyView, StudySettings, TestView, VocabInfoView) {
    /**
     * @class Router
     */
    var Router = Backbone.Router.extend({
        /**
         * @method initialize
         */
        initialize: function() {
            this.container = $('.skritter-container');
            this.history = [];
            this.view = null;
            Backbone.history.start();
            window.document.addEventListener('backbutton', _.bind(this.handleBackButtonPressed, this), false);
        },
        /**
         * @property {Object} routes
         */
        routes: {
            '': 'showHome',
            'login': 'showLogin',
            'study': 'showStudy',
            'study/settings': 'showStudySettings',
            'test': 'showTest',
            'vocab/info/:languageCode/:writing': 'showVocabInfo'
        },
        /**
         * @method addHistory
         * @param {String} path
         */
        addHistory: function(path) {
            if (this.history.indexOf(path) === -1) {
               this.history.unshift(path);
            }
        },
        /**
         * @method back
         */
        back: function() {
            this.navigate(this.history[0], {replace: true, trigger: true});
        },
        /**
         * @method handleBackButtonPressed
         * @param {Object} event
         */
        handleBackButtonPressed: function(event) {
            var fragment = Backbone.history.fragment;
            if (this.view.elements.sidebar && this.view.elements.sidebar.hasClass('expanded')) {
                this.view.toggleSidebar();
            } else if (fragment === '') {
                skritter.modal.show('exit')
                        .set('.modal-title', 'Are you sure?')
                        .set('.modal-title-icon', null, 'fa-sign-out');
                skritter.modal.element('.modal-button-ok').on('vclick', function() {
                    window.navigator.app.exitApp();
                });
            } else {
                window.history.back();
            }
            event.preventDefault();
        },
        /**
         * @method showHome
         */
        showHome: function() {
            this.reset();
            this.addHistory('');
            if (skritter.user.isLoggedIn()) {
                this.view = new HomeView({el: this.container});
            } else {
                this.view = new LandingView({el: this.container});
            }
            this.view.render();
        },
        /**
         * @method showLogin
         */
        showLogin: function() {
            if (!skritter.user.isLoggedIn()) {
                this.reset();
                this.view = new LoginView({el: this.container});
                this.view.render();
            } else {
                this.navigate('login', {replace: true, trigger: true});
            }
        },
        /**
         * @method showStudy
         */
        showStudy: function() {
            if (skritter.user.isLoggedIn()) {
                this.reset();
                this.addHistory('study');
                this.view = new StudyView({el: this.container});
                this.view.render();
            } else {
                this.navigate('', {replace: true, trigger: true});
            }
        },
        /**
         * @method showStudySettings
         */
        showStudySettings: function() {
            if (skritter.user.isLoggedIn()) {
                this.reset();
                this.view = new StudySettings({el: this.container});
                this.view.render();
            } else {
                this.navigate('', {replace: true, trigger: true});
            }
        },
        /**
         * @method showTest
         */
        showTest: function() {
            this.reset();
            this.view = new TestView({el: this.container});
            this.view.render();
        },
        /**
         * @method showVocabInfo
         * @param {String} languageCode
         * @param {String} writing
         */
        showVocabInfo: function(languageCode, writing) {
            if (skritter.user.isLoggedIn()) {
                this.reset();
                this.view = new VocabInfoView({el: this.container});
                this.view.set(languageCode, writing);
                this.view.render();
            } else {
                this.navigate('', {replace: true, trigger: true});
            }
        },
        /**
         * @method reset
         */
        reset: function() {
            if (this.view) {
                this.view.remove();
                this.view = undefined;
            }
        }
    });

    return Router;
});