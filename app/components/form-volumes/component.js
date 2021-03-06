import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  instance: null,
  primaryService: null,
  launchConfigChoices: null,
  launchConfigIndex: null,
  isService: null,
  allHosts: null,
  errors: null,

  tagName: '',

  didInitAttrs() {
    this.initVolumes();
    this.initVolumesFrom();
    this.initVolumesFromLaunchConfig();
  },

  initVolumesFromLaunchConfig() {
    var dv = this.get('instance.dataVolumesFromLaunchConfigs');
    this.set('initEnabled', dv); 
    this.volumesFromLaunchConfigChanged();
  },

  prevChoices: null,
  initEnabled: null,
  volumesFromLaunchConfigChoices: function() {
    var launchConfigIndex = this.get('launchConfigIndex');
    var prevChoices = this.get('prevChoices')||[];
    var initEnabled = this.get('initEnabled')||[];

    var prev = prevChoices.filterBy('index',-1)[0];
    var enabled = (prev ? prev.enabled : (initEnabled.indexOf(this.get('primaryService.name')) >= 0));

    var out = [];

    if ( launchConfigIndex !== -1 )
    {
      out.push({
        index: -1,
        displayName: this.get('primaryService.name') || '(Primary Service)',
        name: this.get('primaryService.name'),
        enabled: enabled,
      });
    }

    (this.get('primaryService.secondaryLaunchConfigs')||[]).forEach((item, index) => {
      if ( launchConfigIndex !== index )
      {
        prev = prevChoices.filterBy('uiId', item.get('uiId'))[0];
        out.push({
          index: index,
          displayName: item.get('name') || `(Sidekick #${index+1})`,
          name: item.get('name'),
          enabled: (prev ? prev.enabled : (initEnabled.indexOf(item.get('name')) >= 0)),
          uiId: item.get('uiId'),
        });
      }
    });

    this.set('prevChoices', out);
    this.set('initEnabled', null);
    return out;
  }.property('primaryService.name','primaryService.secondaryLaunchConfigs.@each.name','launchConfigIndex'),

  volumesFromLaunchConfigChanged: function() {
    var out = this.get('volumesFromLaunchConfigChoices').filterBy('enabled', true).filterBy('name').map((choice) => { return choice.name; });
    this.set('instance.dataVolumesFromLaunchConfigs', out);
  }.observes('volumesFromLaunchConfigChoices.@each.enabled'),

  actions: {
    addVolume: function() {
      this.get('volumesArray').pushObject({value: ''});
    },
    removeVolume: function(obj) {
      this.get('volumesArray').removeObject(obj);
    },

    addVolumeFrom: function() {
      this.get('volumesFromArray').pushObject({value: ''});
    },
    removeVolumeFrom: function(obj) {
      this.get('volumesFromArray').removeObject(obj);
    },

    addVolumeFromService: function() {
      this.get('volumesFromServiceArray').pushObject({value: ''});
    },
    removeVolumeFromService: function(obj) {
      this.get('volumesFromServiceArray').removeObject(obj);
    },
  },

  // ----------------------------------
  // Volumes
  // ----------------------------------
  volumesArray: null,
  initVolumes: function() {
    var ary = this.get('instance.dataVolumes');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dataVolumes',ary);
    }

    this.set('volumesArray', ary.map(function(vol) {
      return {value: vol};
    }));
  },

  volumesDidChange: function() {
    var out = this.get('instance.dataVolumes');
    out.beginPropertyChanges();
    out.clear();
    this.get('volumesArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('volumesArray.@each.value'),

  // ----------------------------------
  // Volumes From
  // ----------------------------------
  hostContainerChoices: function() {
    var list = [];

    this.get('allHosts').filter((host) => {
      return host.get('id') === this.get('instance.requestedHostId');
    }).map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't mount volumes from other types of instances
        return instance.get('type') === 'container';
      });

      list.pushObjects(containers.map(function(container) {
        return {
          group: 'Host: ' + (host.get('name') || '('+host.get('id')+')'),
          id: container.get('id'),
          name: container.get('name')
        };
      }));
    });

    return list.sortBy('group','name','id');
  }.property('instance.requestedHostId','allHosts.@each.instancesUpdated'),

  volumesFromArray: null,
  initVolumesFrom: function() {
    var ary = this.get('instance.dataVolumesFrom');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dataVolumesFrom',ary);
    }

    this.set('volumesFromArray', ary.map(function(vol) {
      return {value: vol};
    }));
  },

  volumesFromDidChange: function() {
    var out = this.get('instance.dataVolumesFrom');
    out.beginPropertyChanges();
    out.clear();
    this.get('volumesFromArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('volumesFromArray.@each.value'),
});
