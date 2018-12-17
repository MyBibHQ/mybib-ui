import axios from 'axios';

import AccessToken from '@/services/accessToken.js';
import Project from '@/classes/Project.js';

import {BASE_API_URL} from '@/config.js';

export default class User {
  id;
  hasRegistered = false;
  language;
  email;
  firstName;
  projects = [];

  isLoading = true;
  isReady = false;
  wasError = false;

  _lastDeletedProject = {};

  async init () {
    let user;

    this.isLoading = true;

    if (AccessToken.get()) {
      // they have a token so try and load the user with it
      try {
        const response = await axios.get(BASE_API_URL + '/users/me', { headers: {'Access-Token': AccessToken.get()} });
        user = response.data.user;
      } catch (error) {
        console.log(error);
      }
    }

    if (!user) {
      // accessToken was empty or didn't work, create a new user
      const newUser = await this._createNewUser();
      if (newUser) {
        AccessToken.set(newUser.accessToken);
        user = newUser.user;
      }
    }

    if (!user) {
      // still didn't work, either server is down or there's no connection
      this.wasError = true;
      this.isLoading = false;
      return this;
    }

    // we got a user
    Object.assign(this, user);

    await this.loadProjects();

    this.isReady = true;
    this.isLoading = false;

    return this;
  }

  async save () {
    try {
      await axios.put(BASE_API_URL + '/users/me', { email: this.email }, { headers: { 'Access-Token': AccessToken.get() } })
      return true;
    } catch (error) {
      return false;
    }
  }

  async changePassword (newPassword) {
    try {
      await axios.put(BASE_API_URL + '/users/me/change-password', { newPassword: newPassword }, { headers: { 'Access-Token': AccessToken.get() } })
      return true;
    } catch (error) {
      return false;
    }
  }

  async loadProjects () {
    try {
      const response = await axios.get(BASE_API_URL + '/projects', { headers: { 'Access-Token': AccessToken.get() } });
      this.projects = response.data.projects.map((p) => {
        return Object.assign(new Project(), p)
      });
      const projectsToLoad = this.projects.map((p) => {
        return p.loadReferences();
      })
      await Promise.all(projectsToLoad);
    } catch (error) {
      // error
    }
  }

  async addProject (project) {
    const response = await axios.post(BASE_API_URL + '/projects', { title: project.title, styleId: project.styleId }, { headers: { 'Access-Token': AccessToken.get() } });
    const newProject = Object.assign(new Project(), response.data.project);

    this.projects.unshift(newProject);

    this.saveProjectOrder();

    return newProject;
  }

  async saveProjectOrder () {
    await axios.put(BASE_API_URL + '/projects/order', { projectOrders: this.projects.map((p) => {
      return { id: p.id, order: this.projects.indexOf(p) };
    })}, { headers: { 'Access-Token': AccessToken.get() } });
  }

  async deleteProject (project) {
    const projectIndex = this.projects.indexOf(project);
    const removedProject = this.projects.splice(projectIndex, 1)[0];

    try {
      await axios.delete(BASE_API_URL + '/projects/' + project.id, { headers: { 'Access-Token': AccessToken.get() } })
      this._lastDeletedProject = {
        index: projectIndex,
        project: removedProject
      };
    } catch (error) {
      // it failed, put it back
      this.projects.splice(projectIndex, 0, removedProject);
    }
  }

  restoreLastDeletedProject () {
    const lastDeletedProject = this._lastDeletedProject;
    this.projects.splice(lastDeletedProject.index, 0, lastDeletedProject.project);

    axios.put(BASE_API_URL + '/projects/' + lastDeletedProject.project.id + '/restore', { }, { headers: { 'Access-Token': AccessToken.get() } })
      .then(() => {
        // it worked. Nothing to do
      }, () => {
        // it failed. remove it again
        this.projects.splice(lastDeletedProject.index, 1);
      })

    this.saveProjectOrder();

    this._lastDeletedProject = {};
    return lastDeletedProject.project;
  }

  async _createNewUser () {
    let newUser;
    try {
      const response = await axios.post(BASE_API_URL + '/users/create');
      newUser = response.data
    } catch (error) {}

    return newUser;
  }
}
