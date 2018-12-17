import Vue from 'vue';
import Router from 'vue-router';
import qs from 'qs';

import Root from '@/components/Root';
import ProjectView from '@/components/ProjectView';
import NewReferenceSearch from '@/components/NewReferenceSearch';
import NewReference from '@/components/NewReference';
import EditReference from '@/components/EditReference';
import ReferenceNotes from '@/components/ReferenceNotes';
import ImportReferences from '@/components/ImportReferences';
import Settings from '@/components/Settings';
import SettingsChangePassword from '@/components/SettingsChangePassword';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Root',
      component: Root
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/settings/change-password',
      name: 'SettingsChangePassword',
      component: SettingsChangePassword
    },
    {
      path: '/import/:importToken',
      name: 'ImportExternal',
      component: ImportReferences
    },
    {
      path: '/projects',
      redirect: { name: 'Root' }
    },
    {
      path: '/projects/:projectId',
      name: 'Project',
      component: ProjectView
    },
    {
      path: '/projects/:projectId/citation/new',
      name: 'NewReferenceSearch',
      component: NewReferenceSearch
    },
    {
      path: '/projects/:projectId/citation/new/:sourceId',
      name: 'NewReference',
      component: NewReference
    },
    {
      path: '/projects/:projectId/citation/:referenceId/notes',
      name: 'ReferenceNotes',
      component: ReferenceNotes
    },
    {
      path: '/projects/:projectId/citation/:referenceId/edit/:sourceId',
      name: 'EditReference',
      component: EditReference
    },
    {
      path: '/projects/:projectId/import/:importToken',
      name: 'ImportReferences',
      component: ImportReferences
    }
  ],
  parseQuery (query) {
    return qs.parse(query);
  },
  stringifyQuery (query) {
    let result = qs.stringify(query, {encodeValuesOnly: true});

    return result ? ('?' + result) : '';
  }
});
