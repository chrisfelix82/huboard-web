import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import correlationId from './utilities/correlation-id';
import ajax from 'ic-ajax';

Ember.MODEL_FACTORY_INJECTIONS = true;

Ember.LinkView.reopen({
  init: function(){
    this._super.apply(this, arguments);

    this.on("click", this, this._closeDropdown);
  },
  tearDownEvent: function(){
    this.off("click");
  }.on("willDestroyElement"),
  _closeDropdown : function() {
    this.$().parents(".dropdown").removeClass("open");
  }
});

var HuBoard = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  rootElement: "#application",
  dimFilters: [],
  hideFilters: [],
  searchFilter: null,
  memberFilter: null,
  eventReceived: 0
});

loadInitializers(HuBoard, config.modulePrefix);

export default HuBoard;
