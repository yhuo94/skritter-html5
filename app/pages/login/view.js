var GelatoPage = require('gelato/page');
var MarketingFooter = require('components/marketing-footer/view');

/**
 * @class Login
 * @extends {GelatoPage}
 */
module.exports = GelatoPage.extend({
    /**
     * @method initialize
     * @constructor
     */
    initialize: function() {
        this.footer = new MarketingFooter();
        this.navbar = this.createComponent('navbars/marketing');
    },
    /**
     * @property bodyClass
     * @type {String}
     */
    bodyClass: 'background2',
    /**
     * @property title
     * @type {String}
     */
    title: 'Login - Skritter',
    /**
     * @property template
     * @type {Function}
     */
    template: require('./template'),
    /**
     * @method render
     * @returns {Login}
     */
    render: function() {
        this.renderTemplate();
        this.navbar.setElement('#navbar-container').render();
        this.footer.setElement('#footer-container').render();
        if (this.getHeight() < app.getHeight()) {
            this.$('#footer-container').css(
                'margin-top',
                app.getHeight() - this.getHeight() + 4
            );
        }
        return this;
    },
    /**
     * @property events
     * @type {Object}
     */
    events: {
        'keyup #login-password': 'handleKeyUpLoginPassword',
        'click #button-login': 'handleClickLoginButton'
    },
    /**
     * @method handleClickLoginButton
     * @param {Event} event
     */
    handleClickLoginButton: function(event) {
        event.preventDefault();
        this.login();
    },
    /**
     * @method handleKeyUpLoginPassword
     * @param {Event} event
     */
    handleKeyUpLoginPassword: function(event) {
        event.preventDefault();
        if (event.which === 13 || event.keyCode === 13) {
            this.login();
        }
    },
    /**
     * @method login
     * @param {Event} event
     */
    login: function() {
        var self = this;
        var password = this.$('#login-password').val();
        var username = this.$('#login-username').val();
        this.$('#login-message').empty();
        this.$('#login-form').prop('disabled', true);
        app.showLoading();
        app.user.login(username, password, function() {
            app.router.navigate('dashboard', {trigger: false});
            app.reload();
        }, function(error) {
            self.$('#login-message').text(error.responseJSON.message);
            self.$('#login-form').prop('disabled', false);
            app.hideLoading();
        });
    },
    /**
     * @method remove
     * @returns {Login}
     */
    remove: function() {
        return GelatoPage.prototype.remove.call(this);
    }
});
