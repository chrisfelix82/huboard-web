import Ember from 'ember';
import SortableMixin from "app/mixins/cards/sortable";

var HbColumnComponent = Ember.Component.extend(SortableMixin, {
  classNames: ["column"],
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering", "isTaskColumn:hb-task-column", "isTaskColumn:task-column"],
  isTaskColumn: true,
  cards: Ember.A(),

  columns: Ember.computed.alias("model.board.columns"),
  sortedIssues: function(){
    var issues = this.get("model.board.issues")
      .filter(this.filterStrategy.bind(this))
      .sort(this.sortStrategy);
    return issues;
  }.property("issues.@each.{columnIndex,order,state}"),
  filterStrategy: function(issue){
    var issue_index = issue.data.current_state.index;
    var same_column = issue_index === this.get("model.data.index");
    if(this.get("isLastColumn")){
      return same_column || (issue.data.state === "closed" && !issue.get("isArchived"));
    }
    return same_column && issue.data.state !== "closed";
  },
  sortStrategy: function(a,b){
    if(a.data._data.order === b.data._data.order){
      if(a.repo.full_name === b.repo.full_name){
        return a.number - b.number;
      }
      return a.repo.full_name - b.repo.full_name;
    }
    return a.data._data.order - b.data._data.order;
  },
  moveIssue: function(issue, order, cancelMove){
    var self = this;
    var last = this.get("columns.lastObject");
    if(issue.data.state === "closed" && !this.get("isLastColumn")){
      return this.attrs.reopenIssueOrAbort({
        issue: issue,
        column: self.get("model"),
        onAccept: function(){ self.moveIssue(issue, order); },
        onReject: function(){ cancelMove() }
      })
    }

    this.get("sortedIssues").removeObject(issue);
    Ember.run.schedule("afterRender", self, function(){
      issue.reorder(order, self.get("model"));
    });
  },

  isCollapsed: Ember.computed({
    get: function(){
      return this.get("settings.taskColumn" + this.get("model.data.index") + "Collapsed");
    },
    set: function(key, value){
      this.set("settings.taskColumn" + this.get("model.data.index") + "Collapsed", value);
      return value;
    }
  }).property(),
  isLastColumn: function(){
    return this.get("columns.lastObject.data.name") === this.get("model.data.name");
  }.property("columns.lastObject"),
  isFirstColumn: function(){
    return this.get("columns.firstObject.data.name") === this.get("model.data.name");
  }.property("columns.firstObject"),
  isCreateVisible: Ember.computed.alias("isFirstColumn"),
  topOrderNumber: function(){
    var issues = this.get("sortedIssues");
    var milestone_issues = this.get("issues").sort(function(a,b){
      return a.data._data.milestone_order - b.data._data.milestone_order;
    });
    if(issues.length){
      return {
        order: issues.get("firstObject.data._data.order") / 2,
        milestone_order: milestone_issues.get("firstObject.data._data.milestone_order") / 2
      };
    } else {
      return {};
    }
  }.property("sortedIssues.[]"),

  registerWithController: function(){
    var _self = this;
    Ember.run.schedule("afterRender", this, function(){
      _self.attrs.registerColumn(_self);
    });
  }.on("didInsertElement"),
  unregisterWithController: function(){
    var _self = this;
    Ember.run.schedule("afterRender", this, function(){
      _self.attrs.unregisterColumn(_self);
    });
  }.on("willDestroyElement"),
  wireupIsCollapsed: function(){
    var self = this;
    this.$(".collapsed").click(function(){
      self.toggleProperty("isCollapsed");
    });
  }.on("didInsertElement"),

  disableModalOnHrefs: function () {
    this._super();
    this.$("a, .clickable").on("click.hbcard", function (ev){ ev.stopPropagation(); } );
  }.on("didInsertElement"),
  tearDownEvents: function () {
    this.$("a, .clickable").off("click.hbcard");
    return this._super();
  }.on("willDestroyElement") 
});

export default HbColumnComponent;
