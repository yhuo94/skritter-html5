/**
 * @module Application
 */
define([
    'framework/BasePage',
    'require.text!templates/desktop/account.html'
], function(BasePage, TemplateDesktop) {
    /**
     * @class PageAccount
     * @extends BasePage
     */
    var PageAccount = BasePage.extend({
        /**
         * @method initialize
         */
        initialize: function() {
            this.title = app.strings.account.title;
            this.settings = app.user.settings;
        },
        /**
         * @method render
         * @returns {PageAccount}
         */
        render: function() {
            this.$el.html(this.compile(TemplateDesktop));
            this.elements.accountCountry = this.$('#account-country');
            this.elements.accountDisplayName = this.$('#account-displayname');
            this.elements.accountID = this.$('#account-id');
            this.elements.accountEmail = this.$('#account-email');
            this.elements.accountTimezone = this.$('#account-timezone');
            this.renderElements();
            return this;
        },
        /**
         * @method renderElements
         * @returns {PageAccount}
         */
        renderElements: function() {
            this.elements.accountCountry.val(this.settings.get('country'));
            this.elements.accountID.val(this.settings.get('id'));
            this.elements.accountDisplayName.val(this.settings.get('name'));
            this.elements.accountEmail.val(this.settings.get('email'));
            this.loadTimezones();
            return this;
        },
        /**
         * @method loadTimezones
         * @returns {PageAccount}
         */
        loadTimezones: function() {
            var options = [];
            var timezones = moment.tz.names();
            for (var i = 0, length = timezones.length; i < length; i++) {
                var option = "<option value='" + timezones[i] + "'>";
                option += timezones[i] + ' | ' + moment().tz(timezones[i]).format('HH:mm');
                option += "</option>";
                options.push(option);
            }
            this.elements.accountTimezone.html(options);
            this.elements.accountTimezone.val(this.settings.get('timezone'));
            return this;
        }
    });

    return PageAccount;
});
