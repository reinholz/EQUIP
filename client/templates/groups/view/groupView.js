import {getHumanEnvPermission, hasRemovePermission} from "../../../helpers/groups";

Template.groupView.helpers({
  group: function() {
    return this.group;
  },
  myRole: function(group) {
    return group.members.find(u => u.userId === Meteor.userId()).roles.join(', ')
  },
  getEnvOwner: function(envId) {
    let ownerId = Environments.findOne({_id: envId}).userId;
    return Meteor.users.findOne({_id: ownerId}).username;
  },
  getEnvName: function(envId) {
    console.log('getEnvName', envId);
    return Environments.findOne({_id: envId}).envName
  },
  isEnvOwner: function(env) {
    return true;
  },
  getHumanEnvPermission(perm) {
    return getHumanEnvPermission(perm)
  },
  hasRemovePermission(env) {
    return hasRemovePermission(env, this.group);
  }
});

Template.groupView.onCreated(function() {
  console.log('this before', this.data);
  let group_ids = this.data.group.environments.map(env => env.envId);
  console.log('ret', group_ids)
  this.data.environments = Environments.find({_id: {$in: group_ids}}).fetch()
  console.log('this', this.data);
})

Template.envShareTypeChanger.helpers({
  viewChecked: function() {
    return this.env.share_type === 'view' ? 'checked' : ''
  },
  editChecked: function() {
    return this.env.share_type === 'edit' ? 'checked' : ''
  },
  getHumanEnvPermission(perm) {
    return getHumanEnvPermission(perm)
  },
})


Template.envAddForm.helpers({
  autocompleteSettings: function() {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          collection: 'autocompleteEnvironments',
          subscription: 'autocompleteEnvironments',
          field: 'envName',
          template: Template.envAutocompleteOption,
          noMatchTemplate: Template.noAutocompleteAvailable,
          selector: function(match) {
            let regex = new RegExp(match, 'i');
            return {
              $or: [ {
                'envName': regex
              }
              ]
            };
          },
        }
      ]
    }
  },
  getHumanEnvPermission(perm) {
    return getHumanEnvPermission(perm)
  },
})

Template.groupView.events = {
  'autocompleteselect .environment-add-form__input': function(e, template, doc) {
    console.log('temp, doc', template, doc);
    let share_type = $('input[name="env-share-type"]:checked').attr('data-share-type')

    console.log(doc._id, template.data.group._id, share_type);
    Meteor.call('addEnvToGroup', doc._id, template.data.group._id, share_type)
    $('.classroom-add-form__input').val('');
  }
}

Template.removeEnvButton.events = {
  'click .remove-env-from-group': function(e, template, doc) {
    console.log('temp, doc', template, doc);
    Meteor.call('removeEnvFromGroup', doc._id, template.data.group._id)
  }
}