define([
    'model/user/Data',
    'model/user/Scheduler',
    'model/user/Settings',
    'model/user/Sync'
], function(Data, Scheduler, Settings, Sync) {
    /**
     * @class User
     */
    var Model = Backbone.Model.extend({
        /**
         * @method initialize
         */
        initialize: function() {
            this.data = new Data();
            this.scheduler = new Scheduler();
            this.settings = new Settings();
            this.sync = new Sync();
            //loads models for authenticated active user
            if (window.localStorage.getItem('active')) {
                var userId = window.localStorage.getItem('active');
                this.set(JSON.parse(window.localStorage.getItem(userId)), {silent: true});
                skritter.api.set('token', this.get('access_token'), {silent: true});
                if (window.localStorage.getItem(userId + '-settings')) {
                    this.settings.set(JSON.parse(window.localStorage.getItem(userId + '-settings')), {silent: true});
                }
                if (window.localStorage.getItem(userId + '-sync')) {
                    this.sync.set(JSON.parse(window.localStorage.getItem(userId + '-sync')), {silent: true});
                }
            }
            //set the id identical to the user_id
            this.set('id', this.get('user_id'), {silent: true});
            //immediately cache user settings on change
            this.on('change', _.bind(this.cache, this));
        },
        /**
         * @property {Object} defaults
         */
        defaults: {
            access_token: null,
            expires_in: null,
            refresh_token: null,
            token_type: null,
            user_id: 'guest'
        },
        /**
         * @method cache
         */
        cache: function() {
            skritter.api.set('token', this.get('access_token'), {silent: true});
            this.set('id', this.get('user_id'), {merge: true, silent: true});
            localStorage.setItem(this.get('user_id'), JSON.stringify(this.toJSON()));
        },
        /**
         * @method getLanguageCode
         * @returns {String}
         */
        getLanguageCode: function() {
            var applicationLanguageCode = skritter.settings.get('languageCode');
            if (applicationLanguageCode.indexOf('@@') === -1) {
                return applicationLanguageCode;
            }
            return this.settings.get('targetLang');
        },
        /**
         * Returns true if the target language is set to Chinese.
         * 
         * @method isChinese
         * @returns {Boolean}
         */
        isChinese: function() {
            return this.settings.get('targetLang') === 'zh' ? true : false;
        },
        /**
         * Returns true if the target language is set to Japanese.
         * 
         * @method isJapanese
         * @returns {Boolean}
         */
        isJapanese: function() {
            return this.settings.get('targetLang') === 'ja' ? true : false;
        },
        /**
         * @method isLoggedIn
         * @returns {Boolean}
         */
        isLoggedIn: function() {
            return this.get('access_token') ? true : false;
        },
        /**
         * @method login
         * @param {String} username
         * @param {String} password
         * @param {Function} callback
         */
        login: function(username, password, callback) {
            skritter.api.authenticateUser(username, password, _.bind(function(result, status) {
                if (status === 200) {
                    this.set(result);
                    async.series([
                        _.bind(function(callback) {
                            this.settings.sync(callback);
                        }, this)
                    ], _.bind(function() {
                        window.localStorage.setItem('active', result.user_id);
                        callback(result, status);
                    }, this));
                } else {
                    callback(result, status);
                }
            }, this));
        },
        /**
         * @method logout
         */
        logout: function() {
            skritter.modal.show('logout')
                    .set('.modal-title', 'Are you sure?')
                    .set('.modal-title-icon', null, 'fa-sign-out');
            skritter.modal.element('.modal-footer').hide();
            skritter.modal.element('.modal-button-logout').on('vclick', function() {
                skritter.modal.element('.modal-options').hide(500);
                skritter.modal.element(':input').prop('disabled', true);
                skritter.modal.element('.message').addClass('text-info');
                skritter.modal.element('.message').html("<i class='fa fa-spin fa-cog'></i> Signing Out");
                async.series([
                    function(callback) {
                        skritter.storage.destroy(callback);
                    },
                    function(callback) {
                        window.setTimeout(callback, 2000);
                    }
                ], function() {
                    window.localStorage.removeItem('active');
                    window.localStorage.removeItem(skritter.user.id + '-sync');
                    window.document.location.href = '';
                });
            });
        }
    });

    return Model;
});