var GelatoPage = require('gelato/page');

var AccountSidebar = require('components/account/sidebar/view');
var Coupon = require('models/coupon');
var Subscription = require('models/subscription');
var StripeLoader = require('utils/stripe-loader');

var CancelSubscriptionDialog = require('dialogs/cancel-subscription/view');
var VacationDialog = require('dialogs/vacation/view');

/**
 * @class AccountBillingSubscription
 * @extends {GelatoPage}
 */
module.exports = GelatoPage.extend({
  /**
   * @property events
   * @type {Object}
   */
  events: {
    'change input[name="payment-method"]': 'handleChangePaymentMethod',
    'click #redeem-code-btn': 'handleClickRedeemCodeButton',
    'click #go-on-vacation-link': 'handleClickGoOnVacationLink',
    'click #cancel-vacation-link': 'handleClickCancelVacationLink',
    'click #unsubscribe-itunes-btn': 'handleClickUnsubscribeITunesButton',
    'click #subscribe-stripe-btn': 'handleClickSubscribeStripeButton',
    'click #update-stripe-subscription-btn': 'handleClickUpdateStripeSubscriptionButton',
    'click .spoof-button-area button': 'handleClickSpoofButtonAreaButton',
    'click #unsubscribe-btn': 'handleClickUnsubscribeButton',
    'click #subscribe-paypal-btn': 'handleClickSubscribePaypalButton'
  },

  /**
   * @property template
   * @type {Function}
   */
  template: require('./template'),

  /**
   * @property title
   * @type {String}
   */
  title: 'Billing Subscription - Account - Skritter',

  /**
   * @property paypalPlans
   * @type {Array}
   */
  paypalPlans: [
    {
      key: 'Month Plan',
      fullName: 'Month Plan : $14.99 USD - monthly'
    },
    {
      key: 'Year Plan',
      fullName: 'Year Plan : $99.99 USD - yearly'
    }
  ],

  /**
   * @method initialize
   * @constructor
   */
  initialize: function() {
    StripeLoader.load();
    this.coupon = new Coupon({code: app.getStoredCouponCode() || ''});
    this._views['sidebar'] = new AccountSidebar();
    this.subscription = new Subscription({id: app.user.id});
    this.listenTo(this.subscription, 'state', this.render);
    this.listenTo(this.coupon, 'sync', function(model, response) {
      this.subscription.set(response.Subscription);
      this.coupon.unset('code');
    });
    this.listenTo(this.coupon, 'state', this.render);
    this.subscription.fetch();
  },

  /**
   * @method render
   * @returns {AccountBillingSubscription}
   */
  render: function() {
    this.renderTemplate();
    this._views['sidebar'].setElement('#sidebar-container').render();

    return this;
  },

  /**
   * @method handleChangePaymentMethod
   */
  handleChangePaymentMethod: function() {
    var method = this.$('input[name="payment-method"]:checked').val();
    this.$('.credit-card-form-group').toggleClass('hide', method !== 'stripe');
    this.$('.paypal-form-group').toggleClass('hide', method !== 'paypal');
  },

  /**
   * @method handleClickCancelVacationLink
   */
  handleClickCancelVacationLink: function() {
    this.subscription.save({vacation: false}, {
      parse: true,
      method: 'PUT'
    });

    this.$('#cancel-vacation-spinner').removeClass('hide');
    this.$('#cancel-vacation-link').addClass('hide');
  },

  /**
   * @method handleClickGoOnVacationLink
   */
  handleClickGoOnVacationLink: function() {
    this.openVacationDialog();
  },

  /**
   * @method handleClickRedeemCodeButton
   */
  handleClickRedeemCodeButton: function() {
    this.coupon.set('code', this.$('#code-input').val());
    this.coupon.use();
    this.render();
  },

  /**
   * @method handleClickSpoofButtonAreaButton
   * @param {Event} event
   */
  handleClickSpoofButtonAreaButton: function(event) {
    var subscribed = $(event.target).data('subscribed');
    var client = $(event.target).data('client');
    var discount = $(event.target).data('discount');
    var vacation = $(event.target).data('vacation');
    if (subscribed) {
      // reset first
      this.subscription.set({
        subscribed: false,
        ios: false,
        gplay: false,
        stripe: false,
        anet: false,
        paypal: false
      });
      if (subscribed === 'ios') {
        this.subscription.set({
          subscribed: 'ios',
          ios: {
            'localizedPrice': '£9.99 (localized price test)'
          }
        });
      }
      if (subscribed === 'gplay') {
        this.subscription.set({
          subscribed: 'gplay',
          gplay: {
            'subscription': 'one.month.sub',
            'token': '-- gplay token id --',
            'package': 'com.inkren.skritter.chinese'
          }
        });
      }
      if (subscribed === 'paypal') {
        this.subscription.set({
          subscribed: 'paypal',
          paypal: {
            'plan': 'Month Plan'
          }
        });
      }
      if (subscribed === 'stripe') {
        this.subscription.set({
          subscribed: 'stripe',
          stripe: {
            plan: 'one_month',
            cardNumber: '1234',
            price: '9.99',
            months: 1,
            discount: false
          }
        });
      }
      if (subscribed === 'anet') {
        this.subscription.set({
          subscribed: 'anet',
          stripe: {
            plan: 'one_month',
            cardNumber: '1234',
            price: '9.99',
            months: 1,
            discount: false
          }
        });
      }
    }
    if (client) {
      if (client === 'site') {
        app.isWebsite = function() {
          return true;
        };
        app.isMobile = function() {
          return false;
        };
        app.isAndroid = function() {
          return false;
        };
        app.isIOS = function() {
          return false;
        };
      }
      if (client === 'ios') {
        app.isWebsite = function() {
          return false;
        };
        app.isMobile = function() {
          return true;
        };
        app.isAndroid = function() {
          return false;
        };
        app.isIOS = function() {
          return true;
        };
      }
      if (client === 'android') {
        app.isWebsite = function() {
          return false;
        };
        app.isMobile = function() {
          return true;
        };
        app.isAndroid = function() {
          return true;
        };
        app.isIOS = function() {
          return false;
        };
      }
    }
    if (discount) {
      if (discount === 'on') {
        this.subscription.set({
          discount: {
            price: 4.99,
            expires: "2020-01-01"
          },
          availablePlans: [{
            "name": "1 month",
            "price": "4.99",
            "months": 1,
            "discount": true,
            "key": "one_month",
            "fullName": "$4.99/month (discount)"
          }]
        });
      }
      if (discount === 'off') {
        this.subscription.set({
          discount: false,
          availablePlans: [{
            "name": "1 month",
            "price": "14.99",
            "months": 1,
            "discount": true,
            "key": "one_month",
            "fullName": "$14.99/month"
          }]
        });
      }
    }
    if (vacation) {
      if (vacation === 'on') {
        this.subscription.set({
          vacation: {
            start: moment().subtract('1', 'month').format('YYYY-MM-DD'),
            end: moment().add('1', 'month').format('YYYY-MM-DD')
          }
        });
      }
      if (vacation === 'off') {
        this.subscription.set({vacation: false});
      }
    }
    $(event.target).closest('.list-group').find('button').removeClass('active');
    $(event.target).closest('button').addClass('active');
    this.render();
  },

  /**
   * @method handleClickSubscribePaypalButton
   */
  handleClickSubscribePaypalButton: function() {
    var plan = this.$('#paypal-plan-select').val();
    this.$('#paypal-subscribe-select').val(plan);
    this.$('#paypal-subscribe-form').submit();
  },

  /**
   * @method handleClickSubscribeStripeButton
   */
  handleClickSubscribeStripeButton: function() {
    var cardData = {
      number: this.$('#card-number-input').val(),
      exp_month: this.$('#card-month-select').val(),
      exp_year: this.$('#card-year-select').val()
    };
    var handler = _.bind(this.handleClickSubscribeStripeButtonResponse, this);
    Stripe.setPublishableKey(app.getStripeKey());
    Stripe.card.createToken(cardData, handler);
    this.setSubscribeStripeButtonDisabled(true);
    this.$('#card-error-alert').addClass('hide');
  },

  /**
   * @method this.handleClickSubscribeStripeButtonResponse
   */
  handleClickSubscribeStripeButtonResponse: function(status, response) {
    if (response.error) {
      this.setSubscribeStripeButtonDisabled(false);
      this.$('#card-error-alert')
        .text(response.error.message)
        .removeClass('hide');
    }
    else {
      var token = response.id;
      var url = app.getApiUrl() + this.subscription.url() + '/stripe/subscribe';
      var headers = app.user.session.getHeaders();
      var self = this;
      var data = {
        token: token,
        plan: this.$('#plan-select').val()
      };
      $.ajax({
        url: url,
        headers: headers,
        method: 'POST',
        data: data,
        context: this,
        success: function(response) {
          app.mixpanel.track(
            'Subscribe',
            {
              'Method': 'credit',
              'Plan': data.plan
            }
          );
          self.subscription.set(response.Subscription);
          self.render();
        }
      })
    }
  },

  /**
   * @method handleClickUnsubscribeButton
   */
  handleClickUnsubscribeButton: function() {
    var dialog = new CancelSubscriptionDialog({
      subscription: this.subscription
    });
    dialog.render().open();
    this.listenToOnce(dialog, 'hidden', function() {
      if (dialog.choseVacation) {
        var open = _.bind(this.openVacationDialog, this);
        _.delay(open, 200);
      }
    });
  },

  /**
   * @method handleClickUnsubscribeITunesButton
   */
  handleClickUnsubscribeITunesButton: function() {
    var url = app.getApiUrl() + this.subscription.url() + '/ios/cancel';
    var headers = app.user.session.getHeaders();
    var self = this;

    this.$('#unsubscribe-itunes-btn *').toggleClass('hide');
    $.ajax({
      url: url,
      headers: headers,
      method: 'POST',
      context: this,
      success: function(response) {
        self.subscription.set(response.Subscription);
        self.render();
      }
    });
  },

  /**
   * @method handleClickUpdateStripeSubscriptionButton
   */
  handleClickUpdateStripeSubscriptionButton: function() {
    var cardData = {
      number: this.$('#card-number-input').val(),
      exp_month: this.$('#card-month-select').val(),
      exp_year: this.$('#card-year-select').val()
    };

    if (cardData.number) {
      var handler = _.bind(this.handleClickUpdateStripeSubscriptionButtonResponse, this);
      Stripe.setPublishableKey(app.getStripeKey());
      Stripe.card.createToken(cardData, handler);
      this.setSubscribeStripeButtonDisabled(true);
    } else {
      var url = (app.getApiUrl() + this.subscription.url() + '/stripe');
      var headers = app.user.session.getHeaders();
      var data = {plan: this.$('#plan-select').val()};
      var self = this;
      $.ajax({
        url: url,
        headers: headers,
        method: 'PUT',
        contentType: "application/json",
        data: JSON.stringify(data),
        context: this,
        success: function(response) {
          self.subscription.set(response.Subscription);
          self.render();
        },
        error: function(response) {
          self.setSubscribeStripeButtonDisabled(false);
          self.$('#card-error-alert')
            .text(response.error.message)
            .removeClass('hide');
        }
      });

      this.setSubscribeStripeButtonDisabled(true);
    }

    this.$('#card-error-alert').addClass('hide');
  },

  /**
   * @method this.handleClickSubscribeStripeButtonResponse
   */
  handleClickUpdateStripeSubscriptionButtonResponse: function(status, response) {
    if (response.error) {
      this.setSubscribeStripeButtonDisabled(false);
      this.$('#card-error-alert')
        .text(response.error.message)
        .removeClass('hide');
    } else {
      var self = this;
      var token = response.id;
      var url = (app.getApiUrl() + this.subscription.url() + '/stripe');
      var headers = app.user.session.getHeaders();
      var data = {
        token: token,
        plan: this.$('#plan-select').val()
      };

      $.ajax({
        url: url,
        headers: headers,
        method: 'PUT',
        contentType: "application/json",
        data: JSON.stringify(data),
        context: this,
        success: function(response) {
          self.subscription.set(response.Subscription);
          self.render();
        }
      });
    }
  },

  /**
   * @method openVacationDialog
   */
  openVacationDialog: function() {
    var dialog = new VacationDialog({subscription: this.subscription});
    dialog.render().open();
  },

  /**
   * @method setSubscribeStripeButtonDisabled
   * @param {Boolean} disabled
   */
  setSubscribeStripeButtonDisabled: function(disabled) {
    var button = this.$('#update-stripe-subscription-btn, #subscribe-stripe-btn');
    button.attr('disabled', disabled);
    button.find('span').toggleClass('hide', disabled);
    button.find('i').toggleClass('hide', !disabled);
  }
});
